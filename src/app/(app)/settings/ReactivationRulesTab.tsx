"use client"

import { useState, useEffect, useCallback } from "react"
import { RiArrowDownSLine } from "@remixicon/react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { cx } from "@/lib/utils"
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
  ClinicFollowUpRules,
  PatientCommunicationRules,
  QueueWaitlistRules,
  FinancialAdminRules,
} from "@/features/settings/settings.types"

export function ReactivationRulesTab() {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const [followUpRules, setFollowUpRules] = useState<ClinicFollowUpRules | null>(null)
  const [patientCommRules, setPatientCommRules] =
    useState<PatientCommunicationRules | null>(null)
  const [queueWaitlistRules, setQueueWaitlistRules] =
    useState<QueueWaitlistRules | null>(null)
  const [financialAdminRules, setFinancialAdminRules] =
    useState<FinancialAdminRules | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())

  const toggleTemplate = useCallback((id: string) => {
    setExpandedTemplates((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  useEffect(() => {
    loadRules()
  }, [currentClinic.id])

  const loadRules = async () => {
    setIsLoading(true)
    try {
      const [followUp, patientComm, queueWaitlist, financial] =
        await Promise.all([
          settingsApi.getFollowUpRules(currentClinic.id),
          settingsApi.getPatientCommunicationRules(currentClinic.id),
          settingsApi.getQueueWaitlistRules(currentClinic.id),
          settingsApi.getFinancialAdminRules(currentClinic.id),
        ])
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
      !followUpRules ||
      !patientCommRules ||
      !queueWaitlistRules ||
      !financialAdminRules
    )
      return

    setIsSaving(true)
    try {
      await Promise.all([
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
    !followUpRules ||
    !patientCommRules ||
    !queueWaitlistRules ||
    !financialAdminRules
  ) {
    return <CardSkeleton lines={4} borderless />
  }

  const pcr = patientCommRules
  const qwr = queueWaitlistRules
  const far = financialAdminRules

  return (
    <div className="space-y-6">
      {/* 1. Appointment Messages */}
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
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 mt-2">
                <button
                  type="button"
                  onClick={() => toggleTemplate("appt-confirm")}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  aria-expanded={expandedTemplates.has("appt-confirm")}
                >
                  <span>{t.settings.editTemplate}</span>
                  <RiArrowDownSLine className={cx("size-4 shrink-0 transition-transform rtl:rotate-180", expandedTemplates.has("appt-confirm") && "rotate-180")} aria-hidden />
                </button>
                {expandedTemplates.has("appt-confirm") && (
                  <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
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
                      className="mt-2"
                    />
                  </div>
                )}
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
                <div className="rounded-lg border border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => toggleTemplate("smart-reminders")}
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    aria-expanded={expandedTemplates.has("smart-reminders")}
                  >
                    <span>{t.settings.editTemplate}</span>
                    <RiArrowDownSLine className={cx("size-4 shrink-0 transition-transform rtl:rotate-180", expandedTemplates.has("smart-reminders") && "rotate-180")} aria-hidden />
                  </button>
                  {expandedTemplates.has("smart-reminders") && (
                    <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
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
                        className="mt-2"
                      />
                    </div>
                  )}
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
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => toggleTemplate("prep-notes")}
                        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        aria-expanded={expandedTemplates.has("prep-notes")}
                      >
                        <span>{t.settings.editTemplate}</span>
                        <RiArrowDownSLine className={cx("size-4 shrink-0 transition-transform rtl:rotate-180", expandedTemplates.has("prep-notes") && "rotate-180")} aria-hidden />
                      </button>
                      {expandedTemplates.has("prep-notes") && (
                        <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
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
                            className="mt-2"
                          />
                        </div>
                      )}
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
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 mt-2">
                <button
                  type="button"
                  onClick={() => toggleTemplate("reschedule")}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  aria-expanded={expandedTemplates.has("reschedule")}
                >
                  <span>{t.settings.editTemplate}</span>
                  <RiArrowDownSLine className={cx("size-4 shrink-0 transition-transform rtl:rotate-180", expandedTemplates.has("reschedule") && "rotate-180")} aria-hidden />
                </button>
                {expandedTemplates.has("reschedule") && (
                  <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
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
                      className="mt-2"
                    />
                  </div>
                )}
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
                <div className="rounded-lg border border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => toggleTemplate("follow-up")}
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    aria-expanded={expandedTemplates.has("follow-up")}
                  >
                    <span>{t.settings.editTemplate}</span>
                    <RiArrowDownSLine className={cx("size-4 shrink-0 transition-transform rtl:rotate-180", expandedTemplates.has("follow-up") && "rotate-180")} aria-hidden />
                  </button>
                  {expandedTemplates.has("follow-up") && (
                    <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
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
                        className="mt-2"
                      />
                    </div>
                  )}
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
                <div className="rounded-lg border border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => toggleTemplate("no-show")}
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    aria-expanded={expandedTemplates.has("no-show")}
                  >
                    <span>{t.settings.editTemplate}</span>
                    <RiArrowDownSLine className={cx("size-4 shrink-0 transition-transform rtl:rotate-180", expandedTemplates.has("no-show") && "rotate-180")} aria-hidden />
                  </button>
                  {expandedTemplates.has("no-show") && (
                    <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
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
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Queue & Waitlist */}
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
                <div className="rounded-lg border border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => toggleTemplate("virtual-queue")}
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    aria-expanded={expandedTemplates.has("virtual-queue")}
                  >
                    <span>{t.settings.editTemplate}</span>
                    <RiArrowDownSLine className={cx("size-4 shrink-0 transition-transform rtl:rotate-180", expandedTemplates.has("virtual-queue") && "rotate-180")} aria-hidden />
                  </button>
                  {expandedTemplates.has("virtual-queue") && (
                    <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
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
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delay Reminders */}
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
                <div className="rounded-lg border border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => toggleTemplate("delay")}
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    aria-expanded={expandedTemplates.has("delay")}
                  >
                    <span>{t.settings.editTemplate}</span>
                    <RiArrowDownSLine className={cx("size-4 shrink-0 transition-transform rtl:rotate-180", expandedTemplates.has("delay") && "rotate-180")} aria-hidden />
                  </button>
                  {expandedTemplates.has("delay") && (
                    <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
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
                        className="mt-2"
                      />
                    </div>
                  )}
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
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 mt-2">
                <button
                  type="button"
                  onClick={() => toggleTemplate("auto-fill-waitlist")}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  aria-expanded={expandedTemplates.has("auto-fill-waitlist")}
                >
                  <span>{t.settings.editTemplate}</span>
                  <RiArrowDownSLine className={cx("size-4 shrink-0 transition-transform rtl:rotate-180", expandedTemplates.has("auto-fill-waitlist") && "rotate-180")} aria-hidden />
                </button>
                {expandedTemplates.has("auto-fill-waitlist") && (
                  <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
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
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Payment & Receipts */}
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
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 mt-2">
                <button
                  type="button"
                  onClick={() => toggleTemplate("payment-receipt")}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  aria-expanded={expandedTemplates.has("payment-receipt")}
                >
                  <span>{t.settings.editTemplate}</span>
                  <RiArrowDownSLine className={cx("size-4 shrink-0 transition-transform rtl:rotate-180", expandedTemplates.has("payment-receipt") && "rotate-180")} aria-hidden />
                </button>
                {expandedTemplates.has("payment-receipt") && (
                  <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
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
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. Admin Notifications */}
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

      {/* 5. Staff Follow-up */}
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
