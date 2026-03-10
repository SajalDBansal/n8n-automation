import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "@workspace/ui/styles/globals.css"
import { cn } from "@workspace/ui/lib/utils";
import { ThemeProvider } from "@/providers/theme-provider"
import { SessionProvider } from "@/providers/session-provider";
import { Toaster } from "@workspace/ui/components/sonner";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "n8n Workflow Automation Platform",
  description: "A modern workflow automation platform inspired by n8n",
};

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
      <body className="min-h-screen bg-background antialiased selection:bg-primary selection:text-primary-foreground">
        <TooltipProvider>
          <SessionProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </SessionProvider>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}
