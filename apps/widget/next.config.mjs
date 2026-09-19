import process from "node:process"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace(/\/$/, "")

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  // Loaded at runtime by @vercel/functions for the Convex sync relay.
  serverExternalPackages: ["ws"],
  devIndicators: false,
  turbopack: {
    resolveAlias: {
      "shadcn/tailwind.css":
        "../../packages/ui/node_modules/shadcn/dist/tailwind.css",
    },
  },
  // Same-origin paths for Convex files, used by browsers in relay mode (see
  // packages/ui/src/lib/convex-url.ts). The sync socket has its own route.
  async rewrites() {
    if (!convexUrl) {
      return []
    }

    return [
      {
        source: "/convex/api/storage/:path*",
        destination: `${convexUrl}/api/storage/:path*`,
      },
      {
        source: "/convex-site/chat-attachment/:path*",
        destination: `${convexUrl.replace(/\.convex\.cloud$/, ".convex.site")}/chat-attachment/:path*`,
      },
    ]
  },
}

export default nextConfig
