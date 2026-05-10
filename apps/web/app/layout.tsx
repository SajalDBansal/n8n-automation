import localFont from "next/font/local";
import type { Metadata } from "next";
import "@workspace/ui/styles/globals.css"
import { cn } from "@workspace/ui/lib/utils";
import { ThemeProvider } from "@/providers/theme-provider"
import { Toaster } from "@workspace/ui/components/sonner";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

const geist = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
})

const fontMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-mono",
  weight: "100 900",
  display: "swap",
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
          <ThemeProvider>
            {children}
          </ThemeProvider>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}
