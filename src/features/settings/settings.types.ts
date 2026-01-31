/**
 * Settings & Feature Flags Type Definitions
 * Central type system for feature flags, plans, and clinic settings
 */

// Role type (shared across app)
export type Role = "doctor" | "assistant" | "manager"

// Plan tiers
export type PlanTier = "solo" | "multi" | "more"

// Feature keys - all possible features in the system
export type FeatureKey =
  // Core modules (main navigation items)
  | "patients"
  | "appointments"
  | "tasks"
  | "insights"
  | "alerts"
  | "accounting"
  // Optional modules
  | "labs"
  | "medications"
  | "files"
  | "reminders"
  // AI features (add-ons)
  | "ai_summary"
  | "ai_dictation"
  | "ai_lab_extraction"

// Feature flag with metadata
export interface FeatureFlag {
  key: FeatureKey
  enabled: boolean
  locked?: boolean // true if locked by plan tier
}

// Appointment settings
export interface AppointmentSettings {
  bufferMinutes: number // default 5
  slotDurationMinutes: number // default 30
  bookingRangeDays: number // default 14
}

// Follow-up rules for clinic
export interface ClinicFollowUpRules {
  followUpOnCancelled: boolean // default true
  followUpOnNoShow: boolean // default true
  cancelFollowUpDelayHours: number // default 24
  noShowFollowUpDelayHours: number // default 2 (same-day follow-up)
  maxAttempts: number // default 3
  daysBetweenAttempts: number // default 2
  markColdAfterMaxAttempts: boolean // default true
  inactivityDaysThreshold: number // default 14
  quietHours?: { start: string; end: string } // default { "22:00", "10:00" }
  autoAssignRole: "assistant" | "staff" // default "assistant"
  snoozePresetsDays?: number[] // default [0, 1, 3] (today, tomorrow, 3 days)
}

// Clinic settings
export interface ClinicSettings {
  clinicId: string
  name: string
  address?: string
  timezone?: string
  defaultAppointmentDuration?: number // in minutes
  bufferMinutes?: number // buffer time between appointments (default 5)
  appointmentSettings?: AppointmentSettings
  followUpRules?: ClinicFollowUpRules
  /** Metric ids enabled for this clinic (note reminder + available for progress charts). All enabled metrics with data show in patient Progress section. */
  enabledProgressMetricIds?: string[]
}

// Effective features result (what user actually has access to)
export interface EffectiveFeatures {
  planTier: PlanTier
  allowed: Record<FeatureKey, boolean>
  clinicOverrides: Partial<Record<FeatureKey, boolean>>
}

// Feature metadata for UI display
export interface FeatureMetadata {
  key: FeatureKey
  name: string
  description: string
  group: "core" | "optional" | "ai"
}

// Plan info response
export interface PlanInfo {
  planTier: PlanTier
}
