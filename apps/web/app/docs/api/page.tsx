import type { Metadata } from "next"

import { ApiDocs } from "@/modules/marketing/ui/components/api-docs/api-docs"

export const metadata: Metadata = {
  title: "API documentation",
  description:
    "Build on Osonflow: start AI chats from your own app, sync conversations and contacts, manage the knowledge base, assistants, tools and workflows, and receive webhooks.",
  alternates: { canonical: "/docs/api" },
  openGraph: {
    title: "API documentation | Osonflow",
    description:
      "Everything your team does in Osonflow, from your own code — with every endpoint, permission and limit documented.",
    url: "/docs/api",
    type: "website",
  },
}

/**
 * The API is served by the Convex deployment's HTTP host. A custom domain in
 * front of it can be announced with NEXT_PUBLIC_DEVELOPER_API_URL; otherwise
 * the address is derived from the deployment the app itself talks to.
 */
const getApiBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_DEVELOPER_API_URL?.trim()

  if (configured) {
    return configured.replace(/\/$/, "")
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim()

  if (convexUrl) {
    try {
      const url = new URL(convexUrl)
      url.hostname = url.hostname.replace(/\.convex\.cloud$/, ".convex.site")
      return `${url.origin}/v1`
    } catch {
      // Fall through to the placeholder below.
    }
  }

  return "https://<your-deployment>.convex.site/v1"
}

const Page = () => <ApiDocs baseUrl={getApiBaseUrl()} />

export default Page
