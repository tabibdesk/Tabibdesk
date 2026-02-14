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
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"

const TIMEZONE_OPTIONS = [
  { value: "Africa/Cairo", label: "Africa/Cairo (GMT+2)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
  { value: "Europe/London", label: "Europe/London (GMT+0)" },
]

const DEFAULT_TIMEZONE = "Africa/Cairo"
const DEFAULT_APPOINTMENT_MIN = 30

export interface BranchFormValues {
  name: string
  address: string
  timezone: string
  defaultAppointmentMin: number
}

function emptyForm(): BranchFormValues {
  return {
    name: "",
    address: "",
    timezone: DEFAULT_TIMEZONE,
    defaultAppointmentMin: DEFAULT_APPOINTMENT_MIN,
  }
}

export interface ClinicSettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  initialValues?: BranchFormValues | null
  onSave: (values: BranchFormValues) => void
}

export function ClinicSettingsDrawer({
  open,
  onOpenChange,
  mode,
  initialValues = null,
  onSave,
}: ClinicSettingsDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const [form, setForm] = useState<BranchFormValues>(emptyForm())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        mode === "edit" && initialValues
          ? { ...initialValues }
          : emptyForm()
      )
    }
  }, [open, mode, initialValues])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    onSave(form)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const title = mode === "add" ? t.settings.addBranch : t.settings.clinicSettings

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-lg">
        <DrawerHeader>
          <DrawerHeaderTitle title={title} />
        </DrawerHeader>
        <form onSubmit={handleSubmit}>
          <DrawerBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branch-name">{t.settings.clinicName}</Label>
              <Input
                id="branch-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-address">{t.settings.address}</Label>
              <Input
                id="branch-address"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-timezone">{t.settings.timezone}</Label>
              <select
                id="branch-timezone"
                value={form.timezone}
                onChange={(e) => setForm((prev) => ({ ...prev, timezone: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
              >
                {TIMEZONE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-duration">{t.settings.defaultAppointmentMin}</Label>
              <Input
                id="branch-duration"
                type="number"
                min={5}
                max={120}
                value={form.defaultAppointmentMin}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, defaultAppointmentMin: Number(e.target.value) || DEFAULT_APPOINTMENT_MIN }))
                }
              />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || !form.name.trim()}>
              {isSubmitting ? t.settings.saving : t.settings.saveChanges}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
