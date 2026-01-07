"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"

export function SidebarWrapper() {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/register")
  
  if (isAuthRoute) {
    return null
  }
  
  return <Sidebar />
}

