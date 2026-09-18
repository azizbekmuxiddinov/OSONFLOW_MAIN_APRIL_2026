/**
 * Rewraps a WebM/Opus recording as Ogg/Opus without re-encoding.
 *
 * Chrome and Edge's MediaRecorder can only produce WebM, but Telegram shows a
 * file as a voice note (the bubble with a waveform) only when it is Ogg/Opus.
 * The audio inside is already Opus, so it only needs a different container:
 * pull the Opus packets out of the WebM blocks and write them as Ogg pages.
 *
 * Handles what MediaRecorder writes — a single audio track, unknown-size
 * Segment and Cluster elements, and unlaced SimpleBlocks — and throws on
 * anything else rather than producing a file that will not play.
 */

// Matroska element ids, with their length marker bits kept.
const EBML_ID = {
  segment: 0x18538067,
  tracks: 0x1654ae6b,
  trackEntry: 0xae,
  codecId: 0x86,
  codecPrivate: 0x63a2,
  cluster: 0x1f43b675,
  blockGroup: 0xa0,
  block: 0xa1,
  simpleBlock: 0xa3,
} as const

/** Elements whose children we need, so the walk steps into them. */
const CONTAINER_IDS = new Set<number>([
  EBML_ID.segment,
  EBML_ID.tracks,
  EBML_ID.trackEntry,
  EBML_ID.cluster,
  EBML_ID.blockGroup,
])

const OPUS_SAMPLE_RATE = 48_000
/** Ogg allows at most 255 lacing values in one page. */
const MAX_SEGMENTS_PER_PAGE = 255

type Vint = { value: number; length: number; isUnknownSize: boolean }

const readVint = (
  bytes: Uint8Array,
  offset: number,
  keepMarker: boolean
): Vint | null => {
  const first = bytes[offset]

  if (first === undefined || first === 0) {
    return null
  }

  let length = 1
  let marker = 0x80

  while (!(first & marker)) {
    marker >>= 1
    length += 1
  }

  if (offset + length > bytes.length) {
    return null
  }

  const firstValueBits = first & (marker - 1)
  let value = keepMarker ? first : firstValueBits
  let isUnknownSize = firstValueBits === marker - 1

  for (let index = 1; index < length; index += 1) {
    const byte = bytes[offset + index]!
    value = value * 256 + byte

    if (byte !== 0xff) {
      isUnknownSize = false
    }
  }

  return { value, length, isUnknownSize: !keepMarker && isUnknownSize }
}

const ascii = (text: string) => new TextEncoder().encode(text)

const startsWithAscii = (bytes: Uint8Array, text: string) =>
  text.split("").every((char, index) => bytes[index] === char.charCodeAt(0))

/** Samples (at 48 kHz) one Opus packet decodes to, from its TOC byte (RFC 6716 §3.1). */
const opusPacketSampleCount = (packet: Uint8Array) => {
  const toc = packet[0]

  if (toc === undefined) {
    return 0
  }

  const config = toc >> 3
  const frameSamples =
    config < 12
      ? [480, 960, 1920, 2880][config % 4]!
      : config < 16
        ? [480, 960][config % 2]!
        : [120, 240, 480, 960][config % 4]!
  const frameCountCode = toc & 0x03
  const frameCount =
    frameCountCode === 0
      ? 1
      : frameCountCode === 3
        ? (packet[1] ?? 0) & 0x3f
        : 2

  return frameSamples * frameCount
}

/** Pulls the Opus header and packets out of a WebM file. */
const readWebmOpus = (bytes: Uint8Array) => {
  let opusHead: Uint8Array | null = null
  let codecId: string | null = null
  let trackNumber: number | null = null
  const packets: Uint8Array[] = []
  let offset = 0

  while (offset < bytes.length) {
    const id = readVint(bytes, offset, true)

    if (!id) {
      break
    }

    const size = readVint(bytes, offset + id.length, false)

    if (!size) {
      break
    }

    const dataStart = offset + id.length + size.length

    if (CONTAINER_IDS.has(id.value)) {
      offset = dataStart
      continue
    }

    if (size.isUnknownSize) {
      throw new Error("Unsupported WebM layout")
    }

    const dataEnd = dataStart + size.value

    // MediaRecorder's last chunk can end mid-element if the recorder was
    // stopped abruptly; everything complete before it is still usable.
    if (dataEnd > bytes.length) {
      break
    }

    if (id.value === EBML_ID.codecId) {
      codecId = new TextDecoder().decode(bytes.subarray(dataStart, dataEnd))
    } else if (id.value === EBML_ID.codecPrivate) {
      opusHead = bytes.slice(dataStart, dataEnd)
    } else if (
      id.value === EBML_ID.simpleBlock ||
      id.value === EBML_ID.block
    ) {
      const track = readVint(bytes, dataStart, false)

      if (!track) {
        throw new Error("Malformed WebM block")
      }

      // Track number, then a 16-bit timecode and a flags byte.
      const headerEnd = dataStart + track.length + 3
      const flags = bytes[headerEnd - 1] ?? 0

      if ((flags >> 1) & 0x03) {
        throw new Error("Laced WebM blocks are not supported")
      }

      trackNumber ??= track.value

      if (track.value === trackNumber && headerEnd < dataEnd) {
        packets.push(bytes.subarray(headerEnd, dataEnd))
      }
    }

    offset = dataEnd
  }

  if (codecId !== null && codecId !== "A_OPUS") {
    throw new Error(`Expected Opus audio, got ${codecId}`)
  }

  if (packets.length === 0) {
    throw new Error("The recording has no audio")
  }

  return { opusHead, packets }
}

const buildOpusHead = () => {
  const head = new Uint8Array(19)
  const view = new DataView(head.buffer)
  head.set(ascii("OpusHead"), 0)
  head[8] = 1 // version
  head[9] = 1 // channel count
  view.setUint16(10, 0, true) // pre-skip
  view.setUint32(12, OPUS_SAMPLE_RATE, true)
  view.setInt16(16, 0, true) // output gain
  head[18] = 0 // channel mapping family
  return head
}

const buildOpusTags = () => {
  const vendor = ascii("osonflow")
  const tags = new Uint8Array(8 + 4 + vendor.length + 4)
  const view = new DataView(tags.buffer)
  tags.set(ascii("OpusTags"), 0)
  view.setUint32(8, vendor.length, true)
  tags.set(vendor, 12)
  view.setUint32(12 + vendor.length, 0, true) // no user comments
  return tags
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)

  for (let index = 0; index < 256; index += 1) {
    let remainder = index << 24

    for (let bit = 0; bit < 8; bit += 1) {
      remainder =
        remainder & 0x80000000
          ? (remainder << 1) ^ 0x04c11db7
          : remainder << 1
    }

    table[index] = remainder >>> 0
  }

  return table
})()

const oggCrc = (bytes: Uint8Array) => {
  let crc = 0

  for (const byte of bytes) {
    crc = ((crc << 8) ^ CRC_TABLE[((crc >>> 24) ^ byte) & 0xff]!) >>> 0
  }

  return crc
}

const lacingValuesFor = (packet: Uint8Array) => {
  const values = new Array<number>(Math.floor(packet.length / 255)).fill(255)
  // A packet whose length is a multiple of 255 still needs a closing value.
  values.push(packet.length % 255)
  return values
}

const writeOggPage = ({
  packets,
  granulePosition,
  headerType,
  serialNumber,
  sequenceNumber,
}: {
  packets: Uint8Array[]
  granulePosition: bigint
  headerType: number
  serialNumber: number
  sequenceNumber: number
}) => {
  const lacing = packets.flatMap(lacingValuesFor)
  const bodyLength = packets.reduce((total, packet) => total + packet.length, 0)
  const page = new Uint8Array(27 + lacing.length + bodyLength)
  const view = new DataView(page.buffer)

  page.set(ascii("OggS"), 0)
  page[4] = 0 // stream structure version
  page[5] = headerType
  view.setBigUint64(6, granulePosition, true)
  view.setUint32(14, serialNumber, true)
  view.setUint32(18, sequenceNumber, true)
  // Bytes 22–25 hold the CRC, computed over the page with them zeroed.
  page[26] = lacing.length
  page.set(lacing, 27)

  let cursor = 27 + lacing.length

  for (const packet of packets) {
    page.set(packet, cursor)
    cursor += packet.length
  }

  view.setUint32(22, oggCrc(page), true)

  return page
}

const HEADER_TYPE = { beginningOfStream: 0x02, endOfStream: 0x04 } as const

export const webmOpusToOgg = (webm: Uint8Array): Uint8Array<ArrayBuffer> => {
  const { opusHead, packets } = readWebmOpus(webm)
  const serialNumber = Math.floor(Math.random() * 0xffffffff) >>> 0
  const pages: Uint8Array[] = []
  let sequenceNumber = 0

  const head =
    opusHead && startsWithAscii(opusHead, "OpusHead") ? opusHead : buildOpusHead()

  pages.push(
    writeOggPage({
      packets: [head],
      granulePosition: 0n,
      headerType: HEADER_TYPE.beginningOfStream,
      serialNumber,
      sequenceNumber: sequenceNumber++,
    })
  )
  pages.push(
    writeOggPage({
      packets: [buildOpusTags()],
      granulePosition: 0n,
      headerType: 0,
      serialNumber,
      sequenceNumber: sequenceNumber++,
    })
  )

  // The granule position counts every decoded sample, pre-skip included.
  let granulePosition = 0n
  let pagePackets: Uint8Array[] = []
  let pageSegments = 0

  const flushPage = (isLast: boolean) => {
    pages.push(
      writeOggPage({
        packets: pagePackets,
        granulePosition,
        headerType: isLast ? HEADER_TYPE.endOfStream : 0,
        serialNumber,
        sequenceNumber: sequenceNumber++,
      })
    )
    pagePackets = []
    pageSegments = 0
  }

  for (const packet of packets) {
    const segments = lacingValuesFor(packet).length

    if (pageSegments + segments > MAX_SEGMENTS_PER_PAGE) {
      flushPage(false)
    }

    pagePackets.push(packet)
    pageSegments += segments
    granulePosition += BigInt(opusPacketSampleCount(packet))
  }

  flushPage(true)

  const output = new Uint8Array(
    pages.reduce((total, page) => total + page.length, 0)
  )
  let cursor = 0

  for (const page of pages) {
    output.set(page, cursor)
    cursor += page.length
  }

  return output
}
