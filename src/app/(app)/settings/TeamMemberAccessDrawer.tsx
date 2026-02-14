"use client"

import { useState, useEffect } from "react"
import { useLocale } from "@/contexts/locale-context"
import { useAppTranslations } from "@/lib/useAppTranslations"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerHeaderTitle,
} from "@/components/Drawer"
import { Button } from "@/components/Button"
import { RiUserLine } from "@remixicon/react"

export type MemberRole = "doctor" | "assistant" | "manager"

export interface ClinicMembership {
  clinicId: string
  role: MemberRole
}

export interface TeamMemberAccessDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberName: string
  memberEmail?: string
  initialMemberships: ClinicMembership[]
  clinics: { id: string; name: string }[]
  onSave: (memberships: ClinicMembership[]) => void
}

const DEFAULT_ROLE: MemberRole = "assistant"

export function TeamMemberAccessDrawer({
  open,
  onOpenChange,
  memberName,
  memberEmail,
  initialMemberships,
  clinics,
  onSave,
}: TeamMemberAccessDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const [perClinic, setPerClinic] = useState<Record<string, { enabled: boolean; role: MemberRole }>>({})

  useEffect(() => {
    if (open && clinics.length > 0) {
      const initial = initialMemberships
      const next: Record<string, { enabled: boolean; role: MemberRole }> = {}
      clinics.forEach((c) => {
        const m = initial.find((x) => x.clinicId === c.id)
        next[c.id] = m
          ? { enabled: true, role: m.role as MemberRole }
          : { enabled: false, role: DEFAULT_ROLE }
      })
      setPerClinic(next)
    }
  }, [open, clinics, initialMemberships])

  const setEnabled = (clinicId: string, enabled: boolean) => {
    setPerClinic((prev) => ({
      ...prev,
      [clinicId]: {
        enabled,
        role: prev[clinicId]?.role ?? DEFAULT_ROLE,
      },
    }))
  }

  const setRole = (clinicId: string, role: MemberRole) => {
    setPerClinic((prev) => ({
      ...prev,
      [clinicId]: { ...prev[clinicId], enabled: prev[clinicId]?.enabled ?? false, role },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const memberships: ClinicMembership[] = clinics
      .filter((c) => perClinic[c.id]?.enabled)
      .map((c) => ({ clinicId: c.id, role: perClinic[c.id]?.role ?? DEFAULT_ROLE }))
    onSave(memberships)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-md">
        <DrawerHeader>
          <DrawerHeaderTitle title={t.settings.editAccessTitle} />
        </DrawerHeader>
        <form onSubmit={handleSubmit}>
          <DrawerBody className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <RiUserLine className="size-5 shrink-0 text-primary-600 dark:text-primary-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-50">
                    {memberName}
                  </p>
                  {memberEmail && (
                    <p className="truncate text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      {memberEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex flex-col gap-2 pt-1">
                {clinics.map((c) => {
                  const state = perClinic[c.id] ?? { enabled: false, role: DEFAULT_ROLE }
                  return (
                    <div
                      key={c.id}
                      className={`flex flex-col gap-2 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:gap-3 ${
                        state.enabled
                          ? "border-gray-200 dark:border-gray-800"
                          : "border-gray-200 opacity-75 dark:border-gray-800"
                      }`}
                    >
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={state.enabled}
                          onChange={(e) => setEnabled(c.id, e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          {c.name}
                        </span>
                      </label>
                      <div className="flex items-center gap-2 ps-6 sm:ps-0 sm:ms-auto">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {t.settings.inviteRoleLabel}
                        </span>
                        <select
                          value={state.role}
                          onChange={(e) => setRole(c.id, e.target.value as MemberRole)}
                          disabled={!state.enabled}
                          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                        >
                          <option value="doctor">{t.common.doctor}</option>
                          <option value="assistant">{t.common.assistant}</option>
                          <option value="manager">{t.common.manager}</option>
                        </select>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary">
              {t.settings.saveChanges}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
