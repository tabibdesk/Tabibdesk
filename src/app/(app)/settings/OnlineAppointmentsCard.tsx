"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Switch } from "@/components/Switch"
import { Badge } from "@/components/Badge"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useAppTranslations } from "@/lib/useAppTranslations"
import * as settingsApi from "@/api/settings.api"
import type { OnlineAppointmentSettings } from "@/features/settings/settings.types"
import { RiGoogleFill, RiCalendarLine, RiVideoAddLine, RiCheckboxCircleLine } from "@remixicon/react"

const DEFAULT_ONLINE_SETTINGS: OnlineAppointmentSettings = {
  googleCalendarConnected: false,
  autoCreateMeetLinks: false,
}

export function OnlineAppointmentsCard() {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const [settings, setSettings] = useState<OnlineAppointmentSettings>(DEFAULT_ONLINE_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    settingsApi.getClinicSettings(currentClinic.id).then((clinic) => {
      const online = clinic.onlineAppointmentSettings
      setSettings(
        online
          ? { ...DEFAULT_ONLINE_SETTINGS, ...online }
          : DEFAULT_ONLINE_SETTINGS
      )
    }).catch(() => setSettings(DEFAULT_ONLINE_SETTINGS))
      .finally(() => setIsLoading(false))
  }, [currentClinic.id])

  const handleConnectGoogle = async () => {
    if (settings.googleCalendarConnected) return
    setIsConnecting(true)
    try {
      // Simulate OAuth flow - in production this would redirect to Google OAuth
      // and an Edge Function would handle the callback and store tokens
      await new Promise((r) => setTimeout(r, 1200))
      const updated: OnlineAppointmentSettings = {
        ...settings,
        googleCalendarConnected: true,
        googleCalendarEmail: currentClinic.name ? `${currentClinic.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com` : "calendar@clinic.com",
      }
      await settingsApi.updateClinicSettings(currentClinic.id, {
        onlineAppointmentSettings: updated,
      })
      setSettings(updated)
    } catch (err) {
      console.error("Failed to connect Google Calendar:", err)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!settings.googleCalendarConnected) return
    const updated: OnlineAppointmentSettings = {
      ...DEFAULT_ONLINE_SETTINGS,
      autoCreateMeetLinks: false,
    }
    setIsSaving(true)
    try {
      await settingsApi.updateClinicSettings(currentClinic.id, {
        onlineAppointmentSettings: updated,
      })
      setSettings(updated)
    } catch (err) {
      console.error("Failed to disconnect:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleMeetLinks = async (checked: boolean) => {
    const updated = { ...settings, autoCreateMeetLinks: checked }
    setSettings(updated)
    setIsSaving(true)
    try {
      await settingsApi.updateClinicSettings(currentClinic.id, {
        onlineAppointmentSettings: updated,
      })
    } catch (err) {
      console.error("Failed to update settings:", err)
      setSettings((s) => ({ ...s, autoCreateMeetLinks: !checked }))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.onlineAppointments}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <RiCalendarLine className="size-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <CardTitle>{t.settings.onlineAppointments}</CardTitle>
            <CardDescription>{t.settings.onlineAppointmentsDesc}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Google Calendar connection status */}
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <RiGoogleFill className="size-5 text-[#4285F4]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  Google Calendar
                </p>
                {settings.googleCalendarConnected ? (
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <Badge color="emerald" size="xs">
                      <RiCheckboxCircleLine className="size-3 me-0.5" />
                      {t.settings.googleCalendarConnected}
                    </Badge>
                    {settings.googleCalendarEmail && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t.settings.connectedAs} {settings.googleCalendarEmail}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t.settings.googleCalendarNotConnected}
                  </p>
                )}
              </div>
            </div>
            <div className="shrink-0">
              {settings.googleCalendarConnected ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isSaving}
                  className="text-gray-600 hover:text-destructive dark:text-gray-400"
                >
                  {t.settings.disconnectCalendar}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConnectGoogle}
                  disabled={isConnecting}
                  className="gap-2"
                >
                  {isConnecting ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
                      {t.settings.connecting}
                    </>
                  ) : (
                    <>
                      <RiGoogleFill className="size-4" />
                      {t.settings.connectGoogleCalendar}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Auto-create Meet links toggle */}
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <RiVideoAddLine className="size-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {t.settings.autoCreateMeetLinks}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.settings.autoCreateMeetLinksDesc}
              </p>
            </div>
          </div>
          <Switch
            checked={settings.autoCreateMeetLinks}
            onCheckedChange={handleToggleMeetLinks}
            disabled={!settings.googleCalendarConnected || isSaving}
          />
        </div>

        {!settings.googleCalendarConnected && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {t.settings.onlineAppointmentsConnectHint}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
