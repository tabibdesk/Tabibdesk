"use client"

import { usePathname } from "next/navigation"

interface ConditionalMaxWidthWrapperProps {
  children: React.ReactNode
}

/**
 * Conditionally applies max-width constraint only for marketing and auth routes
 * App routes should use 100% width to consume all available space
 */
export function ConditionalMaxWidthWrapper({ children }: ConditionalMaxWidthWrapperProps) {
  const pathname = usePathname()

  // Routes that should have max-width constraint (marketing and auth)
  const isMarketingRoute = pathname === "/" || pathname === "/pricing"
  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/register")

  // Apply max-width only for marketing and auth routes
  if (isMarketingRoute || isAuthRoute) {
    return <div className="mx-auto max-w-screen-2xl">{children}</div>
  }

  // App routes use full width
  return <>{children}</>
}
