/**
 * Sent with every page. The dashboard is never meant to be framed by another
 * site — a framed dashboard can be overlaid and clicked through without the
 * operator noticing — so only this origin may frame it (the widget preview
 * does, from the same origin).
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "react-markdown", "remark-gfm"],
  devIndicators: false,
  turbopack: {
    resolveAlias: {
      "shadcn/tailwind.css":
        "../../packages/ui/node_modules/shadcn/dist/tailwind.css",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
