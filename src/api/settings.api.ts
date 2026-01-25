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
} from "@/features/settings/settings.types"
import { mockClinics } from "@/data/mock/users-clinics"

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

/**
 * Get current plan info
 */
export async function getPlanInfo(): Promise<PlanInfo> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (planInfoCache) {
    return planInfoCache
  }

  initializeStore()
  const stored = localStorage.getItem(STORAGE_KEYS.PLAN_INFO)
  if (stored) {
    planInfoCache = JSON.parse(stored)
    return planInfoCache!
  }

  // Fallback
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
