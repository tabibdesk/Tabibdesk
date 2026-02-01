"use client"

import { usePathname } from "next/navigation"
import MobileSidebar from "@/components/shell/navigation/MobileSidebar"
import { getNavigationForRole } from "@/lib/navigation"
import type { NavKey } from "@/lib/navigation"
import { useAppTranslations } from "@/lib/useAppTranslations"

interface TopbarProps {
  role: "doctor" | "assistant" | "manager"
}

function getPageNavKey(pathname: string, role: "doctor" | "assistant" | "manager"): NavKey | null {
  const navigation = getNavigationForRole(role)

  // Check for exact matches first
  const exactMatch = navigation.find((item) => item.href === pathname)
  if (exactMatch) return exactMatch.navKey

  // Check for pathname starts with (for detail pages)
  const pathMatch = navigation.find((item) => {
    if (item.href === "/dashboard") return false
    if (item.href === "/tasks") return pathname === "/tasks"
    if (item.href === "/insights") return pathname === "/insights"
    return pathname.startsWith(item.href)
  })

  if (pathMatch) {
    if (pathname.startsWith("/patients/") && pathname !== "/patients") return "patients"
    if (pathname.startsWith("/appointments") && pathname !== "/appointments") return "appointments"
    return pathMatch.navKey
  }

  return null
}

export function Topbar({ role }: TopbarProps) {
  const pathname = usePathname()
  const t = useAppTranslations()
  const navKey = getPageNavKey(pathname, role)
  const pageTitle = navKey ? t.nav[navKey] : null
  
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:hidden">
      {/* Mobile: Hamburger Menu Button */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <MobileSidebar role={role} />
        {pageTitle && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50 truncate">
            {pageTitle}
          </h1>
        )}
      </div>
    </header>
  )
}
