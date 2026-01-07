"use client"

import { Badge } from "@/components/Badge"
import { Tooltip } from "@/components/Tooltip"
import { cx, focusRing } from "@/lib/utils"
import type { RemixiconComponentType } from "@remixicon/react"
import {
  RiCalendarEventLine,
  RiCalendarLine,
  RiHomeLine,
  RiUserLine,
} from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItem = {
  name: string
  href: string
  icon: RemixiconComponentType
  badge?: number
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: RiHomeLine },
  { name: "Patients", href: "/patients", icon: RiUserLine },
  { name: "Appointments", href: "/appointments", icon: RiCalendarLine },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (itemHref: string) => {
    // For dashboard, match exactly
    if (itemHref === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/"
    }
    return pathname.startsWith(itemHref)
  }

  return (
    <>
      {/* Desktop Sidebar - Icon Only */}
      <nav className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-16 lg:flex-col">
        <aside className="flex grow flex-col items-center gap-y-4 overflow-y-auto border-r border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-gray-950">
          {/* Logo */}
          <Tooltip content="TabibDesk" side="right">
            <Link
              href="/"
              className={cx(
                "flex size-10 items-center justify-center rounded-lg bg-primary-600 transition-transform hover:scale-105 dark:bg-primary-500",
                focusRing
              )}
              aria-label="TabibDesk Home"
            >
              <span className="text-sm font-bold text-white">TD</span>
            </Link>
          </Tooltip>

          {/* Primary Navigation */}
          <nav aria-label="Primary navigation" className="flex flex-1 flex-col gap-y-6">
            {navigation.map((item) => {
              const active = isActive(item.href)

              return (
                <Tooltip key={item.name} content={item.name} side="right">
                  <Link
                    href={item.href}
                    className={cx(
                      "group relative flex size-10 items-center justify-center rounded-md transition-colors",
                      active
                        ? "bg-gray-100 text-primary-600 dark:bg-gray-800 dark:text-primary-400"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50",
                      focusRing
                    )}
                    aria-label={item.name}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="size-5" aria-hidden="true" />
                    {item.badge && item.badge > 0 && (
                      <Badge
                        variant="dot"
                        className="absolute right-1 top-1"
                        aria-label={`${item.badge} notifications`}
                      />
                    )}
                  </Link>
                </Tooltip>
              )
            })}
          </nav>
        </aside>
      </nav>
    </>
  )
}
