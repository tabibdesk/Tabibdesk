"use client"

import React, { useEffect, useState } from "react"
import {
  getNavigationForRole,
  isActiveRoute,
  type Role,
} from "@/lib/navigation"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Select } from "@/components/Select"
import { useFeatures } from "@/features/settings/useFeatures"
import { cx, focusRing } from "@/lib/utils"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerClose,
} from "@/components/Drawer"
import { RiMenuLine, RiUser3Line, RiArrowDownSLine } from "@remixicon/react"
import { DropdownUserProfile } from "./DropdownUserProfile"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { BrandName } from "@/components/shared/BrandName"

interface MobileSidebarProps {
  role: Role
}

export default function MobileSidebar({ role }: MobileSidebarProps) {
  const pathname = usePathname()
  const navigation = getNavigationForRole(role)
  const { currentUser, currentClinic, allClinics, setCurrentClinic } = useUserClinic()
  const { effective } = useFeatures()
  const t = useAppTranslations()

  const [isRtl, setIsRtl] = useState(false)

  useEffect(() => {
    setIsRtl(document.documentElement.dir === "rtl")
  }, [])

  const roleLabel =
    currentUser.role === "doctor" ? t.common.doctor :
    currentUser.role === "manager" ? t.common.manager :
    t.common.assistant

  // Filter navigation based on feature flags
  const filteredNavigation = navigation.filter((item) => {
    if (!item.featureKey) return true
    return effective[item.featureKey] === true
  })

  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            aria-label={t.common.openMenu}
            className="group flex items-center rounded-md p-2 text-sm font-medium hover:bg-gray-100 data-[state=open]:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RiMenuLine
              className="size-6 shrink-0"
              aria-hidden="true"
            />
          </Button>
        </DrawerTrigger>
        <DrawerContent side={isRtl ? "right" : "left"} className="w-72">
          <DrawerHeader>
            <DrawerTitle className="text-lg font-semibold">
              <BrandName />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="flex flex-col gap-6">
            <nav
              aria-label="Mobile navigation"
              className="flex-1"
            >
              <ul role="list" className="space-y-1">
                {filteredNavigation.map((item) => {
                  const active = isActiveRoute(item.href, pathname)

                  return (
                    <li key={item.navKey}>
                      <DrawerClose asChild>
                        <Link
                          href={item.href}
                          className={cx(
                            "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            active
                              ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50",
                            focusRing
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="size-5 shrink-0" aria-hidden="true" />
                            <span>{t.nav[item.navKey]}</span>
                          </div>
                          {item.badge && item.badge > 0 && (
                            <Badge color="indigo" size="xs">{item.badge}</Badge>
                          )}
                        </Link>
                      </DrawerClose>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="mt-auto space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              {/* Clinic Switcher */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  {t.common.clinic}
                </label>
                <div className="relative">
                  <Select
                    value={currentClinic.id}
                    onChange={(e) => setCurrentClinic(e.target.value)}
                    className="w-full appearance-none pe-8 text-sm"
                  >
                    {allClinics.map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </option>
                    ))}
                  </Select>
                  <RiArrowDownSLine
                    className="pointer-events-none absolute end-2 top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* User Profile */}
              <DropdownUserProfile mode="dropdown">
                <button
                  className={cx(
                    "flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition-colors",
                    "hover:bg-gray-100 hover:border-gray-300",
                    "dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800 dark:hover:border-gray-700",
                    focusRing
                  )}
                  aria-label="User settings"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                    {currentUser.avatar_initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                      {currentUser.full_name}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {roleLabel}
                    </p>
                  </div>
                  <RiUser3Line className="size-4 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                </button>
              </DropdownUserProfile>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
