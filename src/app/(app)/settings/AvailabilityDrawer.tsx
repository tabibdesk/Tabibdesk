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
import type { DoctorAvailability } from "@/features/appointments/types"

const DAY_IDS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

export interface DayConfig {
  enabled: boolean
  startTime: string
  endTime: string
}

/** One record to create/update (after grouping by start/end) */
export interface AvailabilityRecordPayload {
  doctorId: string
  clinicId: string
  daysOfWeek: string[]
  startTime: string
  endTime: string
  slotDuration: number
}

function defaultDayConfig(): DayConfig {
  return { enabled: false, startTime: "09:00", endTime: "17:00" }
}

function emptyDayConfigs(): Record<string, DayConfig> {
  return DAY_IDS.reduce((acc, day) => {
    acc[day] = defaultDayConfig()
    return acc
  }, {} as Record<string, DayConfig>)
}

function getDayLabel(dayId: string, t: ReturnType<typeof useAppTranslations>["settings"]): string {
  const key = `day${dayId.charAt(0).toUpperCase()}${dayId.slice(1)}` as keyof typeof t
  return (t as Record<string, string>)[key] ?? dayId
}

/** Group enabled days by (startTime, endTime) and return one payload per group */
function groupDayConfigsToRecords(
  dayConfigs: Record<string, DayConfig>,
  doctorId: string,
  clinicId: string,
  slotDuration: number
): AvailabilityRecordPayload[] {
  const byKey = new Map<string, string[]>()
  DAY_IDS.forEach((day) => {
    const config = dayConfigs[day]
    if (!config?.enabled || !config.startTime || !config.endTime) return
    const key = `${config.startTime}-${config.endTime}`
    if (!byKey.has(key)) byKey.set(key, [])
    byKey.get(key)!.push(day)
  })
  return Array.from(byKey.entries()).map(([key]) => {
    const [startTime, endTime] = key.split("-")
    return {
      doctorId,
      clinicId,
      daysOfWeek: byKey.get(key)!,
      startTime,
      endTime,
      slotDuration,
    }
  })
}

export interface AvailabilityDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  initialValues?: DoctorAvailability | null
  defaultClinicId?: string
  doctors: { id: string; full_name: string }[]
  clinics: { id: string; name: string }[]
  onSave: (records: AvailabilityRecordPayload[]) => void
}

export function AvailabilityDrawer({
  open,
  onOpenChange,
  mode,
  initialValues = null,
  defaultClinicId = "",
  doctors,
  clinics,
  onSave,
}: AvailabilityDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const [doctorId, setDoctorId] = useState("")
  const [clinicId, setClinicId] = useState("")
  const [slotDuration, setSlotDuration] = useState(30)
  const [dayConfigs, setDayConfigs] = useState<Record<string, DayConfig>>(emptyDayConfigs())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialValues) {
        setDoctorId(initialValues.doctorId)
        setClinicId(initialValues.clinicId)
        setSlotDuration(initialValues.slotDuration ?? 30)
        const start = initialValues.startTime || "09:00"
        const end = initialValues.endTime || "17:00"
        const configs = emptyDayConfigs()
        ;(initialValues.daysOfWeek || []).forEach((day) => {
          configs[day] = { enabled: true, startTime: start, endTime: end }
        })
        setDayConfigs(configs)
      } else {
        setDoctorId(doctors[0]?.id ?? "")
        setClinicId((defaultClinicId || clinics[0]?.id) ?? "")
        setSlotDuration(30)
        setDayConfigs(emptyDayConfigs())
      }
    }
  }, [open, mode, initialValues, defaultClinicId, doctors, clinics])

  const hasAnyEnabled = DAY_IDS.some((day) => dayConfigs[day]?.enabled)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorId || !clinicId || !hasAnyEnabled) return
    const records = groupDayConfigsToRecords(dayConfigs, doctorId, clinicId, slotDuration)
    if (records.length === 0) return
    setIsSubmitting(true)
    onSave(records)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const setDayEnabled = (day: string, enabled: boolean) => {
    setDayConfigs((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled,
        startTime: prev[day]?.startTime ?? "09:00",
        endTime: prev[day]?.endTime ?? "17:00",
      },
    }))
  }

  const setDayTime = (day: string, field: "startTime" | "endTime", value: string) => {
    setDayConfigs((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const title = mode === "add" ? t.settings.addAvailability : t.settings.editAvailability

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-lg">
        <DrawerHeader>
          <DrawerHeaderTitle title={title} />
        </DrawerHeader>
        <form onSubmit={handleSubmit}>
          <DrawerBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="avail-doctor">{t.common.doctor}</Label>
              <select
                id="avail-doctor"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
              >
                <option value="">{t.common.doctor}</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="avail-clinic">{t.settings.location}</Label>
              <select
                id="avail-clinic"
                value={clinicId}
                onChange={(e) => setClinicId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
              >
                <option value="">{t.settings.location}</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="avail-slot">{t.settings.slotDuration} ({t.settings.minutes})</Label>
              <Input
                id="avail-slot"
                type="number"
                min={5}
                max={120}
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value) || 30)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.settings.daysOfWeek}</Label>
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                {DAY_IDS.map((day) => {
                  const config = dayConfigs[day] ?? defaultDayConfig()
                  return (
                    <div
                      key={day}
                      className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-3 py-2 last:border-b-0 dark:border-gray-800"
                    >
                      <label className="flex cursor-pointer items-center gap-2 min-w-[7rem] text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={config.enabled}
                          onChange={(e) => setDayEnabled(day, e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        {getDayLabel(day, t.settings)}
                      </label>
                      <Input
                        type="time"
                        value={config.startTime}
                        onChange={(e) => setDayTime(day, "startTime", e.target.value)}
                        disabled={!config.enabled}
                        className="w-28"
                        aria-label={`${getDayLabel(day, t.settings)} ${t.settings.startTime}`}
                      />
                      <Input
                        type="time"
                        value={config.endTime}
                        onChange={(e) => setDayTime(day, "endTime", e.target.value)}
                        disabled={!config.enabled}
                        className="w-28"
                        aria-label={`${getDayLabel(day, t.settings)} ${t.settings.endTime}`}
                      />
                    </div>
                  )
                })}
              </div>
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
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !doctorId || !clinicId || !hasAnyEnabled}
            >
              {isSubmitting ? t.settings.saving : t.settings.saveChanges}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
