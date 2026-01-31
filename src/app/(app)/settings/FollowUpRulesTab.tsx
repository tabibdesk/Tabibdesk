"use client"

import { useState, useEffect } from "react"
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
          <CardTitle>Auto Follow-up</CardTitle>
          <CardDescription>Automatically create tasks when appointments are cancelled or marked no-show</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="follow-up-cancelled">Create tasks after cancellation</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically create a follow-up task when an appointment is cancelled
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
              <Label htmlFor="follow-up-no-show">Create tasks after no-show</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically create a follow-up task when a patient doesn&apos;t show up
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
          <CardTitle>Timing</CardTitle>
          <CardDescription>Configure when follow-up tasks should be due</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cancel-delay-hours">Cancellation follow-up after (hours)</Label>
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
              <span className="text-sm text-gray-600 dark:text-gray-400">hours</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Delay before creating follow-up task for cancelled appointments
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="no-show-delay-hours">No-show follow-up after (hours)</Label>
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
              <span className="text-sm text-gray-600 dark:text-gray-400">hours</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Delay before creating follow-up task for no-show appointments (typically same-day)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attempts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Attempts</CardTitle>
          <CardDescription>Configure retry attempts and patient status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="max-attempts">Max attempts</Label>
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
              <span className="text-sm text-gray-600 dark:text-gray-400">attempts</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Maximum number of follow-up attempts before marking patient as Cold
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="days-between-attempts">Days between attempts</Label>
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
              <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Wait time between follow-up attempts
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mark-cold">Mark patient Cold after max attempts</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically mark patient as Cold when max attempts reached
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
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>Optional: Define hours when follow-ups should not be scheduled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quiet-start">Start time</Label>
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
              <Label htmlFor="quiet-end">End time</Label>
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
          Reset
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
