"use client"

import { Badge } from "@/components/Badge"
import { Tooltip } from "@/components/Tooltip"
import { cx, focusRing } from "@/lib/utils"
import { useSidebar } from "@/contexts/sidebar-context"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useFeatures } from "@/features/settings/useFeatures"
import { useLocale } from "@/contexts/locale-context"
import { useAppTranslations } from "@/lib/useAppTranslations"
import {
  getNavigationForRole,
  isActiveRoute,
  type Role,
} from "@/lib/navigation"
import {
  RiMenuFoldLine,
  RiMenuUnfoldLine,
} from "@remixicon/react"
import Link from "next/link"
import { BrandName } from "@/components/shared/BrandName"
import { usePathname } from "next/navigation"
import { SidebarClinicSwitcher } from "./navigation/SidebarClinicSwitcher"
import { SidebarUserProfile } from "./navigation/DropdownUserProfile"

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const navigation = getNavigationForRole(role)
  const { effective } = useFeatures()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { isRtl } = useLocale()
  const t = useAppTranslations()

  // Filter navigation based on feature flags
  const filteredNavigation = navigation.filter((item) => {
    if (!item.featureKey) return true
    return effective[item.featureKey] === true
  })

  return (
    <>
      {/* Desktop Sidebar (collapsible) */}
      <aside
        className={cx(
          "fixed start-0 top-0 z-50 hidden h-screen flex-col border-e border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:flex",
          isCollapsed ? "w-16" : "w-72"
        )}
      >
        {/* Expand/Collapse Button Section with Logo */}
        <div
          className={cx(
            "flex h-16 items-center border-b border-gray-200 dark:border-gray-800",
            isCollapsed ? "justify-center px-2" : "px-4 justify-between gap-3"
          )}
        >
          {!isCollapsed && (
            <Link
              href="/"
              className={cx(
                "flex items-center gap-0.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors flex-1 min-w-0",
                pathname === "/"
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50",
                focusRing
              )}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              <img src="/logo.svg" alt="" className="size-[2rem] shrink-0 object-contain" aria-hidden />
              <span className="truncate"><BrandName className="text-base font-medium" /></span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className={cx(
              "group flex items-center rounded-lg text-sm font-medium transition-colors shrink-0",
              isCollapsed ? "size-9 justify-center" : "size-9 justify-center",
              "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              "dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50",
              focusRing
            )}
            aria-label={isCollapsed ? t.common.expandSidebar : t.common.collapseSidebar}
          >
            {isCollapsed ? (
              <RiMenuUnfoldLine className="size-5 shrink-0" />
            ) : (
              <RiMenuFoldLine className="size-5" />
            )}
          </button>
        </div>

        {/* Navigation Section */}
        <nav
          className={cx(
            "flex-1 overflow-y-auto py-6",
            isCollapsed ? "px-2" : "px-4"
          )}
          aria-label="Sidebar navigation"
        >
          <ul className="space-y-1">
            {filteredNavigation.map((item) => {
              const active = isActiveRoute(item.href, pathname)

              const linkContent = (
                <Link
                  href={item.href}
                  className={cx(
                    "group flex items-center rounded-lg text-sm font-medium transition-colors",
                    isCollapsed ? "w-full justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                    active
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50",
                    focusRing
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <item.icon className="size-5 shrink-0" aria-hidden="true" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{t.nav[item.navKey]}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ms-auto">
                          <Badge color="indigo" size="xs">
                            {item.badge}
                          </Badge>
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )

              return (
                <li key={item.navKey}>
                  {isCollapsed ? (
                    <Tooltip content={t.nav[item.navKey]} side={isRtl ? "left" : "right"}>
                      {linkContent}
                    </Tooltip>
                  ) : (
                    linkContent
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Section - Clinic Switcher & User Menu */}
        <div
          className={cx(
            "border-t border-gray-200 dark:border-gray-800",
            isCollapsed ? "p-2" : "p-4"
          )}
        >
          <div className="space-y-1">
            <SidebarClinicSwitcher mode={isCollapsed ? "collapsed" : "dropdown"} />
            <SidebarUserProfile mode={isCollapsed ? "collapsed" : "dropdown"} align="end" />
          </div>
        </div>
      </aside>
    </>
  )
}
