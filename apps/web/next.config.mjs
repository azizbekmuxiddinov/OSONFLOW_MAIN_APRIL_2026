// Response headers for the authenticated dashboard. Scoped to this app on
// purpose: the widget app is meant to be embedded on customer sites, so it must
// stay framable and is left alone. These are the headers that do not depend on
// knowing every script/style source, so they cannot break Clerk, Convex or
// Next; a full script-restricting CSP is intentionally not set here.
const securityHeaders = [
  // Clickjacking: the dashboard carries a signed-in session, so it may only be
  // framed by itself (the customization view embeds its own widget-preview).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
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
