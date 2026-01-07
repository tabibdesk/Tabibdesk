"use client"

import React from "react"
import { cx, focusRing } from "@/lib/utils"
import {
  RiHomeLine,
  RiUserLine,
  RiCalendarLine,
  RiCalendarEventLine,
  RiMenuLine,
} from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerClose,
} from "@/components/Drawer"
import type { RemixiconComponentType } from "@remixicon/react"

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

export default function MobileSidebar() {
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
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            aria-label="Open menu"
            className="group flex items-center rounded-md p-2 text-sm font-medium hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10"
          >
            <RiMenuLine
              className="size-6 shrink-0 sm:size-5"
              aria-hidden="true"
            />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="w-64">
          <DrawerHeader>
            <DrawerTitle>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500">
                  <span className="text-sm font-bold text-white">TD</span>
                </div>
                <span className="text-lg font-semibold">TabibDesk</span>
              </div>
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <nav
              aria-label="Mobile navigation"
              className="flex flex-1 flex-col gap-y-4"
            >
              {/* Primary Navigation */}
              <ul role="list" className="space-y-0.5">
                {navigation.map((item) => {
                  const active = isActive(item.href)

                  return (
                    <li key={item.name}>
                      <DrawerClose asChild>
                        <Link
                          href={item.href}
                          className={cx(
                            active
                              ? "bg-gray-100 text-primary-600 dark:bg-gray-800 dark:text-primary-400"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50",
                            "flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                            focusRing
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <div className="flex items-center gap-x-2.5">
                            <item.icon className="size-4 shrink-0" aria-hidden="true" />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && item.badge > 0 && (
                            <Badge variant="count">{item.badge}</Badge>
                          )}
                        </Link>
                      </DrawerClose>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
