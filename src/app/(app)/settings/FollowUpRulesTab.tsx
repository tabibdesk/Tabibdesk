"use client"

import { useState, useEffect } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Switch } from "@/components/Switch"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { CardSkeleton } from "@/components/skeletons"
import * as settingsApi from "@/api/settings.api"
import type { ClinicFollowUpRules } from "@/features/settings/settings.types"

export function FollowUpRulesTab() {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const [rules, setRules] = useState<ClinicFollowUpRules | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadRules()
  }, [currentClinic.id])

  const loadRules = async () => {
    setIsLoading(true)
    try {
      const loadedRules = await settingsApi.getFollowUpRules(currentClinic.id)
      setRules(loadedRules)
    } catch (error) {
      console.error("Failed to load follow-up rules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!rules) return

    setIsSaving(true)
    try {
      await settingsApi.updateFollowUpRules(currentClinic.id, rules)
      // Show success feedback (could use toast here)
    } catch (error) {
      console.error("Failed to save follow-up rules:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !rules) {
    return <CardSkeleton lines={4} />
  }

  return (
    <div className="space-y-6">
      {/* Auto Follow-up Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.autoFollowUp}</CardTitle>
          <CardDescription>{t.settings.autoFollowUpDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="follow-up-cancelled">{t.settings.createTasksAfterCancellation}</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.settings.createTasksAfterCancellationHint}
              </p>
            </div>
            <Switch
              id="follow-up-cancelled"
              checked={rules.followUpOnCancelled}
              onCheckedChange={(checked) => setRules({ ...rules, followUpOnCancelled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="follow-up-no-show">{t.settings.createTasksAfterNoShow}</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.settings.createTasksAfterNoShowHint}
              </p>
            </div>
            <Switch
              id="follow-up-no-show"
              checked={rules.followUpOnNoShow}
              onCheckedChange={(checked) => setRules({ ...rules, followUpOnNoShow: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timing Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.timing}</CardTitle>
          <CardDescription>{t.settings.timingDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cancel-delay-hours">{t.settings.cancellationFollowUpAfter}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="cancel-delay-hours"
                type="number"
                min="0"
                max="168"
                value={rules.cancelFollowUpDelayHours}
                onChange={(e) =>
                  setRules({ ...rules, cancelFollowUpDelayHours: Number(e.target.value) })
                }
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.settings.hours}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.settings.cancelDelayHint}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="no-show-delay-hours">{t.settings.noShowFollowUpAfter}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="no-show-delay-hours"
                type="number"
                min="0"
                max="168"
                value={rules.noShowFollowUpDelayHours}
                onChange={(e) =>
                  setRules({ ...rules, noShowFollowUpDelayHours: Number(e.target.value) })
                }
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.settings.hours}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.settings.noShowDelayHint}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attempts Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.attempts}</CardTitle>
          <CardDescription>{t.settings.attemptsDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="max-attempts">{t.settings.maxAttempts}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="max-attempts"
                type="number"
                min="1"
                max="10"
                value={rules.maxAttempts}
                onChange={(e) => setRules({ ...rules, maxAttempts: Number(e.target.value) })}
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.settings.attemptsUnit}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.settings.maxAttemptsHint}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="days-between-attempts">{t.settings.daysBetweenAttempts}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="days-between-attempts"
                type="number"
                min="1"
                max="30"
                value={rules.daysBetweenAttempts}
                onChange={(e) => setRules({ ...rules, daysBetweenAttempts: Number(e.target.value) })}
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.settings.days}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.settings.daysBetweenHint}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mark-cold">{t.settings.markColdAfterMax}</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.settings.markColdHint}
              </p>
            </div>
            <Switch
              id="mark-cold"
              checked={rules.markColdAfterMaxAttempts}
              onCheckedChange={(checked) => setRules({ ...rules, markColdAfterMaxAttempts: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Inactivity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Inactivity</CardTitle>
          <CardDescription>Configure patient inactivity detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="inactivity-threshold">Mark patient Inactive after (days without activity)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="inactivity-threshold"
                type="number"
                min="1"
                max="365"
                value={rules.inactivityDaysThreshold}
                onChange={(e) =>
                  setRules({ ...rules, inactivityDaysThreshold: Number(e.target.value) })
                }
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Patient is inactive only when no upcoming appointment and no open tasks
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours Section (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.quietHours}</CardTitle>
          <CardDescription>{t.settings.quietHoursDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quiet-start">{t.settings.startTime}</Label>
              <Input
                id="quiet-start"
                type="time"
                value={rules.quietHours?.start || "22:00"}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    quietHours: { ...rules.quietHours, start: e.target.value, end: rules.quietHours?.end || "10:00" },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiet-end">{t.settings.endTime}</Label>
              <Input
                id="quiet-end"
                type="time"
                value={rules.quietHours?.end || "10:00"}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    quietHours: { ...rules.quietHours, start: rules.quietHours?.start || "22:00", end: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={loadRules} className="w-full sm:w-auto">
          {t.settings.reset}
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? t.settings.saving : t.settings.saveChanges}
        </Button>
      </div>
    </div>
  )
}
