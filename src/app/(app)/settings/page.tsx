"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Switch } from "@/components/Switch"
import { Badge } from "@/components/Badge"
import { Tooltip } from "@/components/Tooltip"
import { PageHeader } from "@/components/shared/PageHeader"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useFeatures } from "@/features/settings/useFeatures"
import * as settingsApi from "@/api/settings.api"
import { getPlanTierName, getPlanTierPrice } from "@/features/settings/planCatalog"
import type { FeatureKey } from "@/features/settings/settings.types"
import {
  RiUserLine,
  RiLockLine,
  RiBuildingLine,
  RiPaletteLine,
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
} from "@remixicon/react"
import { FollowUpRulesTab } from "./FollowUpRulesTab"

type TabId = "profile" | "clinic-team" | "modules" | "preferences" | "followup"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("modules")
  const { currentUser } = useUserClinic()

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: RiUserLine },
    { id: "clinic-team" as const, label: "Clinic & Team", icon: RiBuildingLine },
    { id: "modules" as const, label: "Modules", icon: RiPuzzleLine },
    { id: "followup" as const, label: "Follow-up Rules", icon: RiRefreshLine },
    { id: "preferences" as const, label: "Appointments", icon: RiCalendarLine },
  ]

  // Check permissions
  const canEditModules = currentUser.role === "manager" || !!currentUser.isManager

  return (
    <div className="page-content">
      <PageHeader title="Settings" />

      {/* Tab Navigation - Responsive */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-4 overflow-x-auto pb-px sm:space-x-8" aria-label="Settings tabs">
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
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content - Responsive */}
      <div className="mt-4 sm:mt-6">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "clinic-team" && <ClinicTeamTab />}
        {activeTab === "modules" && <ModulesTab canEdit={canEditModules} />}
        {activeTab === "followup" && <FollowUpRulesTab />}
        {activeTab === "preferences" && <PreferencesTab />}
      </div>
    </div>
  )
}

// Profile Tab
function ProfileTab() {
  const { currentUser } = useUserClinic()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" defaultValue={currentUser.first_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" defaultValue={currentUser.last_name} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={currentUser.email} />
          </div>

          {currentUser.specialization && (
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" defaultValue={currentUser.specialization} />
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="w-full sm:w-auto">Cancel</Button>
            <Button variant="primary" className="w-full sm:w-auto">Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
          <CardDescription>Customize your TabibDesk experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
            >
              <option>English</option>
              <option>العربية</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
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
            <Label htmlFor="time-format">Time Format</Label>
            <select
              id="time-format"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
            >
              <option>12-hour (AM/PM)</option>
              <option>24-hour</option>
            </select>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="w-full sm:w-auto">Cancel</Button>
            <Button variant="primary" className="w-full sm:w-auto">Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Clinic & Team Tab (Merged)
function ClinicTeamTab() {
  const { currentClinic, allClinics, setCurrentClinic, allUsers } = useUserClinic()
  const [clinicSettings, setClinicSettings] = useState(currentClinic)

  return (
    <div className="space-y-6">
      {/* Clinic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Clinic Settings</CardTitle>
          <CardDescription>Manage clinic information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {allClinics.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="clinic-selector">Selected Clinic</Label>
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
            <Label htmlFor="clinic-name">Clinic Name</Label>
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
              <Label htmlFor="timezone">Timezone</Label>
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
              <Label htmlFor="appointment-duration">Default Appointment (min)</Label>
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
                <Badge variant="neutral" className="w-fit capitalize sm:shrink-0">
                  {user.role}
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
      title: "Core Modules",
      description: "Essential features for patient care",
      features: [
        { key: "patients" as const, name: "Patients", description: "Patient records and profiles", icon: RiUserLine },
        { key: "appointments" as const, name: "Appointments", description: "Scheduling and calendar management", icon: RiCalendarLine },
        { key: "tasks" as const, name: "Tasks", description: "Task management and assignments", icon: RiTaskLine },
        { key: "insights" as const, name: "Insights", description: "Analytics and reporting", icon: RiBarChartLine },
      ],
    },
    {
      title: "Optional Modules",
      description: "Additional features for enhanced workflow",
      features: [
        { key: "labs" as const, name: "Labs", description: "Lab results and test management", icon: RiTestTubeLine },
        { key: "medications" as const, name: "Medications", description: "Prescription and medication tracking", icon: RiCapsuleLine },
        { key: "files" as const, name: "Files", description: "Document storage and attachments", icon: RiFileLine },
        { key: "reminders" as const, name: "Reminders", description: "Automated appointment reminders", icon: RiNotification3Line },
      ],
    },
    {
      title: "AI Features",
      description: "Advanced AI-powered capabilities",
      features: [
        { key: "ai_summary" as const, name: "AI Clinical Notes", description: "Automatic visit note summaries", icon: RiRobotLine },
        { key: "ai_dictation" as const, name: "AI Voice Dictation", description: "Voice-to-text transcription", icon: RiVoiceprintLine },
        { key: "ai_lab_extraction" as const, name: "AI Lab Extraction", description: "Automated lab report parsing", icon: RiScan2Line },
      ],
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Modules</CardTitle>
        <CardDescription className="space-y-1">
          <span>Control which features are available to your team.</span>
          {planTier && (
            <span className="block sm:inline sm:ml-2">
              Current plan: <strong>{getPlanTierName(planTier)}</strong> ({getPlanTierPrice(planTier)}/month)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {!canEdit && (
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              Only managers can modify feature settings. Contact your clinic administrator to make changes.
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
                            <Tooltip content={`Upgrade to ${planTier === "solo" ? "Multi" : "More"} plan`}>
                              <Badge variant="warning" className="flex items-center gap-1">
                                <RiLockLine className="size-3" />
                                Upgrade
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
            <RiSparklingLine className="mr-1 inline-block size-4" />
            Features locked by your subscription plan require an upgrade.{" "}
            <a href="/#pricing" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View Plans
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Appointments Tab
function PreferencesTab() {
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
          <CardTitle>Appointment Settings</CardTitle>
          <CardDescription>Configure default appointment behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="buffer-minutes">Buffer Time Between Appointments</Label>
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
              <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Time gap between appointments for preparation and cleanup
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setBufferMinutes(5)} className="w-full sm:w-auto">
              Reset
            </Button>
            <Button variant="primary" onClick={handleSaveAppointmentSettings} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
