"use client"

import { useState, useEffect } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Textarea } from "@/components/Textarea"
import { Label } from "@/components/Label"
import { Switch } from "@/components/Switch"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { CardSkeleton } from "@/components/skeletons"
import * as settingsApi from "@/api/settings.api"
import type {
  ClinicReactivationRules,
  ReactivationSequenceMessages,
} from "@/features/settings/settings.types"

export function ReEngagementTab() {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const [reactivationRules, setReactivationRules] =
    useState<ClinicReactivationRules | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadRules()
  }, [currentClinic.id])

  const loadRules = async () => {
    setIsLoading(true)
    try {
      const rules = await settingsApi.getReactivationRules(currentClinic.id)
      setReactivationRules(rules)
    } catch (error) {
      console.error("Failed to load reactivation rules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!reactivationRules) return
    setIsSaving(true)
    try {
      await settingsApi.updateReactivationRules(currentClinic.id, reactivationRules)
    } catch (error) {
      console.error("Failed to save reactivation rules:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !reactivationRules) {
    return <CardSkeleton lines={4} borderless />
  }

  const rules = reactivationRules

  return (
    <div className="space-y-6">
      {/* 1. Sending Window */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.sendingWindow}</CardTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {t.settings.triggerSendingWindow}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {t.settings.sendOnlyBetween}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="work-start">{t.settings.startTime}</Label>
                <Input
                  id="work-start"
                  type="time"
                  value={rules.reactivationWorkingHours?.start ?? "12:00"}
                  onChange={(e) =>
                    setReactivationRules({
                      ...rules,
                      reactivationWorkingHours: {
                        start: e.target.value,
                        end: rules.reactivationWorkingHours?.end ?? "21:00",
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work-end">{t.settings.endTime}</Label>
                <Input
                  id="work-end"
                  type="time"
                  value={rules.reactivationWorkingHours?.end ?? "21:00"}
                  onChange={(e) =>
                    setReactivationRules({
                      ...rules,
                      reactivationWorkingHours: {
                        start: rules.reactivationWorkingHours?.start ?? "12:00",
                        end: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Re-engagement */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.reengagement}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inactivity Threshold */}
          <div className="space-y-2">
            <Label htmlFor="inactivity-threshold">{t.settings.markAsInactivePatient}</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerInactive}</p>
            <div className="flex items-center gap-2">
              <Input
                id="inactivity-threshold"
                type="number"
                min="1"
                max="365"
                value={rules.inactivityDaysThreshold}
                onChange={(e) =>
                  setReactivationRules({
                    ...rules,
                    inactivityDaysThreshold: Number(e.target.value),
                  })
                }
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t.settings.days}
              </span>
            </div>
          </div>

          {/* Inactive Sequence */}
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="reactivation-enabled">{t.settings.inactiveSequence}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerInactiveSequence}</p>
              </div>
              <Switch
                id="reactivation-enabled"
                checked={rules.reactivationSequenceEnabled}
                onCheckedChange={(checked) =>
                  setReactivationRules({
                    ...rules,
                    reactivationSequenceEnabled: checked,
                  })
                }
              />
            </div>
            {rules.reactivationSequenceEnabled && (
              <div className="ps-4 border-s-2 border-gray-200 dark:border-gray-700 space-y-4">
                {([1, 7, 14, 30] as const).map((day) => {
                  const key = `day${day}` as keyof ReactivationSequenceMessages
                  return (
                    <div key={day} className="space-y-2">
                      <Label htmlFor={`message-day-${day}`} className="text-xs">
                        {t.settings.sequenceDayLabel.replace("{day}", String(day))}
                      </Label>
                      <Textarea
                        id={`message-day-${day}`}
                        value={rules.sequenceMessages?.[key] ?? ""}
                        onChange={(e) =>
                          setReactivationRules({
                            ...rules,
                            sequenceMessages: {
                              ...rules.sequenceMessages,
                              [key]: e.target.value,
                            },
                          })
                        }
                        placeholder={t.settings.sequenceMessagePlaceholder}
                        rows={2}
                        className="resize-y min-h-[4rem]"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Retry Attempts */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {t.settings.attempts}
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-attempts" className="text-xs">{t.settings.maxAttempts}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="max-attempts"
                    type="number"
                    min="1"
                    max="10"
                    value={rules.maxAttempts}
                    onChange={(e) =>
                      setReactivationRules({
                        ...rules,
                        maxAttempts: Number(e.target.value),
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t.settings.attemptsUnit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="days-between-attempts" className="text-xs">
                  {t.settings.daysBetweenAttempts}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="days-between-attempts"
                    type="number"
                    min="1"
                    max="30"
                    value={rules.daysBetweenAttempts}
                    onChange={(e) =>
                      setReactivationRules({
                        ...rules,
                        daysBetweenAttempts: Number(e.target.value),
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t.settings.days}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="mark-cold" className="text-xs">
                  {t.settings.markColdAfterMax}
                </Label>
                <Switch
                  id="mark-cold"
                  checked={rules.markColdAfterMaxAttempts}
                  onCheckedChange={(checked) =>
                    setReactivationRules({
                      ...rules,
                      markColdAfterMaxAttempts: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4 pb-8">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving ? t.settings.saving : t.settings.saveChanges}
        </Button>
      </div>
    </div>
  )
}
