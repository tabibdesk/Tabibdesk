import { MainContent } from "@/components/shell/navigation/MainContent"
import { SidebarWrapper } from "@/components/shell/navigation/SidebarWrapper"
import { DemoProvider } from "@/contexts/demo-context"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Inter } from "next/font/google"
import "./globals.css"
import { siteConfig } from "./siteConfig"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://tabibdesk.com"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ["medical", "healthcare", "clinic", "practice management"],
  authors: [
    {
      name: "TabibDesk",
      url: "",
    },
  ],
  creator: "TabibDesk",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} overflow-y-scroll scroll-auto antialiased selection:bg-primary-100 selection:text-primary-700 dark:bg-gray-950`}
        suppressHydrationWarning
      >
        <div className="mx-auto max-w-screen-2xl">
          <ThemeProvider defaultTheme="system" attribute="class">
            <DemoProvider>
              <SidebarWrapper />
              <MainContent>{children}</MainContent>
            </DemoProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  )
}
