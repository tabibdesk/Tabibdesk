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
  ClinicFollowUpRules,
  ReactivationSequenceMessages,
  PatientCommunicationRules,
  QueueWaitlistRules,
  FinancialAdminRules,
} from "@/features/settings/settings.types"

export function ReactivationRulesTab() {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const [reactivationRules, setReactivationRules] =
    useState<ClinicReactivationRules | null>(null)
  const [followUpRules, setFollowUpRules] = useState<ClinicFollowUpRules | null>(null)
  const [patientCommRules, setPatientCommRules] =
    useState<PatientCommunicationRules | null>(null)
  const [queueWaitlistRules, setQueueWaitlistRules] =
    useState<QueueWaitlistRules | null>(null)
  const [financialAdminRules, setFinancialAdminRules] =
    useState<FinancialAdminRules | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadRules()
  }, [currentClinic.id])

  const loadRules = async () => {
    setIsLoading(true)
    try {
      const [reactivation, followUp, patientComm, queueWaitlist, financial] =
        await Promise.all([
          settingsApi.getReactivationRules(currentClinic.id),
          settingsApi.getFollowUpRules(currentClinic.id),
          settingsApi.getPatientCommunicationRules(currentClinic.id),
          settingsApi.getQueueWaitlistRules(currentClinic.id),
          settingsApi.getFinancialAdminRules(currentClinic.id),
        ])
      setReactivationRules(reactivation)
      setFollowUpRules(followUp)
      setPatientCommRules(patientComm)
      setQueueWaitlistRules(queueWaitlist)
      setFinancialAdminRules(financial)
    } catch (error) {
      console.error("Failed to load rules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (
      !reactivationRules ||
      !followUpRules ||
      !patientCommRules ||
      !queueWaitlistRules ||
      !financialAdminRules
    )
      return

    setIsSaving(true)
    try {
      await Promise.all([
        settingsApi.updateReactivationRules(currentClinic.id, reactivationRules),
        settingsApi.updateFollowUpRules(currentClinic.id, followUpRules),
        settingsApi.updatePatientCommunicationRules(
          currentClinic.id,
          patientCommRules
        ),
        settingsApi.updateQueueWaitlistRules(
          currentClinic.id,
          queueWaitlistRules
        ),
        settingsApi.updateFinancialAdminRules(
          currentClinic.id,
          financialAdminRules
        ),
      ])
    } catch (error) {
      console.error("Failed to save rules:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (
    isLoading ||
    !reactivationRules ||
    !followUpRules ||
    !patientCommRules ||
    !queueWaitlistRules ||
    !financialAdminRules
  ) {
    return <CardSkeleton lines={4} borderless />
  }

  const rules = reactivationRules
  const pcr = patientCommRules
  const qwr = queueWaitlistRules
  const far = financialAdminRules

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

      {/* 2. Appointment Messages */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.appointmentMessages}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booking Confirmation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="appt-confirm">{t.settings.appointmentConfirmations}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerApptConfirm}</p>
              </div>
              <Switch
                id="appt-confirm"
                checked={pcr.appointmentConfirmations.enabled}
                onCheckedChange={(checked) =>
                  setPatientCommRules({
                    ...pcr,
                    appointmentConfirmations: {
                      ...pcr.appointmentConfirmations,
                      enabled: checked,
                    },
                  })
                }
              />
            </div>
            {pcr.appointmentConfirmations.enabled && (
              <div className="space-y-2 ps-4 border-s-2 border-gray-200 dark:border-gray-700">
                <Label htmlFor="appt-confirm-template" className="text-xs text-gray-500 uppercase tracking-wider">
                  WhatsApp {t.settings.template}
                </Label>
                <Textarea
                  id="appt-confirm-template"
                  value={pcr.appointmentConfirmations.template ?? ""}
                  onChange={(e) =>
                    setPatientCommRules({
                      ...pcr,
                      appointmentConfirmations: {
                        ...pcr.appointmentConfirmations,
                        template: e.target.value,
                      },
                    })
                  }
                  placeholder={t.settings.sequenceMessagePlaceholder}
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Appointment Reminder */}
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="smart-reminders">{t.settings.smartReminders}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerSmartReminders}</p>
              </div>
              <Switch
                id="smart-reminders"
                checked={pcr.smartReminders.enabled}
                onCheckedChange={(checked) =>
                  setPatientCommRules({
                    ...pcr,
                    smartReminders: { ...pcr.smartReminders, enabled: checked },
                  })
                }
              />
            </div>
            {pcr.smartReminders.enabled && (
              <div className="space-y-4 ps-4 border-s-2 border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <Label htmlFor="smart-reminders-hours" className="text-xs">
                    {t.settings.hoursBefore}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="smart-reminders-hours"
                      type="number"
                      min="1"
                      max="168"
                      value={pcr.smartReminders.hoursBefore}
                      onChange={(e) =>
                        setPatientCommRules({
                          ...pcr,
                          smartReminders: {
                            ...pcr.smartReminders,
                            hoursBefore: Number(e.target.value),
                          },
                        })
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t.settings.hours}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smart-reminders-template" className="text-xs text-gray-500 uppercase tracking-wider">
                    WhatsApp {t.settings.template}
                  </Label>
                  <Textarea
                    id="smart-reminders-template"
                    value={pcr.smartReminders.template ?? ""}
                    onChange={(e) =>
                      setPatientCommRules({
                        ...pcr,
                        smartReminders: {
                          ...pcr.smartReminders,
                          template: e.target.value,
                        },
                      })
                    }
                    placeholder={t.settings.sequenceMessagePlaceholder}
                    rows={2}
                  />
                </div>
                
                {/* Prep Notes (now inside reminders) */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="include-prep"
                      checked={pcr.smartReminders.includePrepNotes}
                      onCheckedChange={(checked) =>
                        setPatientCommRules({
                          ...pcr,
                          smartReminders: {
                            ...pcr.smartReminders,
                            includePrepNotes: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="include-prep" className="text-sm font-normal cursor-pointer">
                      {t.settings.includePrepInReminder}
                    </Label>
                  </div>
                  {pcr.smartReminders.includePrepNotes && (
                    <div className="space-y-2 ps-4 border-s-2 border-gray-100 dark:border-gray-800">
                      <Label htmlFor="prep-content" className="text-xs text-gray-500 uppercase tracking-wider">
                        {t.settings.prepNotes} {t.settings.template}
                      </Label>
                      <Textarea
                        id="prep-content"
                        value={pcr.smartReminders.prepNotesContent ?? ""}
                        onChange={(e) =>
                          setPatientCommRules({
                            ...pcr,
                            smartReminders: {
                              ...pcr.smartReminders,
                              prepNotesContent: e.target.value,
                            },
                          })
                        }
                        placeholder={t.settings.prepNotesPlaceholder}
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reschedule Notification */}
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="reschedule-notif">{t.settings.rescheduleNotification}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerReschedule}</p>
              </div>
              <Switch
                id="reschedule-notif"
                checked={pcr.rescheduleNotification.enabled}
                onCheckedChange={(checked) =>
                  setPatientCommRules({
                    ...pcr,
                    rescheduleNotification: {
                      ...pcr.rescheduleNotification,
                      enabled: checked,
                    },
                  })
                }
              />
            </div>
            {pcr.rescheduleNotification.enabled && (
              <div className="space-y-2 ps-4 border-s-2 border-gray-200 dark:border-gray-700">
                <Label htmlFor="reschedule-template" className="text-xs text-gray-500 uppercase tracking-wider">
                  WhatsApp {t.settings.template}
                </Label>
                <Textarea
                  id="reschedule-template"
                  value={pcr.rescheduleNotification.template ?? ""}
                  onChange={(e) =>
                    setPatientCommRules({
                      ...pcr,
                      rescheduleNotification: {
                        ...pcr.rescheduleNotification,
                        template: e.target.value,
                      },
                    })
                  }
                  placeholder={t.settings.sequenceMessagePlaceholder}
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Post-visit Follow-up */}
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="follow-up-triggers">{t.settings.followUpTriggers}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerFollowUp}</p>
              </div>
              <Switch
                id="follow-up-triggers"
                checked={pcr.followUpTriggers.enabled}
                onCheckedChange={(checked) =>
                  setPatientCommRules({
                    ...pcr,
                    followUpTriggers: {
                      ...pcr.followUpTriggers,
                      enabled: checked,
                    },
                  })
                }
              />
            </div>
            {pcr.followUpTriggers.enabled && (
              <div className="space-y-4 ps-4 border-s-2 border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <Label htmlFor="follow-up-hours" className="text-xs">
                    {t.settings.hoursAfter}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="follow-up-hours"
                      type="number"
                      min="1"
                      max="168"
                      value={pcr.followUpTriggers.hoursAfterProcedure}
                      onChange={(e) =>
                        setPatientCommRules({
                          ...pcr,
                          followUpTriggers: {
                            ...pcr.followUpTriggers,
                            hoursAfterProcedure: Number(e.target.value),
                          },
                        })
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t.settings.hours}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow-up-template" className="text-xs text-gray-500 uppercase tracking-wider">
                    WhatsApp {t.settings.template}
                  </Label>
                  <Textarea
                    id="follow-up-template"
                    value={pcr.followUpTriggers.template ?? ""}
                    onChange={(e) =>
                      setPatientCommRules({
                        ...pcr,
                        followUpTriggers: {
                          ...pcr.followUpTriggers,
                          template: e.target.value,
                        },
                      })
                    }
                    placeholder={t.settings.sequenceMessagePlaceholder}
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          {/* No-Show Recovery */}
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="no-show-recovery">{t.settings.noShowRecovery}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerNoShow}</p>
              </div>
              <Switch
                id="no-show-recovery"
                checked={pcr.noShowRecovery.enabled}
                onCheckedChange={(checked) =>
                  setPatientCommRules({
                    ...pcr,
                    noShowRecovery: {
                      ...pcr.noShowRecovery,
                      enabled: checked,
                    },
                  })
                }
              />
            </div>
            {pcr.noShowRecovery.enabled && (
              <div className="space-y-4 ps-4 border-s-2 border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <Label htmlFor="no-show-minutes" className="text-xs">
                    {t.settings.minutesAfterScheduled}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="no-show-minutes"
                      type="number"
                      min="10"
                      max="120"
                      value={pcr.noShowRecovery.minutesAfter}
                      onChange={(e) =>
                        setPatientCommRules({
                          ...pcr,
                          noShowRecovery: {
                            ...pcr.noShowRecovery,
                            minutesAfter: Number(e.target.value),
                          },
                        })
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t.settings.minutes}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="no-show-template" className="text-xs text-gray-500 uppercase tracking-wider">
                    WhatsApp {t.settings.template}
                  </Label>
                  <Textarea
                    id="no-show-template"
                    value={pcr.noShowRecovery.template ?? ""}
                    onChange={(e) =>
                      setPatientCommRules({
                        ...pcr,
                        noShowRecovery: {
                          ...pcr.noShowRecovery,
                          template: e.target.value,
                        },
                      })
                    }
                    placeholder={t.settings.sequenceMessagePlaceholder}
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Re-engagement */}
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

          {/* Retry Attempts (moved here from Staff Tasks) */}
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

      {/* 4. Queue & Waitlist */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.queueWaitlist}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Virtual Queue Updates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="virtual-queue">{t.settings.virtualQueueUpdates}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerVirtualQueue}</p>
              </div>
              <Switch
                id="virtual-queue"
                checked={qwr.virtualQueueUpdates.enabled}
                onCheckedChange={(checked) =>
                  setQueueWaitlistRules({
                    ...qwr,
                    virtualQueueUpdates: {
                      ...qwr.virtualQueueUpdates,
                      enabled: checked,
                    },
                  })
                }
              />
            </div>
            {qwr.virtualQueueUpdates.enabled && (
              <div className="space-y-4 ps-4 border-s-2 border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <Label htmlFor="notify-next-n" className="text-xs">{t.settings.notifyNextN}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="notify-next-n"
                      type="number"
                      min="1"
                      max="10"
                      value={qwr.virtualQueueUpdates.notifyNextN}
                      onChange={(e) =>
                        setQueueWaitlistRules({
                          ...qwr,
                          virtualQueueUpdates: {
                            ...qwr.virtualQueueUpdates,
                            notifyNextN: Number(e.target.value),
                          },
                        })
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t.patients.title}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="virtual-queue-template" className="text-xs text-gray-500 uppercase tracking-wider">
                    WhatsApp {t.settings.template}
                  </Label>
                  <Textarea
                    id="virtual-queue-template"
                    value={qwr.virtualQueueUpdates.template ?? ""}
                    onChange={(e) =>
                      setQueueWaitlistRules({
                        ...qwr,
                        virtualQueueUpdates: {
                          ...qwr.virtualQueueUpdates,
                          template: e.target.value,
                        },
                      })
                    }
                    placeholder={t.settings.sequenceMessagePlaceholder}
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Delay Notifications */}
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="delay-notif">{t.settings.delayNotifications}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerDelay}</p>
              </div>
              <Switch
                id="delay-notif"
                checked={qwr.delayNotifications.enabled}
                onCheckedChange={(checked) =>
                  setQueueWaitlistRules({
                    ...qwr,
                    delayNotifications: {
                      ...qwr.delayNotifications,
                      enabled: checked,
                    },
                  })
                }
              />
            </div>
            {qwr.delayNotifications.enabled && (
              <div className="space-y-4 ps-4 border-s-2 border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <Label htmlFor="minutes-late" className="text-xs">{t.settings.minutesLate}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="minutes-late"
                      type="number"
                      min="5"
                      max="120"
                      value={qwr.delayNotifications.minutesLateThreshold}
                      onChange={(e) =>
                        setQueueWaitlistRules({
                          ...qwr,
                          delayNotifications: {
                            ...qwr.delayNotifications,
                            minutesLateThreshold: Number(e.target.value),
                          },
                        })
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t.settings.minutes}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay-template" className="text-xs text-gray-500 uppercase tracking-wider">
                    WhatsApp {t.settings.template}
                  </Label>
                  <Textarea
                    id="delay-template"
                    value={qwr.delayNotifications.template ?? ""}
                    onChange={(e) =>
                      setQueueWaitlistRules({
                        ...qwr,
                        delayNotifications: {
                          ...qwr.delayNotifications,
                          template: e.target.value,
                        },
                      })
                    }
                    placeholder={t.settings.sequenceMessagePlaceholder}
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Auto-Fill Waitlist */}
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="auto-fill-waitlist">{t.settings.autoFillWaitlist}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerAutoFill}</p>
              </div>
              <Switch
                id="auto-fill-waitlist"
                checked={qwr.autoFillWaitlist.enabled}
                onCheckedChange={(checked) =>
                  setQueueWaitlistRules({
                    ...qwr,
                    autoFillWaitlist: { ...qwr.autoFillWaitlist, enabled: checked },
                  })
                }
              />
            </div>
            {qwr.autoFillWaitlist.enabled && (
              <div className="space-y-2 ps-4 border-s-2 border-gray-200 dark:border-gray-700">
                <Label htmlFor="waitlist-template" className="text-xs text-gray-500 uppercase tracking-wider">
                  WhatsApp {t.settings.template}
                </Label>
                <Textarea
                  id="waitlist-template"
                  value={qwr.autoFillWaitlist.template ?? ""}
                  onChange={(e) =>
                    setQueueWaitlistRules({
                      ...qwr,
                      autoFillWaitlist: {
                        ...qwr.autoFillWaitlist,
                        template: e.target.value,
                      },
                    })
                  }
                  placeholder={t.settings.sequenceMessagePlaceholder}
                  rows={2}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 5. Payment & Receipts */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.paymentReceipts}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="payment-receipt">{t.settings.paymentReceipt}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerPaymentReceipt}</p>
              </div>
              <Switch
                id="payment-receipt"
                checked={far.autoInvoicing.enabled}
                onCheckedChange={(checked) =>
                  setFinancialAdminRules({
                    ...far,
                    autoInvoicing: {
                      ...far.autoInvoicing,
                      enabled: checked,
                    },
                  })
                }
              />
            </div>
            {far.autoInvoicing.enabled && (
              <div className="space-y-2 ps-4 border-s-2 border-gray-200 dark:border-gray-700">
                <Label htmlFor="invoice-template" className="text-xs text-gray-500 uppercase tracking-wider">
                  WhatsApp {t.settings.template}
                </Label>
                <Textarea
                  id="invoice-template"
                  value={far.autoInvoicing.template ?? ""}
                  onChange={(e) =>
                    setFinancialAdminRules({
                      ...far,
                      autoInvoicing: {
                        ...far.autoInvoicing,
                        template: e.target.value,
                      },
                    })
                  }
                  placeholder={t.settings.sequenceMessagePlaceholder}
                  rows={2}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 6. Admin Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.adminNotifications}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="daily-summary">{t.settings.dailySummary}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerDailySummary}</p>
              </div>
              <Switch
                id="daily-summary"
                checked={far.dailySummary.enabled}
                onCheckedChange={(checked) =>
                  setFinancialAdminRules({
                    ...far,
                    dailySummary: {
                      ...far.dailySummary,
                      enabled: checked,
                    },
                  })
                }
              />
            </div>
            {far.dailySummary.enabled && (
              <div className="space-y-2 ps-4 border-s-2 border-gray-200 dark:border-gray-700">
                <Label htmlFor="whatsapp-numbers" className="text-xs">
                  {t.settings.recipientWhatsappNumbers}
                </Label>
                <Textarea
                  id="whatsapp-numbers"
                  value={(far.dailySummary.recipientWhatsappNumbers ?? []).join(", ")}
                  onChange={(e) =>
                    setFinancialAdminRules({
                      ...far,
                      dailySummary: {
                        ...far.dailySummary,
                        recipientWhatsappNumbers: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="01001234567, 01112223334"
                  rows={2}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 7. Staff Follow-up */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.staffFollowUp}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <Label htmlFor="follow-up-cancelled">
                {t.settings.createTasksAfterCancellation}
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerTaskCancel}</p>
            </div>
            <Switch
              id="follow-up-cancelled"
              checked={followUpRules.followUpOnCancelled}
              onCheckedChange={(checked) =>
                setFollowUpRules({
                  ...followUpRules,
                  followUpOnCancelled: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-gray-50 dark:border-gray-900 pt-6">
            <div className="space-y-0.5 min-w-0">
              <Label htmlFor="follow-up-no-show">
                {t.settings.createTasksAfterNoShow}
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.triggerTaskNoShow}</p>
            </div>
            <Switch
              id="follow-up-no-show"
              checked={followUpRules.followUpOnNoShow}
              onCheckedChange={(checked) =>
                setFollowUpRules({ ...followUpRules, followUpOnNoShow: checked })
              }
            />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {t.settings.timing}
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancel-delay-hours" className="text-xs">
                  {t.settings.cancellationFollowUpAfter}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cancel-delay-hours"
                    type="number"
                    min="0"
                    max="168"
                    value={followUpRules.cancelFollowUpDelayHours}
                    onChange={(e) =>
                      setFollowUpRules({
                        ...followUpRules,
                        cancelFollowUpDelayHours: Number(e.target.value),
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t.settings.hours}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="no-show-delay-hours" className="text-xs">
                  {t.settings.noShowFollowUpAfter}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="no-show-delay-hours"
                    type="number"
                    min="0"
                    max="168"
                    value={followUpRules.noShowFollowUpDelayHours}
                    onChange={(e) =>
                      setFollowUpRules({
                        ...followUpRules,
                        noShowFollowUpDelayHours: Number(e.target.value),
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t.settings.hours}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={loadRules} className="w-full sm:w-auto">
          {t.settings.reset}
        </Button>
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
