/**
 * Settings API - replaceable backend layer
 * Currently uses localStorage for mock data, structured for easy backend replacement
 * 
 * CRITICAL: All mock data lives ONLY in this file. Components never access localStorage directly.
 */

import type {
  PlanTier,
  PlanInfo,
  ClinicSettings,
  FeatureKey,
  AppointmentSettings,
  ClinicFollowUpRules,
  ClinicReactivationRules,
  PatientCommunicationRules,
  QueueWaitlistRules,
  FinancialAdminRules,
} from "@/features/settings/settings.types"
import { mockClinics, getSubscriptionForClinic } from "@/data/mock/users-clinics"

// LocalStorage keys
const STORAGE_KEYS = {
  PLAN_INFO: "tabibdesk-plan-info",
  CLINIC_SETTINGS: "tabibdesk-clinic-settings",
  FEATURE_FLAGS: "tabibdesk-feature-flags",
} as const

// In-memory cache (for performance within session)
let planInfoCache: PlanInfo | null = null
let clinicSettingsCache: Record<string, ClinicSettings> = {}
let featureFlagsCache: Record<string, Partial<Record<FeatureKey, boolean>>> = {}

/**
 * Initialize default data if not present
 */
function initializeStore() {
  // Initialize plan info
  if (!localStorage.getItem(STORAGE_KEYS.PLAN_INFO)) {
    const defaultPlanInfo: PlanInfo = { planTier: "multi" } // Default to Multi plan for demo
    localStorage.setItem(STORAGE_KEYS.PLAN_INFO, JSON.stringify(defaultPlanInfo))
    planInfoCache = defaultPlanInfo
  }

  // Initialize clinic settings
  if (!localStorage.getItem(STORAGE_KEYS.CLINIC_SETTINGS)) {
    const defaultClinicSettings: Record<string, ClinicSettings> = {}
    
    // Initialize from mock clinics
    mockClinics.forEach((clinic) => {
      defaultClinicSettings[clinic.id] = {
        clinicId: clinic.id,
        name: clinic.name,
        address: clinic.address,
        timezone: "Africa/Cairo",
        defaultAppointmentDuration: 30,
      }
    })

    localStorage.setItem(STORAGE_KEYS.CLINIC_SETTINGS, JSON.stringify(defaultClinicSettings))
    clinicSettingsCache = defaultClinicSettings
  }

  // Initialize feature flags (empty - defaults to plan settings)
  if (!localStorage.getItem(STORAGE_KEYS.FEATURE_FLAGS)) {
    const defaultFeatureFlags: Record<string, Partial<Record<FeatureKey, boolean>>> = {}
    localStorage.setItem(STORAGE_KEYS.FEATURE_FLAGS, JSON.stringify(defaultFeatureFlags))
    featureFlagsCache = defaultFeatureFlags
  }
}

const CURRENT_CLINIC_KEY = "currentClinicId"

/**
 * Get current plan info from the current clinic's subscription.
 * Uses Supabase subscription when backend is supabase; mock when demo/mock.
 * Fallback: localStorage tabibdesk-plan-info for migration/demo.
 */
export async function getPlanInfo(): Promise<PlanInfo> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (typeof window !== "undefined") {
    const currentClinicId = localStorage.getItem(CURRENT_CLINIC_KEY)
    if (currentClinicId) {
      const { getBackendType } = await import("@/lib/api/repository-factory")
      if (getBackendType() === "supabase") {
        try {
          const { getSubscriptionForClinic } = await import(
            "@/lib/api/subscriptions.api"
          )
          const subscription = await getSubscriptionForClinic(currentClinicId)
          if (subscription) {
            return { planTier: subscription.plan_tier as PlanInfo["planTier"] }
          }
        } catch {
          // fall through to fallback
        }
      } else {
        const subscription = getSubscriptionForClinic(currentClinicId)
        if (subscription) {
          return { planTier: subscription.plan_tier }
        }
      }
    }
  }

  if (planInfoCache) {
    return planInfoCache
  }

  initializeStore()
  const stored = localStorage.getItem(STORAGE_KEYS.PLAN_INFO)
  if (stored) {
    planInfoCache = JSON.parse(stored)
    return planInfoCache!
  }

  const fallback: PlanInfo = { planTier: "multi" }
  planInfoCache = fallback
  return fallback
}

/**
 * Update plan tier (for demo/testing purposes)
 */
export async function updatePlanTier(planTier: PlanTier): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const planInfo: PlanInfo = { planTier }
  localStorage.setItem(STORAGE_KEYS.PLAN_INFO, JSON.stringify(planInfo))
  planInfoCache = planInfo
}

/**
 * Get clinic settings by ID
 */
export async function getClinicSettings(clinicId: string): Promise<ClinicSettings> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (clinicSettingsCache[clinicId]) {
    return clinicSettingsCache[clinicId]
  }

  initializeStore()
  const stored = localStorage.getItem(STORAGE_KEYS.CLINIC_SETTINGS)
  if (stored) {
    const allSettings = JSON.parse(stored) as Record<string, ClinicSettings>
    clinicSettingsCache = allSettings
    if (allSettings[clinicId]) {
      return allSettings[clinicId]
    }
  }

  // Fallback - create from mock clinic if exists
  const mockClinic = mockClinics.find((c) => c.id === clinicId)
  if (mockClinic) {
    const fallback: ClinicSettings = {
      clinicId: mockClinic.id,
      name: mockClinic.name,
      address: mockClinic.address,
      timezone: "Africa/Cairo",
      defaultAppointmentDuration: 30,
    }
    return fallback
  }

  throw new Error(`Clinic not found: ${clinicId}`)
}

/**
 * Update clinic settings
 */
export async function updateClinicSettings(
  clinicId: string,
  patch: Partial<ClinicSettings>
): Promise<ClinicSettings> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  initializeStore()
  const stored = localStorage.getItem(STORAGE_KEYS.CLINIC_SETTINGS)
  const allSettings = stored ? JSON.parse(stored) : {}

  const current = allSettings[clinicId] || { clinicId }
  const updated = { ...current, ...patch, clinicId } // Ensure clinicId doesn't change

  allSettings[clinicId] = updated
  localStorage.setItem(STORAGE_KEYS.CLINIC_SETTINGS, JSON.stringify(allSettings))

  // Update cache
  clinicSettingsCache[clinicId] = updated

  return updated
}

/**
 * Get clinic-specific feature flag overrides
 * Returns only the overrides - empty object means use plan defaults
 */
export async function getClinicFeatureFlags(
  clinicId: string
): Promise<Partial<Record<FeatureKey, boolean>>> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (featureFlagsCache[clinicId]) {
    return featureFlagsCache[clinicId]
  }

  initializeStore()
  const stored = localStorage.getItem(STORAGE_KEYS.FEATURE_FLAGS)
  if (stored) {
    const allFlags = JSON.parse(stored) as Record<string, Partial<Record<FeatureKey, boolean>>>
    featureFlagsCache = allFlags
    return allFlags[clinicId] || {}
  }

  return {}
}

/**
 * Update a single feature flag for a clinic
 */
export async function updateClinicFeatureFlag(
  clinicId: string,
  key: FeatureKey,
  enabled: boolean
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  initializeStore()
  const stored = localStorage.getItem(STORAGE_KEYS.FEATURE_FLAGS)
  const allFlags = stored ? JSON.parse(stored) : {}

  if (!allFlags[clinicId]) {
    allFlags[clinicId] = {}
  }

  allFlags[clinicId][key] = enabled

  localStorage.setItem(STORAGE_KEYS.FEATURE_FLAGS, JSON.stringify(allFlags))

  // Update cache
  if (!featureFlagsCache[clinicId]) {
    featureFlagsCache[clinicId] = {}
  }
  featureFlagsCache[clinicId][key] = enabled
}

/**
 * Bulk update feature flags for a clinic
 */
export async function updateClinicFeatureFlags(
  clinicId: string,
  flags: Partial<Record<FeatureKey, boolean>>
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  initializeStore()
  const stored = localStorage.getItem(STORAGE_KEYS.FEATURE_FLAGS)
  const allFlags = stored ? JSON.parse(stored) : {}

  allFlags[clinicId] = { ...allFlags[clinicId], ...flags }

  localStorage.setItem(STORAGE_KEYS.FEATURE_FLAGS, JSON.stringify(allFlags))

  // Update cache
  featureFlagsCache[clinicId] = allFlags[clinicId]
}

/**
 * Clear all feature flag overrides for a clinic (reset to plan defaults)
 */
export async function clearClinicFeatureFlags(clinicId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  initializeStore()
  const stored = localStorage.getItem(STORAGE_KEYS.FEATURE_FLAGS)
  const allFlags = stored ? JSON.parse(stored) : {}

  delete allFlags[clinicId]

  localStorage.setItem(STORAGE_KEYS.FEATURE_FLAGS, JSON.stringify(allFlags))

  // Update cache
  delete featureFlagsCache[clinicId]
}

/**
 * Get appointment settings for a clinic
 * Returns settings from ClinicSettings.appointmentSettings or defaults
 */
export async function getAppointmentSettings(clinicId: string): Promise<AppointmentSettings> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const clinicSettings = await getClinicSettings(clinicId)
  
  if (clinicSettings.appointmentSettings) {
    return clinicSettings.appointmentSettings
  }

  // Return defaults
  return {
    bufferMinutes: 5,
    slotDurationMinutes: 30,
    bookingRangeDays: 14,
  }
}

/**
 * Get default follow-up rules
 */
function getDefaultFollowUpRules(): ClinicFollowUpRules {
  return {
    followUpOnCancelled: true,
    followUpOnNoShow: true,
    cancelFollowUpDelayHours: 24,
    noShowFollowUpDelayHours: 2,
    autoAssignRole: "assistant",
    snoozePresetsDays: [0, 1, 3],
  }
}

/**
 * Get follow-up rules for a clinic
 * Returns defaults if not set
 */
export async function getFollowUpRules(clinicId: string): Promise<ClinicFollowUpRules> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const clinicSettings = await getClinicSettings(clinicId)
  
  if (clinicSettings.followUpRules) {
    return clinicSettings.followUpRules
  }

  // Return defaults
  return getDefaultFollowUpRules()
}

/**
 * Update follow-up rules for a clinic
 */
export async function updateFollowUpRules(
  clinicId: string,
  patch: Partial<ClinicFollowUpRules>
): Promise<ClinicFollowUpRules> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const currentRules = await getFollowUpRules(clinicId)
  const updatedRules: ClinicFollowUpRules = {
    ...currentRules,
    ...patch,
  }

  // Update clinic settings with new rules
  await updateClinicSettings(clinicId, {
    followUpRules: updatedRules,
  })

  return updatedRules
}

/**
 * Get default reactivation rules
 */
function getDefaultReactivationRules(): ClinicReactivationRules {
  return {
    inactivityDaysThreshold: 180,
    maxAttempts: 3,
    daysBetweenAttempts: 2,
    markColdAfterMaxAttempts: true,
    quietHours: { start: "22:00", end: "10:00" },
    reactivationSequenceEnabled: false,
    reactivationWorkingHours: { start: "12:00", end: "21:00" },
    sequenceMessages: {},
  }
}

function getDefaultPatientCommunicationRules(): PatientCommunicationRules {
  return {
    appointmentConfirmations: { enabled: false, template: "" },
    smartReminders: {
      enabled: false,
      hoursBefore: 24,
      template: "",
      includePrepNotes: false,
      prepNotesContent: "",
    },
    rescheduleNotification: { enabled: false, template: "" },
    followUpTriggers: { enabled: false, hoursAfterProcedure: 24, template: "" },
    noShowRecovery: { enabled: false, minutesAfter: 30, template: "" },
  }
}

function getDefaultQueueWaitlistRules(): QueueWaitlistRules {
  return {
    virtualQueueUpdates: { enabled: false, notifyNextN: 3, template: "" },
    delayNotifications: { enabled: false, minutesLateThreshold: 30, template: "" },
    autoFillWaitlist: { enabled: false, template: "" },
  }
}

function getDefaultFinancialAdminRules(): FinancialAdminRules {
  return {
    autoInvoicing: { enabled: false, template: "" },
    insuranceApprovals: { enabled: false, pendingHoursThreshold: 48 },
    dailySummary: { enabled: false, recipientWhatsappNumbers: [] },
  }
}

/**
 * Get reactivation rules for a clinic
 * Migrates from old followUpRules if reactivation rules are empty (backward compatibility)
 */
export async function getReactivationRules(clinicId: string): Promise<ClinicReactivationRules> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const clinicSettings = await getClinicSettings(clinicId)
  const defaults = getDefaultReactivationRules()

  if (clinicSettings.reactivationRules) {
    return { ...defaults, ...clinicSettings.reactivationRules }
  }

  // Migration: copy from followUpRules if it has the old fields
  const followUp = clinicSettings.followUpRules as ClinicFollowUpRules & {
    maxAttempts?: number
    daysBetweenAttempts?: number
    markColdAfterMaxAttempts?: boolean
    inactivityDaysThreshold?: number
    quietHours?: { start: string; end: string }
  }

  if (
    followUp &&
    (followUp.maxAttempts != null ||
      followUp.daysBetweenAttempts != null ||
      followUp.markColdAfterMaxAttempts != null ||
      followUp.inactivityDaysThreshold != null ||
      followUp.quietHours)
  ) {
    const migrated: ClinicReactivationRules = {
      ...defaults,
      inactivityDaysThreshold: followUp.inactivityDaysThreshold ?? defaults.inactivityDaysThreshold,
      maxAttempts: followUp.maxAttempts ?? defaults.maxAttempts,
      daysBetweenAttempts: followUp.daysBetweenAttempts ?? defaults.daysBetweenAttempts,
      markColdAfterMaxAttempts: followUp.markColdAfterMaxAttempts ?? defaults.markColdAfterMaxAttempts,
      quietHours: followUp.quietHours ?? defaults.quietHours,
    }
    // Persist migrated rules
    await updateClinicSettings(clinicId, { reactivationRules: migrated })
    return migrated
  }

  return defaults
}

/**
 * Update reactivation rules for a clinic
 */
export async function updateReactivationRules(
  clinicId: string,
  patch: Partial<ClinicReactivationRules>
): Promise<ClinicReactivationRules> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const currentRules = await getReactivationRules(clinicId)
  const updatedRules: ClinicReactivationRules = {
    ...currentRules,
    ...patch,
  }

  await updateClinicSettings(clinicId, {
    reactivationRules: updatedRules,
  })

  return updatedRules
}

/**
 * Get patient communication rules
 */
export async function getPatientCommunicationRules(clinicId: string): Promise<PatientCommunicationRules> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const clinicSettings = await getClinicSettings(clinicId)
  const defaults = getDefaultPatientCommunicationRules()
  return clinicSettings.patientCommunicationRules ? { ...defaults, ...clinicSettings.patientCommunicationRules } : defaults
}

/**
 * Update patient communication rules
 */
export async function updatePatientCommunicationRules(
  clinicId: string,
  patch: Partial<PatientCommunicationRules>
): Promise<PatientCommunicationRules> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const current = await getPatientCommunicationRules(clinicId)
  const updated = { ...current, ...patch }
  await updateClinicSettings(clinicId, { patientCommunicationRules: updated })
  return updated
}

/**
 * Get queue & waitlist rules
 */
export async function getQueueWaitlistRules(clinicId: string): Promise<QueueWaitlistRules> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const clinicSettings = await getClinicSettings(clinicId)
  const defaults = getDefaultQueueWaitlistRules()
  return clinicSettings.queueWaitlistRules ? { ...defaults, ...clinicSettings.queueWaitlistRules } : defaults
}

/**
 * Update queue & waitlist rules
 */
export async function updateQueueWaitlistRules(
  clinicId: string,
  patch: Partial<QueueWaitlistRules>
): Promise<QueueWaitlistRules> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const current = await getQueueWaitlistRules(clinicId)
  const updated = { ...current, ...patch }
  await updateClinicSettings(clinicId, { queueWaitlistRules: updated })
  return updated
}

/**
 * Get financial & admin rules
 */
export async function getFinancialAdminRules(clinicId: string): Promise<FinancialAdminRules> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const clinicSettings = await getClinicSettings(clinicId)
  const defaults = getDefaultFinancialAdminRules()
  return clinicSettings.financialAdminRules ? { ...defaults, ...clinicSettings.financialAdminRules } : defaults
}

/**
 * Update financial & admin rules
 */
export async function updateFinancialAdminRules(
  clinicId: string,
  patch: Partial<FinancialAdminRules>
): Promise<FinancialAdminRules> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const current = await getFinancialAdminRules(clinicId)
  const updated = { ...current, ...patch }
  await updateClinicSettings(clinicId, { financialAdminRules: updated })
  return updated
}

/**
 * Reset all settings to defaults (for testing)
 */
export async function resetAllSettings(): Promise<void> {
  localStorage.removeItem(STORAGE_KEYS.PLAN_INFO)
  localStorage.removeItem(STORAGE_KEYS.CLINIC_SETTINGS)
  localStorage.removeItem(STORAGE_KEYS.FEATURE_FLAGS)

  planInfoCache = null
  clinicSettingsCache = {}
  featureFlagsCache = {}

  initializeStore()
}
