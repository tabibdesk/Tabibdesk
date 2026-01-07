"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { TopBar } from "./TopBar"

export function SidebarWrapper() {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/register")
  const isMarketingRoute = pathname === "/" || pathname?.startsWith("/?")
  const isDesignLibrary = pathname?.startsWith("/components")
  
  if (isAuthRoute || isMarketingRoute || isDesignLibrary) {
    return null
  }
  
  return (
    <>
      <TopBar />
      <Sidebar />
    </>
  )
}

export function useIsAuthRoute() {
  const pathname = usePathname()
  return pathname?.startsWith("/login") || pathname?.startsWith("/register")
}
