import type { Metadata } from "next"

import { ProductDocs } from "@/modules/marketing/ui/components/docs/product-docs"

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "How to set up and run Osonflow: teach the assistant, put it on your website, Telegram, Instagram and WhatsApp, work the inbox and automate with workflows.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Documentation | Osonflow",
    description:
      "Set up an AI assistant that answers your customers, then run it day to day with your team.",
    url: "/docs",
    type: "website",
  },
}

const Page = () => <ProductDocs />

export default Page
