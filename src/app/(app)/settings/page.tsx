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
  RiTeamLine,
  RiMapPinLine,
  RiAddLine,
  RiEditLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
} from "@remixicon/react"
import { FollowUpRulesTab } from "./FollowUpRulesTab"
import {
  ClinicSettingsDrawer,
  type BranchFormValues,
} from "./ClinicSettingsDrawer"
import { AvailabilityDrawer, type AvailabilityRecordPayload } from "./AvailabilityDrawer"
import { getClinicAppointmentTypes, setClinicAppointmentTypes } from "@/api/pricing.api"
import { getAppointmentTypeLabel } from "@/features/appointments/appointmentTypes"
import * as availabilityApi from "@/features/appointments/availability.api"
import type { DoctorAvailability } from "@/features/appointments/types"
import { TeamMemberAccessDrawer } from "./TeamMemberAccessDrawer"
import { getBasicMetrics, getSpecialtyMetrics } from "@/types/progress"
import { getClinicMembersByUserId } from "@/data/mock/users-clinics"
import { getBackendType } from "@/lib/api/repository-factory"
import type { ClinicMembership } from "./TeamMemberAccessDrawer"

type TabId = "account" | "clinic" | "team" | "appointments" | "patient" | "followup" | "modules"

const TAB_IDS: TabId[] = ["account", "clinic", "team", "appointments", "patient", "followup", "modules"]

function isValidTabId(value: string | null): value is TabId {
  return value !== null && TAB_IDS.includes(value as TabId)
}

function SettingsPageContent() {
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    isValidTabId(tabFromUrl) ? tabFromUrl : "account"
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
    { id: "account" as const, label: t.settings.account, labelShort: t.settings.account, icon: RiUserLine },
    { id: "clinic" as const, label: t.settings.clinic, labelShort: t.settings.clinic, icon: RiBuildingLine },
    { id: "team" as const, label: t.settings.team, labelShort: t.settings.team, icon: RiTeamLine },
    { id: "appointments" as const, label: t.settings.appointments, labelShort: t.settings.appointments, icon: RiCalendarLine },
    { id: "patient" as const, label: t.settings.patient, labelShort: t.settings.patient, icon: RiUserHeartLine },
    { id: "followup" as const, label: t.settings.followUpRules, labelShort: t.settings.followUpRules.split(" ")[0], icon: RiRefreshLine },
    { id: "modules" as const, label: t.settings.modules, labelShort: t.settings.modules, icon: RiPuzzleLine },
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
        {activeTab === "account" && <AccountTab />}
        {activeTab === "clinic" && <ClinicTab />}
        {activeTab === "team" && <TeamTab />}
        {activeTab === "appointments" && <AppointmentsTab />}
        {activeTab === "patient" && <PatientTab />}
        {activeTab === "followup" && <FollowUpRulesTab />}
        {activeTab === "modules" && <ModulesTab canEdit={canEditModules} />}
      </div>
    </div>
  )
}

// Account Tab (first tab: profile + app preferences)
function AccountTab() {
  const { currentUser } = useUserClinic()
  const t = useAppTranslations()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.profileSettings}</CardTitle>
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

const DEFAULT_BRANCH_TIMEZONE = "Africa/Cairo"
const DEFAULT_BRANCH_APPOINTMENT_MIN = 30

// Clinic Tab: branches card first; each branch shows full settings; Add/Edit open drawer
function ClinicTab() {
  const t = useAppTranslations()
  const { allClinics } = useUserClinic()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add")
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null)
  const [branchOverrides, setBranchOverrides] = useState<
    Record<string, Partial<BranchFormValues>>
  >({})
  const [localBranches, setLocalBranches] = useState<
    Array<{ id: string } & BranchFormValues>
  >([])

  const displayBranches: Array<{
    id: string
    name: string
    address: string
    timezone: string
    defaultAppointmentMin: number
    isLocal: boolean
  }> = [
    ...allClinics.map((c) => {
      const o = branchOverrides[c.id]
      return {
        id: c.id,
        name: o?.name ?? c.name,
        address: o?.address ?? c.address ?? "",
        timezone: o?.timezone ?? DEFAULT_BRANCH_TIMEZONE,
        defaultAppointmentMin: o?.defaultAppointmentMin ?? DEFAULT_BRANCH_APPOINTMENT_MIN,
        isLocal: false,
      }
    }),
    ...localBranches.map((b) => ({
      id: b.id,
      name: b.name,
      address: b.address,
      timezone: b.timezone,
      defaultAppointmentMin: b.defaultAppointmentMin,
      isLocal: true,
    })),
  ]

  const openAddDrawer = () => {
    setDrawerMode("add")
    setEditingBranchId(null)
    setDrawerOpen(true)
  }

  const openEditDrawer = (branchId: string) => {
    setDrawerMode("edit")
    setEditingBranchId(branchId)
    setDrawerOpen(true)
  }

  const getInitialValuesForEdit = (): BranchFormValues | null => {
    if (!editingBranchId) return null
    const local = localBranches.find((b) => b.id === editingBranchId)
    if (local)
      return {
        name: local.name,
        address: local.address,
        timezone: local.timezone,
        defaultAppointmentMin: local.defaultAppointmentMin,
      }
    const fromContext = allClinics.find((c) => c.id === editingBranchId)
    if (fromContext) {
      const o = branchOverrides[editingBranchId]
      return {
        name: o?.name ?? fromContext.name,
        address: o?.address ?? fromContext.address ?? "",
        timezone: o?.timezone ?? DEFAULT_BRANCH_TIMEZONE,
        defaultAppointmentMin: o?.defaultAppointmentMin ?? DEFAULT_BRANCH_APPOINTMENT_MIN,
      }
    }
    return null
  }

  const handleSaveBranch = (values: BranchFormValues) => {
    if (drawerMode === "add") {
      setLocalBranches((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, ...values },
      ])
    } else if (editingBranchId) {
      const isLocal = localBranches.some((b) => b.id === editingBranchId)
      if (isLocal) {
        setLocalBranches((prev) =>
          prev.map((b) =>
            b.id === editingBranchId ? { ...b, ...values } : b
          )
        )
      } else {
        setBranchOverrides((prev) => ({
          ...prev,
          [editingBranchId]: values,
        }))
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle>{t.settings.clinicBranches}</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={openAddDrawer}
            title={t.settings.addBranch}
          >
            <RiAddLine className="size-4" />
            <span className="hidden sm:inline">{t.settings.addBranch}</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayBranches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onEdit={() => openEditDrawer(branch.id)}
              editLabel={t.common.edit}
              t={t}
            />
          ))}
        </CardContent>
      </Card>

      <ClinicSettingsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        initialValues={drawerMode === "edit" ? getInitialValuesForEdit() : null}
        onSave={handleSaveBranch}
      />
    </div>
  )
}

function BranchCard({
  branch,
  onEdit,
  editLabel,
  t,
}: {
  branch: {
    id: string
    name: string
    address: string
    timezone: string
    defaultAppointmentMin: number
    isLocal: boolean
  }
  onEdit: () => void
  editLabel: string
  t: ReturnType<typeof useAppTranslations>
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <RiMapPinLine className="size-4 shrink-0 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              {branch.name}
            </span>
          </div>
          {branch.address && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{branch.address}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{t.settings.timezone}: {branch.timezone}</span>
            <span>
              {t.settings.defaultAppointmentMin}: {branch.defaultAppointmentMin} {t.settings.minutes}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={onEdit}
          aria-label={editLabel}
        >
          <RiEditLine className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// Pending invite (mock, persisted in localStorage per subscription)
type PendingInviteRole = "doctor" | "assistant" | "manager"
interface PendingInvite {
  id: string
  email: string
  role: PendingInviteRole
  clinicIds: string[]
  invitedAt: string
}

const PENDING_INVITES_KEY_PREFIX = "tabibdesk_pending_invites_"

function getPendingInvitesStorageKey(subscriptionId: string): string {
  return `${PENDING_INVITES_KEY_PREFIX}${subscriptionId || "default"}`
}

function loadPendingInvites(subscriptionId: string): PendingInvite[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(getPendingInvitesStorageKey(subscriptionId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is PendingInvite =>
        typeof item?.id === "string" &&
        typeof item?.email === "string" &&
        (item?.role === "doctor" || item?.role === "assistant" || item?.role === "manager") &&
        Array.isArray(item?.clinicIds) &&
        typeof item?.invitedAt === "string"
    )
  } catch {
    return []
  }
}

function savePendingInvites(subscriptionId: string, invites: PendingInvite[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(getPendingInvitesStorageKey(subscriptionId), JSON.stringify(invites))
  } catch {
    // ignore
  }
}

// Team Tab: invite members, assign roles, grant access to clinic or more
function TeamTab() {
  const t = useAppTranslations()
  const { allUsers, allClinics, currentClinic } = useUserClinic()
  const subscriptionId = currentClinic.subscription_id || "default"

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(() =>
    loadPendingInvites(subscriptionId)
  )
  const [inviteFormOpen, setInviteFormOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<PendingInviteRole>("assistant")
  const [inviteClinicIds, setInviteClinicIds] = useState<string[]>(() =>
    allClinics.length > 0 ? [allClinics[0].id] : []
  )
  const [inviteMessage, setInviteMessage] = useState<"sent" | "resent" | "cancelled" | null>(null)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [memberAccessOverride, setMemberAccessOverride] = useState<Record<string, ClinicMembership[]>>({})

  const getMemberMemberships = (userId: string): ClinicMembership[] => {
    if (memberAccessOverride[userId] !== undefined) return memberAccessOverride[userId]
    if (getBackendType() === "mock") {
      try {
        return getClinicMembersByUserId(userId).map((m) => ({
          clinicId: m.clinic_id,
          role: m.role as ClinicMembership["role"],
        }))
      } catch {
        return allClinics.map((c) => ({ clinicId: c.id, role: "assistant" as const }))
      }
    }
    return allClinics.map((c) => ({ clinicId: c.id, role: "assistant" as const }))
  }

  const formatMembershipsDisplay = (memberships: ClinicMembership[]): string => {
    return memberships
      .map((m) => {
        const name = allClinics.find((c) => c.id === m.clinicId)?.name ?? m.clinicId
        const roleLabel =
          m.role === "doctor" ? t.common.doctor : m.role === "assistant" ? t.common.assistant : t.common.manager
        return `${name} (${roleLabel})`
      })
      .join(", ")
  }

  const handleSaveMemberAccess = (userId: string, memberships: ClinicMembership[]) => {
    setMemberAccessOverride((prev) => ({ ...prev, [userId]: memberships }))
    setEditingMemberId(null)
  }

  // Keep pending invites in sync with localStorage when subscription changes
  useEffect(() => {
    setPendingInvites(loadPendingInvites(subscriptionId))
  }, [subscriptionId])

  // Default selected clinic when allClinics changes (e.g. single clinic)
  useEffect(() => {
    if (allClinics.length > 0 && inviteClinicIds.length === 0) {
      setInviteClinicIds([allClinics[0].id])
    }
  }, [allClinics])

  const persistPendingInvites = (next: PendingInvite[]) => {
    setPendingInvites(next)
    savePendingInvites(subscriptionId, next)
  }

  const handleSendInvitation = (e: React.FormEvent) => {
    e.preventDefault()
    const email = inviteEmail.trim()
    if (!email) return
    const clinicIds = allClinics.length > 1 ? inviteClinicIds : allClinics.map((c) => c.id)
    if (allClinics.length > 1 && clinicIds.length === 0) return

    const next: PendingInvite = {
      id: `invite-${Date.now()}`,
      email,
      role: inviteRole,
      clinicIds,
      invitedAt: new Date().toISOString(),
    }
    persistPendingInvites([...pendingInvites, next])
    setInviteEmail("")
    setInviteRole("assistant")
    setInviteClinicIds(allClinics.length > 0 ? [allClinics[0].id] : [])
    setInviteMessage("sent")
    setTimeout(() => setInviteMessage(null), 3000)
  }

  const handleResend = (id: string) => {
    const next = pendingInvites.map((inv) =>
      inv.id === id ? { ...inv, invitedAt: new Date().toISOString() } : inv
    )
    persistPendingInvites(next)
    setInviteMessage("resent")
    setTimeout(() => setInviteMessage(null), 3000)
  }

  const handleCancelInvite = (id: string) => {
    persistPendingInvites(pendingInvites.filter((inv) => inv.id !== id))
    setInviteMessage("cancelled")
    setTimeout(() => setInviteMessage(null), 3000)
  }

  const toggleClinic = (clinicId: string) => {
    setInviteClinicIds((prev) =>
      prev.includes(clinicId) ? prev.filter((c) => c !== clinicId) : [...prev, clinicId]
    )
  }

  const formatInvitedDate = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString(undefined, { dateStyle: "short" })
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.teamMembers}</CardTitle>
          <CardDescription>{t.settings.inviteTeamMemberDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Inline expandable invite form */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setInviteFormOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              aria-expanded={inviteFormOpen}
              aria-controls="invite-form-content"
              id="invite-form-toggle"
            >
              <span>{t.settings.inviteTeamMember}</span>
              {inviteFormOpen ? (
                <RiArrowUpSLine className="size-4 shrink-0 rtl:rotate-180" aria-hidden />
              ) : (
                <RiArrowDownSLine className="size-4 shrink-0 rtl:rotate-180" aria-hidden />
              )}
            </button>
            {inviteFormOpen && (
              <div
                id="invite-form-content"
                role="region"
                aria-labelledby="invite-form-toggle"
                className="border-t border-gray-200 px-4 py-4 dark:border-gray-800"
              >
                <form onSubmit={handleSendInvitation} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email" className="text-sm">
                      {t.settings.inviteEmailPlaceholder}
                    </Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder={t.settings.inviteEmailPlaceholder}
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role" className="text-sm">
                      {t.settings.inviteRoleLabel}
                    </Label>
                    <select
                      id="invite-role"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as PendingInviteRole)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                    >
                      <option value="doctor">{t.common.doctor}</option>
                      <option value="assistant">{t.common.assistant}</option>
                      <option value="manager">{t.common.manager}</option>
                    </select>
                  </div>
                  {allClinics.length > 1 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                        {t.settings.inviteClinicsLabel}
                      </span>
                      <div className="flex flex-wrap gap-3 pt-1">
                        {allClinics.map((c) => (
                          <label
                            key={c.id}
                            className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <input
                              type="checkbox"
                              checked={inviteClinicIds.includes(c.id)}
                              onChange={() => toggleClinic(c.id)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            {c.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button type="submit" variant="primary" className="gap-2 text-sm">
                      <RiAddLine className="size-4" />
                      {t.settings.sendInvitation}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {inviteMessage === "sent" && (
            <p className="text-sm text-green-600 dark:text-green-400" role="status">
              {t.settings.invitationSent}
            </p>
          )}
          {inviteMessage === "resent" && (
            <p className="text-sm text-green-600 dark:text-green-400" role="status">
              {t.settings.invitationResent}
            </p>
          )}
          {inviteMessage === "cancelled" && (
            <p className="text-sm text-gray-600 dark:text-gray-400" role="status">
              {t.settings.invitationCancelled}
            </p>
          )}

          {/* Current team members */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              {t.settings.teamMembers}
            </h3>
            {allUsers.map((user) => {
              const memberships = getMemberMemberships(user.id)
              const membershipsDisplay = formatMembershipsDisplay(memberships)
              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                      {user.avatar_initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900 dark:text-gray-50">{user.full_name}</p>
                      <p className="truncate text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      {membershipsDisplay && (
                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                          {membershipsDisplay}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {allClinics.length > 1 && memberships.length > 0 && (
                      <Badge color="gray" size="xs">
                        {memberships.some((m) => m.role === "manager")
                          ? t.common.manager
                          : memberships.some((m) => m.role === "doctor")
                            ? t.common.doctor
                            : t.common.assistant}
                      </Badge>
                    )}
                    {allClinics.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() => setEditingMemberId(user.id)}
                        aria-label={t.common.edit}
                      >
                        <RiEditLine className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {editingMemberId && (() => {
        const user = allUsers.find((u) => u.id === editingMemberId)
        if (!user) return null
        return (
          <TeamMemberAccessDrawer
            open={!!editingMemberId}
            onOpenChange={(open) => !open && setEditingMemberId(null)}
            memberName={user.full_name}
            memberEmail={user.email}
            initialMemberships={getMemberMemberships(user.id)}
            clinics={allClinics}
            onSave={(memberships) => handleSaveMemberAccess(user.id, memberships)}
          />
        )
      })()}

      {/* Pending invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.settings.pendingInvitations}</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInvites.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.settings.noPendingInvitations}</p>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">{inv.email}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge color="gray" size="xs">
                        {inv.role === "doctor" ? t.common.doctor : inv.role === "assistant" ? t.common.assistant : t.common.manager}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {inv.clinicIds
                          .map((id) => allClinics.find((c) => c.id === id)?.name ?? id)
                          .join(", ")}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {t.settings.invitedOn} {formatInvitedDate(inv.invitedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm"
                      onClick={() => handleResend(inv.id)}
                    >
                      {t.settings.resendInvitation}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm"
                      onClick={() => handleCancelInvite(inv.id)}
                    >
                      {t.settings.cancelInvitation}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

const BOOKABLE_TYPE_IDS = ["consultation", "followup", "checkup", "procedure"] as const

function normalizeCustomTypeId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}_-]/gu, "")
}

function formatTypeDisplayLabel(typeId: string, t: ReturnType<typeof useAppTranslations>): string {
  const label = getAppointmentTypeLabel(typeId, t.appointments)
  if (label !== typeId) return label
  return typeId
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatDaysSummary(daysOfWeek: string[], t: ReturnType<typeof useAppTranslations>): string {
  const dayLabels: Record<string, string> = {
    monday: t.settings.dayMonday,
    tuesday: t.settings.dayTuesday,
    wednesday: t.settings.dayWednesday,
    thursday: t.settings.dayThursday,
    friday: t.settings.dayFriday,
    saturday: t.settings.daySaturday,
    sunday: t.settings.daySunday,
  }
  return daysOfWeek.map((d) => dayLabels[d] ?? d).join(", ")
}

// Appointments Tab: appointment types, availability per doctor/clinic, buffer
function AppointmentsTab() {
  const t = useAppTranslations()
  const { currentClinic, allClinics, allUsers } = useUserClinic()
  const [bufferMinutes, setBufferMinutes] = useState(5)
  const [isSavingBuffer, setIsSavingBuffer] = useState(false)
  const [clinicTypes, setClinicTypes] = useState<string[]>([])
  const [availabilityList, setAvailabilityList] = useState<DoctorAvailability[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add")
  const [editingAvailability, setEditingAvailability] = useState<DoctorAvailability | null>(null)
  const [addTypeOpen, setAddTypeOpen] = useState(false)
  const [customTypeInput, setCustomTypeInput] = useState("")

  const doctors = allUsers.filter((u) => u.role === "doctor")

  useEffect(() => {
    settingsApi.getClinicSettings(currentClinic.id).then((settings) => {
      setBufferMinutes(settings.bufferMinutes ?? 5)
    })
  }, [currentClinic.id])

  useEffect(() => {
    getClinicAppointmentTypes(currentClinic.id).then(setClinicTypes)
  }, [currentClinic.id])

  const refetchAvailability = () => {
    const clinicId = currentClinic.id
    Promise.all(doctors.map((d) => availabilityApi.listByDoctor(d.id, clinicId)))
      .then((arrays) => setAvailabilityList(arrays.flat()))
  }

  useEffect(() => {
    refetchAvailability()
  }, [currentClinic.id, doctors.length])

  const handleSaveBuffer = async () => {
    setIsSavingBuffer(true)
    try {
      await settingsApi.updateClinicSettings(currentClinic.id, { bufferMinutes })
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setIsSavingBuffer(false)
    }
  }

  const handleRemoveType = (typeId: string) => {
    setClinicTypes((prev) => {
      const next = prev.filter((id) => id !== typeId)
      setClinicAppointmentTypes(currentClinic.id, next)
      return next
    })
  }

  const handleAddType = (typeId: string) => {
    setClinicTypes((prev) => {
      if (prev.includes(typeId)) return prev
      const next = [...prev, typeId]
      setClinicAppointmentTypes(currentClinic.id, next)
      return next
    })
    setAddTypeOpen(false)
  }

  const handleAddCustomType = () => {
    const id = normalizeCustomTypeId(customTypeInput)
    if (!id) return
    setClinicTypes((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      setClinicAppointmentTypes(currentClinic.id, next)
      return next
    })
    setCustomTypeInput("")
  }

  const openAddAvailability = () => {
    setDrawerMode("add")
    setEditingAvailability(null)
    setDrawerOpen(true)
  }

  const openEditAvailability = (av: DoctorAvailability) => {
    setDrawerMode("edit")
    setEditingAvailability(av)
    setDrawerOpen(true)
  }

  const handleSaveAvailabilityDrawer = (records: AvailabilityRecordPayload[]) => {
    const run = async () => {
      if (drawerMode === "edit" && editingAvailability) {
        await availabilityApi.deleteAvailability(editingAvailability.id)
        setEditingAvailability(null)
      }
      for (const r of records) {
        await availabilityApi.create({
          doctorId: r.doctorId,
          clinicId: r.clinicId,
          daysOfWeek: r.daysOfWeek,
          startTime: r.startTime,
          endTime: r.endTime,
          slotDuration: r.slotDuration,
        })
      }
      refetchAvailability()
      setDrawerOpen(false)
    }
    run()
  }

  const handleDeleteAvailability = (id: string) => {
    if (!window.confirm(t.settings.confirmDeleteAvailability)) return
    availabilityApi.deleteAvailability(id).then(refetchAvailability)
  }

  const availableToAdd = BOOKABLE_TYPE_IDS.filter((id) => !clinicTypes.includes(id))
  const getDoctorName = (id: string) => allUsers.find((u) => u.id === id)?.full_name ?? id
  const getClinicName = (id: string) => allClinics.find((c) => c.id === id)?.name ?? id

  return (
    <div className="space-y-6">
      {/* Card 1: Appointment Types */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <CardTitle>{t.settings.appointmentTypes}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => setAddTypeOpen((o) => !o)}
          >
            <RiAddLine className="size-4" />
            <span className="hidden sm:inline">{t.settings.addAppointmentType}</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {addTypeOpen && (
            <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
              {availableToAdd.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableToAdd.map((id) => (
                    <Button
                      key={id}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddType(id)}
                    >
                      {getAppointmentTypeLabel(id, t.appointments)}
                    </Button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="text"
                  placeholder={t.settings.customTypePlaceholder}
                  value={customTypeInput}
                  onChange={(e) => setCustomTypeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomType())}
                  className="min-w-[12rem] flex-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddCustomType}
                  disabled={!normalizeCustomTypeId(customTypeInput) || clinicTypes.includes(normalizeCustomTypeId(customTypeInput))}
                >
                  {t.settings.addCustomType}
                </Button>
              </div>
            </div>
          )}
          {clinicTypes.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.settings.noAppointmentTypes}</p>
          ) : (
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-200 dark:border-gray-800 dark:divide-gray-800">
              {clinicTypes.map((typeId) => (
                <div
                  key={typeId}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    {formatTypeDisplayLabel(typeId, t)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-destructive"
                    onClick={() => handleRemoveType(typeId)}
                    title={t.settings.removeAppointmentType}
                    aria-label={t.settings.removeAppointmentType}
                  >
                    <RiDeleteBinLine className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 2: Availability */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <CardTitle>{t.settings.availability}</CardTitle>
          <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={openAddAvailability}>
            <RiAddLine className="size-4" />
            <span className="hidden sm:inline">{t.settings.addAvailability}</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {availabilityList.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.settings.noAvailability}</p>
          ) : (
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-200 dark:border-gray-800 dark:divide-gray-800">
              {availabilityList.map((av) => (
                <div
                  key={av.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-50">{getDoctorName(av.doctorId)}</span>
                    {allClinics.length > 1 && (
                      <span className="ms-2 text-gray-600 dark:text-gray-400">{getClinicName(av.clinicId)}</span>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatDaysSummary(av.daysOfWeek ?? [], t)} · {av.startTime}–{av.endTime}
                      {av.slotDuration ? ` · ${av.slotDuration} ${t.settings.minutes}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditAvailability(av)}
                      title={t.common.edit}
                      aria-label={t.common.edit}
                    >
                      <RiEditLine className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-destructive"
                      onClick={() => handleDeleteAvailability(av.id)}
                      title={t.settings.deleteAvailability}
                      aria-label={t.settings.deleteAvailability}
                    >
                      <RiDeleteBinLine className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AvailabilityDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        initialValues={editingAvailability}
        defaultClinicId={currentClinic.id}
        doctors={doctors}
        clinics={allClinics}
        onSave={handleSaveAvailabilityDrawer}
      />

      {/* Card 3: Buffer */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.appointmentSettings}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="buffer-minutes">{t.settings.bufferTime}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="buffer-minutes"
                type="number"
                min={0}
                max={60}
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t.settings.minutes}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.bufferTimeHint}</p>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSaveBuffer} disabled={isSavingBuffer} className="w-full sm:w-auto">
              {isSavingBuffer ? t.settings.saving : t.settings.saveChanges}
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
