"use client"

import * as React from "react"
import {
  RiHospitalLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
} from "@remixicon/react"
import { useLocale } from "@/contexts/locale-context"
import { useAppTranslations } from "@/lib/useAppTranslations"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/Dropdown"
import { Tooltip } from "@/components/Tooltip"
import { cx, focusRing } from "@/lib/utils"
import { useUserClinic } from "@/contexts/user-clinic-context"

interface SidebarClinicSwitcherProps {
  mode: "dropdown" | "inline" | "collapsed"
}

export function SidebarClinicSwitcher({ mode }: SidebarClinicSwitcherProps) {
  const { currentClinic, allClinics, setCurrentClinic } = useUserClinic()
  const [isOpen, setIsOpen] = React.useState(false)
  const { isRtl } = useLocale()
  const t = useAppTranslations()

  // Desktop modes (Expanded & Collapsed) use Dropdown
  if (mode === "dropdown" || mode === "collapsed") {
    const triggerButton = (
      <button
        className={cx(
          "group flex w-full items-center rounded-lg text-sm font-medium transition-colors",
          mode === "collapsed" ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50",
          focusRing
        )}
        aria-label={t.common.switchClinic}
      >
        <RiHospitalLine className="size-5 shrink-0" aria-hidden="true" />
        {mode === "dropdown" && (
          <span className="flex-1 truncate text-start">{currentClinic.name}</span>
        )}
      </button>
    )

    return (
      <DropdownMenu>
        {mode === "collapsed" ? (
          <Tooltip content={t.common.switchClinic} side={isRtl ? "left" : "right"}>
            <DropdownMenuTrigger asChild>
              {triggerButton}
            </DropdownMenuTrigger>
          </Tooltip>
        ) : (
          <DropdownMenuTrigger asChild>
            {triggerButton}
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent
          align={mode === "collapsed" ? "center" : "start"}
          side={mode === "collapsed" ? (isRtl ? "left" : "right") : "top"}
          className="w-56"
        >
          <DropdownMenuLabel>{t.common.clinics}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allClinics.map((clinic) => (
            <DropdownMenuItem
              key={clinic.id}
              onClick={() => setCurrentClinic(clinic.id)}
              className={cx(
                clinic.id === currentClinic.id && "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
              )}
            >
              <RiHospitalLine className="size-4 shrink-0 me-2" aria-hidden="true" />
              {clinic.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Inline mode (Mobile Drawer)
  return (
    <div className="flex flex-col gap-1">
      <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
        {t.common.clinic}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cx(
          "flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800",
          focusRing
        )}
      >
        <div className="flex items-center gap-2">
          <RiHospitalLine className="size-5 shrink-0 text-gray-500" />
          <span className="truncate">{currentClinic.name}</span>
        </div>
        {isOpen ? (
          <RiArrowUpSLine className="size-4 shrink-0 text-gray-500" />
        ) : (
          <RiArrowDownSLine className="size-4 shrink-0 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col gap-1 ps-8 pt-1">
          {allClinics.map((clinic) => (
            <button
              key={clinic.id}
              onClick={() => setCurrentClinic(clinic.id)}
              className={cx(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                clinic.id === currentClinic.id
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              <span>{clinic.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
