import { TailAdminLayoutWrapper } from "@/components/shell/TailAdminLayoutWrapper"
import { ConditionalMaxWidthWrapper } from "@/components/shell/ConditionalMaxWidthWrapper"
import { DemoProvider } from "@/contexts/demo-context"
import { UserClinicProvider } from "@/contexts/user-clinic-context"
import { ToastProvider } from "@/hooks/useToast"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Inter, Noto_Sans_Arabic } from "next/font/google"
import "./globals.css"
import { siteConfig } from "./siteConfig"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const arabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
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
    <html lang="en" dir="ltr" className={`${inter.variable} ${arabic.variable}`} suppressHydrationWarning>
      <body
        className={`overflow-y-scroll scroll-auto antialiased selection:bg-primary-100 selection:text-primary-700 dark:bg-gray-950`}
        suppressHydrationWarning
      >
        <ConditionalMaxWidthWrapper>
          <ThemeProvider defaultTheme="system" attribute="class">
            <DemoProvider>
              <UserClinicProvider>
                <ToastProvider>
                  <TailAdminLayoutWrapper>{children}</TailAdminLayoutWrapper>
                </ToastProvider>
              </UserClinicProvider>
            </DemoProvider>
          </ThemeProvider>
        </ConditionalMaxWidthWrapper>
      </body>
    </html>
  )
}
