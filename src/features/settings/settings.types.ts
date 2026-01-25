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

// Clinic settings
export interface ClinicSettings {
  clinicId: string
  name: string
  address?: string
  timezone?: string
  defaultAppointmentDuration?: number // in minutes
  bufferMinutes?: number // buffer time between appointments (default 5)
  appointmentSettings?: AppointmentSettings
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
