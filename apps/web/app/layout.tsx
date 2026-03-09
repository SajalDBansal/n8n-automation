import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/styles/globals.css"
import { cn } from "@workspace/ui/lib/utils";
import { ThemeProvider } from "@/providers/theme-provider"
import { SessionProvider } from "@/providers/session-provider";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
