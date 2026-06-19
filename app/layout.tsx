import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/toast-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { HideV0Badge } from "@/components/HideV0Badge"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ExamNova",
  description: "Access WAEC, NECO & NABTEB exam expo instantly",
  icons: {
    icon: "https://i.ibb.co/9PgYrBP/20250522-090102.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
  <head>
  <script
    src="https://quge5.com/88/tag.min.js"
    data-zone="251309"
    async
    data-cfasync="false"
  ></script>
    <script>(function(s){s.dataset.zone='11169801',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
</head>

  <body className={`${inter.className} bg-background text-foreground`}>
        <HideV0Badge />
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem={true}
          disableTransitionOnChange={true}
        >
          <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 bg-background">{children}</main>
            <Footer />
          </div>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
