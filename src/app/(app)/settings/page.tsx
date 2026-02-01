"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Switch } from "@/components/Switch"
import { Badge } from "@/components/Badge"
import { Tooltip } from "@/components/Tooltip"
import { PageHeader } from "@/components/shared/PageHeader"
import { useLocale } from "@/contexts/locale-context"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useFeatures } from "@/features/settings/useFeatures"
import * as settingsApi from "@/api/settings.api"
import { getPlanTierName, getPlanTierPrice } from "@/features/settings/planCatalog"
import type { FeatureKey } from "@/features/settings/settings.types"
import {
  RiUserLine,
  RiLockLine,
  RiBuildingLine,
  RiPuzzleLine,
  RiSparklingLine,
  RiCalendarLine,
  RiTaskLine,
  RiBarChartLine,
  RiTestTubeLine,
  RiCapsuleLine,
  RiFileLine,
  RiNotification3Line,
  RiRobotLine,
  RiVoiceprintLine,
  RiScan2Line,
  RiRefreshLine,
  RiUserHeartLine,
} from "@remixicon/react"
import { FollowUpRulesTab } from "./FollowUpRulesTab"
import { getBasicMetrics, getSpecialtyMetrics } from "@/types/progress"

type TabId = "profile" | "clinic-team" | "modules" | "preferences" | "followup" | "patient"

const TAB_IDS: TabId[] = ["profile", "clinic-team", "modules", "preferences", "followup", "patient"]

function isValidTabId(value: string | null): value is TabId {
  return value !== null && TAB_IDS.includes(value as TabId)
}

function SettingsPageContent() {
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    isValidTabId(tabFromUrl) ? tabFromUrl : "modules"
  )
  const { currentUser } = useUserClinic()
  const t = useAppTranslations()

  // Sync activeTab with ?tab= when URL changes (e.g. from Bot page deep link)
  useEffect(() => {
    if (isValidTabId(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const tabs = [
    { id: "profile" as const, label: t.settings.profile, labelShort: t.settings.profile, icon: RiUserLine },
    { id: "clinic-team" as const, label: t.settings.clinicTeam, labelShort: t.common.clinic.split(" ")[0], icon: RiBuildingLine },
    { id: "modules" as const, label: t.settings.modules, labelShort: t.settings.modules, icon: RiPuzzleLine },
    { id: "followup" as const, label: t.settings.followUpRules, labelShort: t.settings.followUpRules.split(" ")[0], icon: RiRefreshLine },
    { id: "patient" as const, label: t.settings.patient, labelShort: t.settings.patient, icon: RiUserHeartLine },
    { id: "preferences" as const, label: t.settings.appointments, labelShort: t.settings.appointments, icon: RiCalendarLine },
  ]

  // Check permissions
  const canEditModules = currentUser.role === "manager" || !!currentUser.isManager

  return (
    <div className="page-content">
      <PageHeader title={t.settings.title} />

      {/* Tab Navigation - same structure as Appointments/Accounting for consistent spacing */}
      <div className="space-y-3">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex gap-4 overflow-x-auto pb-px sm:gap-8" aria-label="Settings tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-1 py-3 text-xs font-medium transition-colors sm:gap-2 sm:py-4 sm:text-sm ${
                  isActive
                    ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={`size-4 shrink-0 sm:size-5 ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-500 group-hover:text-gray-700 dark:text-gray-500 dark:group-hover:text-gray-300"
                  }`}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.labelShort}</span>
              </button>
            )
          })}
        </nav>
        </div>
      </div>

      {/* Tab Content - Responsive */}
      <div className="mt-4 sm:mt-6">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "clinic-team" && <ClinicTeamTab />}
        {activeTab === "modules" && <ModulesTab canEdit={canEditModules} />}
        {activeTab === "followup" && <FollowUpRulesTab />}
        {activeTab === "patient" && <PatientTab />}
        {activeTab === "preferences" && <PreferencesTab />}
      </div>
    </div>
  )
}

// Profile Tab
function ProfileTab() {
  const { currentUser } = useUserClinic()
  const t = useAppTranslations()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.profileSettings}</CardTitle>
          <CardDescription>{t.settings.updatePersonalInfo}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first-name">{t.settings.firstName}</Label>
              <Input id="first-name" defaultValue={currentUser.first_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">{t.settings.lastName}</Label>
              <Input id="last-name" defaultValue={currentUser.last_name} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input id="email" type="email" defaultValue={currentUser.email} />
          </div>

          {currentUser.specialization && (
            <div className="space-y-2">
              <Label htmlFor="specialization">{t.settings.specialization}</Label>
              <Input id="specialization" defaultValue={currentUser.specialization} />
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="w-full sm:w-auto">{t.common.cancel}</Button>
            <Button variant="primary" className="w-full sm:w-auto">{t.settings.saveChanges}</Button>
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.appPreferences}</CardTitle>
          <CardDescription>{t.settings.customizeExperience}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">{t.settings.language}</Label>
            <LanguageSelect />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">{t.settings.dateFormat}</Label>
            <select
              id="date-format"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
            >
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time-format">{t.settings.timeFormat}</Label>
            <select
              id="time-format"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
            >
              <option>{t.settings.timeFormat12}</option>
              <option>{t.settings.timeFormat24}</option>
            </select>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="w-full sm:w-auto">{t.common.cancel}</Button>
            <Button variant="primary" className="w-full sm:w-auto">{t.settings.saveChanges}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LanguageSelect() {
  const { lang, setLanguage } = useLocale()
  const t = useAppTranslations()

  return (
    <select
      id="language"
      value={lang}
      onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
    >
      <option value="en">{t.settings.english}</option>
      <option value="ar">{t.settings.arabic}</option>
    </select>
  )
}

// Clinic & Team Tab (Merged)
function ClinicTeamTab() {
  const t = useAppTranslations()
  const { currentClinic, allClinics, setCurrentClinic, allUsers } = useUserClinic()
  const [clinicSettings, setClinicSettings] = useState(currentClinic)

  return (
    <div className="space-y-6">
      {/* Clinic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.clinicSettings}</CardTitle>
          <CardDescription>{t.settings.manageClinicInfo}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {allClinics.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="clinic-selector">{t.settings.selectedClinic}</Label>
              <select
                id="clinic-selector"
                value={currentClinic.id}
                onChange={(e) => setCurrentClinic(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
              >
                {allClinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="clinic-name">{t.settings.clinicName}</Label>
            <Input
              id="clinic-name"
              value={clinicSettings.name}
              onChange={(e) => setClinicSettings({ ...clinicSettings, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinic-address">Address</Label>
            <Input
              id="clinic-address"
              value={clinicSettings.address}
              onChange={(e) => setClinicSettings({ ...clinicSettings, address: e.target.value })}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timezone">{t.settings.timezone}</Label>
              <select
                id="timezone"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
              >
                <option>Africa/Cairo (GMT+2)</option>
                <option>Asia/Dubai (GMT+4)</option>
                <option>Europe/London (GMT+0)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment-duration">{t.settings.defaultAppointmentMin}</Label>
              <Input id="appointment-duration" type="number" defaultValue={30} />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="w-full sm:w-auto">Cancel</Button>
            <Button variant="primary" className="w-full sm:w-auto">Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage users and roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                    {user.avatar_initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900 dark:text-gray-50">{user.full_name}</p>
                    <p className="truncate text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <Badge color="gray" size="xs">
                  {user.role === "doctor" ? t.common.doctor : user.role === "assistant" ? t.common.assistant : t.common.manager}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Modules Tab (Feature Flags) - MAIN TAB
function ModulesTab({ canEdit }: { canEdit: boolean }) {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const { effective, isLocked, planTier, refetch } = useFeatures()
  const [updating, setUpdating] = useState<FeatureKey | null>(null)

  const handleToggle = async (key: FeatureKey, currentValue: boolean) => {
    if (!canEdit || isLocked(key)) return

    setUpdating(key)
    try {
      await settingsApi.updateClinicFeatureFlag(currentClinic.id, key, !currentValue)
      refetch()
    } catch (error) {
      console.error("Failed to update feature flag:", error)
    } finally {
      setUpdating(null)
    }
  }

  const featureGroups = [
    {
      title: t.settings.coreModules,
      description: t.settings.essentialFeatures,
      features: [
        { key: "patients" as const, name: t.nav.patients, description: t.settings.patientsDesc, icon: RiUserLine },
        { key: "appointments" as const, name: t.nav.appointments, description: t.settings.appointmentsDesc, icon: RiCalendarLine },
        { key: "tasks" as const, name: t.nav.tasks, description: t.settings.tasksDesc, icon: RiTaskLine },
        { key: "insights" as const, name: t.nav.insights, description: t.settings.insightsDesc, icon: RiBarChartLine },
      ],
    },
    {
      title: t.settings.optionalModules,
      description: t.settings.additionalFeatures,
      features: [
        { key: "labs" as const, name: t.settings.labs, description: t.settings.labsDesc, icon: RiTestTubeLine },
        { key: "medications" as const, name: t.settings.medications, description: t.settings.medicationsDesc, icon: RiCapsuleLine },
        { key: "files" as const, name: t.settings.files, description: t.settings.filesDesc, icon: RiFileLine },
        { key: "reminders" as const, name: t.settings.reminders, description: t.settings.remindersDesc, icon: RiNotification3Line },
      ],
    },
    {
      title: t.settings.aiFeatures,
      description: t.settings.aiCapabilities,
      features: [
        { key: "ai_summary" as const, name: t.settings.aiClinicalNotes, description: t.settings.aiSummaryDesc, icon: RiRobotLine },
        { key: "ai_dictation" as const, name: t.settings.aiVoiceDictation, description: t.settings.aiDictationDesc, icon: RiVoiceprintLine },
        { key: "ai_lab_extraction" as const, name: t.settings.aiLabExtraction, description: t.settings.aiLabExtractionDesc, icon: RiScan2Line },
      ],
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.settings.featureModules}</CardTitle>
        <CardDescription className="space-y-1">
          <span>{t.settings.controlFeatures}</span>
          {planTier && (
            <span className="block sm:inline sm:ms-2">
              {t.settings.currentPlan} <strong>{getPlanTierName(planTier)}</strong> ({getPlanTierPrice(planTier)}{t.settings.perMonth})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {!canEdit && (
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              {t.settings.onlyManagersModify}
            </p>
          </div>
        )}

        {featureGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-50">{group.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{group.description}</p>
            </div>

            <div className="space-y-3">
              {group.features.map((feature) => {
                const locked = isLocked(feature.key)
                const enabled = effective[feature.key] ?? false
                const isUpdating = updating === feature.key
                const Icon = feature.icon

                return (
                  <div
                    key={feature.key}
                    className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <Icon className="size-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-gray-50">{feature.name}</p>
                          {locked && (
                            <Tooltip content={planTier === "solo" ? t.settings.upgradeToMulti : t.settings.upgradeToMore}>
                              <Badge color="amber" size="xs">
                                <RiLockLine className="size-3" />
                                {t.settings.upgrade}
                              </Badge>
                            </Tooltip>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 sm:justify-start">
                      {isUpdating && (
                        <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
                      )}
                      <Switch
                        checked={enabled}
                        disabled={!canEdit || locked || isUpdating}
                        onCheckedChange={() => handleToggle(feature.key, enabled)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <RiSparklingLine className="me-1 inline-block size-4" />
            {t.settings.featuresLockedPlan}{" "}
            <a href="/#pricing" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
              {t.settings.viewPlans}
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

const DEFAULT_ENABLED_METRIC_IDS = ["weight", "bmi", "bp", "pulse", "blood_sugar"]

// Patient tab: progress metrics (enable/disable; all enabled metrics show in patient Progress section)
function PatientTab() {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const [enabledIds, setEnabledIds] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    settingsApi.getClinicSettings(currentClinic.id).then((settings) => {
      const enabled =
        settings.enabledProgressMetricIds && settings.enabledProgressMetricIds.length > 0
          ? settings.enabledProgressMetricIds
          : DEFAULT_ENABLED_METRIC_IDS
      setEnabledIds(new Set(enabled))
    })
  }, [currentClinic.id])

  const toggleMetric = (id: string) => {
    setEnabledIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await settingsApi.updateClinicSettings(currentClinic.id, {
        enabledProgressMetricIds: Array.from(enabledIds),
      })
    } catch (error) {
      console.error("Failed to save progress settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const basicMetrics = getBasicMetrics()
  const specialtyMetrics = getSpecialtyMetrics()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.progressMetrics}</CardTitle>
          <CardDescription>
            {t.settings.progressMetricsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Basic metrics</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {basicMetrics.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{m.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({m.unit})</span>
                    </div>
                    <Switch
                      checked={enabledIds.has(m.id)}
                      onCheckedChange={() => toggleMetric(m.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Specialty metrics</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {specialtyMetrics.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{m.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({m.unit})</span>
                    </div>
                    <Switch
                      checked={enabledIds.has(m.id)}
                      onCheckedChange={() => toggleMetric(m.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="primary" onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? t.settings.saving : t.settings.saveChanges}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Appointments Tab
function PreferencesTab() {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const [bufferMinutes, setBufferMinutes] = useState(5)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load current clinic settings
    settingsApi.getClinicSettings(currentClinic.id).then((settings) => {
      setBufferMinutes(settings.bufferMinutes || 5)
    })
  }, [currentClinic.id])

  const handleSaveAppointmentSettings = async () => {
    setIsSaving(true)
    try {
      await settingsApi.updateClinicSettings(currentClinic.id, {
        bufferMinutes,
      })
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Appointment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.appointmentSettings}</CardTitle>
          <CardDescription>{t.settings.configureAppointment}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="buffer-minutes">{t.settings.bufferTime}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="buffer-minutes"
                type="number"
                min="0"
                max="60"
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.settings.minutes}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.settings.bufferTimeHint}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setBufferMinutes(5)} className="w-full sm:w-auto">
              {t.settings.reset}
            </Button>
            <Button variant="primary" onClick={handleSaveAppointmentSettings} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? t.settings.saving : t.settings.saveChanges}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="page-content flex min-h-[200px] items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  )
}
