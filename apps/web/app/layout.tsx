import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Chakra_Petch, Inter, Lora, Roboto_Mono } from "next/font/google"
import "@workspace/ui/styles/globals.css"
import "./globals.css"
import { CookieConsent } from "@/components/cookie-consent"
import { Providers } from "@/components/theme-provider"
import { appPath } from "@/lib/urls"
import { cn } from "@workspace/ui/lib/utils"
import { Toaster } from "@workspace/ui/components/sonner"

// Note: `alternates.canonical` is deliberately NOT set here. Metadata is merged
// down the tree, so a canonical on the root layout would silently point every
// page that forgot to override it at the same URL. Each page sets its own.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.osonflow.uz"),
  title: {
    default: "Osonflow — AI customer support for chat and voice",
    template: "%s | Osonflow",
  },
  description:
    "Osonflow answers your customers on chat and voice from your own help docs, prices, and policies — and hands the conversation to your team, with the full history, the moment a person is needed.",
  applicationName: "Osonflow",
  referrer: "origin-when-cross-origin",
  openGraph: {
    siteName: "Osonflow",
    type: "website",
    locale: "en",
    alternateLocale: ["uz", "ru"],
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Osonflow — AI customer support for chat and voice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

// The three families the design system names: Chakra Petch for UI, Lora for
// display serif, Roboto Mono for code and tabular figures. Chakra Petch ships
// as static instances, so every weight the UI uses has to be listed here.
const fontSans = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const fontMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
})

// The dashboard's Liquid Glass shell sets type in Inter (Latin + Cyrillic, for
// Uzbek and Russian). Not preloaded: only dashboard routes reference it.
const fontGlass = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-glass",
  display: "swap",
  preload: false,
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased",
          fontSans.variable,
          fontMono.variable,
          fontSerif.variable,
          fontGlass.variable,
          "font-sans"
        )}
        suppressHydrationWarning
      >
        <ClerkProvider
          signInFallbackRedirectUrl={appPath("/analytics")}
          signUpFallbackRedirectUrl={appPath("/org-selection")}
          taskUrls={{
            "choose-organization": "/org-selection",
          }}
        >
          <Providers>
            <a
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-[8px] focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-primary-foreground"
              href="#main"
            >
              Skip to main content
            </a>
            <Toaster />
            {children}
            <CookieConsent />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
