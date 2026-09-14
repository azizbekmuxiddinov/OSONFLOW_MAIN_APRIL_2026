import { Chakra_Petch, Lora, Roboto_Mono } from "next/font/google"

import "@workspace/ui/styles/globals.css"
import "./widget-theme.css"
import "./widget-chat.css"
import { Providers } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

// Matches the dashboard's stack so a merchant who has not picked a widget font
// sees the same three families here as in the console.
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full overflow-hidden antialiased",
        fontMono.variable,
        fontSerif.variable,
        "font-sans",
        fontSans.variable
      )}
    >
      <body className="h-full overflow-hidden" suppressHydrationWarning>
        <Providers>
          <div className="h-full min-h-0 w-full min-w-0 overflow-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
