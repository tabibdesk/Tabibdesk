"use client"

import { usePathname } from "next/navigation"

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/register")
  const isMarketingRoute = pathname === "/" || pathname?.startsWith("/?")
  const isDesignLibrary = pathname?.startsWith("/components")
  
  return (
    <main className={isAuthRoute || isMarketingRoute || isDesignLibrary ? "" : "pt-5 lg:pl-16"}>
      {children}
    </main>
  )
}

