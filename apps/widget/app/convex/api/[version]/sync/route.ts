import { experimental_upgradeWebSocket } from "@vercel/functions"
import WebSocket, { type RawData } from "ws"

// Relays the Convex sync socket for browsers whose network resets connections
// to *.convex.cloud (see packages/ui/src/lib/convex-url.ts). It runs beside the
// eu-west-1 deployment so the extra hop costs almost nothing.
export const preferredRegion = "dub1"
export const dynamic = "force-dynamic"

const SYNC_VERSION = /^\d+\.\d+\.\d+$/

// Convex accepts arguments far larger than the 256 KiB default.
const MAX_PAYLOAD_BYTES = 16 * 1024 * 1024

// 1005, 1006 and 1015 describe a close but may not be sent in one.
const toSendableCloseCode = (code: number) =>
  code === 1000 || (code >= 3000 && code <= 4999) ? code : 1011

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ version: string }> }
) {
  const { version } = await params
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

  if (!convexUrl || !SYNC_VERSION.test(version)) {
    return new Response("Not found", { status: 404 })
  }

  const upstreamUrl = `${convexUrl.replace(/^http/, "ws")}/api/${version}/sync`

  return experimental_upgradeWebSocket(
    (client) => {
      const upstream = new WebSocket(upstreamUrl, {
        maxPayload: MAX_PAYLOAD_BYTES,
      })
      const pending: Array<[RawData, boolean]> = []

      // The sync protocol is JSON text, so frames keep their type both ways.
      client.on("message", (data, isBinary) => {
        if (upstream.readyState === WebSocket.OPEN) {
          upstream.send(data, { binary: isBinary })
        } else {
          pending.push([data, isBinary])
        }
      })

      upstream.on("open", () => {
        for (const [data, binary] of pending.splice(0)) {
          upstream.send(data, { binary })
        }
      })

      upstream.on("message", (data, isBinary) => {
        client.send(data, { binary: isBinary })
      })

      upstream.on("close", (code, reason) => {
        client.close(toSendableCloseCode(code), reason)
      })

      client.on("close", (code, reason) => {
        if (upstream.readyState === WebSocket.CONNECTING) {
          upstream.terminate()
        } else {
          upstream.close(toSendableCloseCode(code), reason)
        }
      })

      upstream.on("error", () => client.terminate())
      client.on("error", () => upstream.terminate())
    },
    { maxPayload: MAX_PAYLOAD_BYTES }
  )
}
