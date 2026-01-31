"use client"

import { usePathname } from "next/navigation"
import { AppShell } from "./AppShell"

interface AppLayoutWrapperProps {
  children: React.ReactNode
  role?: "doctor" | "assistant"
}

/**
 * Conditionally wraps children with App layout (AppShell)
 * Excludes marketing and auth routes
 */
export function AppLayoutWrapper({
  children,
  role,
}: AppLayoutWrapperProps) {
  const pathname = usePathname()

  // Routes that should NOT use App layout
  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/register")
  // Marketing route is handled by its own layout - root path redirects to marketing
  // Note: Marketing routes use their own layout group, so they're already excluded
  const isMarketingRoute = pathname === "/" || pathname === "/pricing"
  
  // Routes that already have their own layout (doctor/assistant use AppShell in their own layouts)
  const isRoleBasedRoute = pathname?.startsWith("/doctor") || pathname?.startsWith("/assistant")

  // Don't wrap if it's a route that shouldn't have the layout
  if (isAuthRoute || isMarketingRoute || isRoleBasedRoute) {
    return <>{children}</>
  }

  // For legacy routes, use default role (can be made configurable)
  // Note: Legacy routes might not have a role, so we default to "doctor"
  const defaultRole = role || "doctor"

  return <AppShell role={defaultRole}>{children}</AppShell>
}
