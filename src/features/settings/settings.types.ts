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

// Follow-up rules for clinic (post-cancellation/no-show task creation only)
export interface ClinicFollowUpRules {
  followUpOnCancelled: boolean // default true
  followUpOnNoShow: boolean // default true
  cancelFollowUpDelayHours: number // default 24
  noShowFollowUpDelayHours: number // default 2 (same-day follow-up)
  autoAssignRole: "assistant" | "staff" // default "assistant"
  snoozePresetsDays?: number[] // default [0, 1, 3] (today, tomorrow, 3 days)
}

// Message content for Day 1, 7, 14, 30 in the reactivation sequence (text or links)
export interface ReactivationSequenceMessages {
  day1?: string
  day7?: string
  day14?: string
  day30?: string
}

// Automated Patient Communication (confirmations, reminders, follow-ups, no-show recovery)
export interface PatientCommunicationRules {
  appointmentConfirmations: { enabled: boolean; template?: string }
  smartReminders: {
    enabled: boolean
    hoursBefore: number
    template?: string
    includePrepNotes: boolean
    prepNotesContent?: string
  }
  rescheduleNotification: { enabled: boolean; template?: string }
  followUpTriggers: { enabled: boolean; hoursAfterProcedure: number; template?: string }
  noShowRecovery: { enabled: boolean; minutesAfter: number; template?: string }
}

// Queue & Waitlist Management
export interface QueueWaitlistRules {
  virtualQueueUpdates: { enabled: boolean; notifyNextN: number; template?: string }
  delayNotifications: { enabled: boolean; minutesLateThreshold: number; template?: string }
  autoFillWaitlist: { enabled: boolean; template?: string }
}

// Financial & Admin Automation
export interface FinancialAdminRules {
  autoInvoicing: { enabled: boolean; template?: string }
  insuranceApprovals: { enabled: boolean; pendingHoursThreshold: number }
  dailySummary: { enabled: boolean; recipientWhatsappNumbers?: string[] }
}

// Lead nurturing templates (every N days for leads who haven't booked)
export interface LeadNurturingTemplates {
  day1?: string
  day4?: string
  day7?: string
}

// Re-activation rules (inactivity, cold status, attempts, quiet hours, automation)
export interface ClinicReactivationRules {
  inactivityDaysThreshold: number // default 180
  maxAttempts: number // default 3
  daysBetweenAttempts: number // default 2
  markColdAfterMaxAttempts: boolean // default true
  quietHours: { start: string; end: string } // default { "22:00", "10:00" } - hours when NOT to send; or working hours 12:00-21:00
  reactivationSequenceEnabled: boolean // default false
  reactivationWorkingHours: { start: string; end: string } // default { "12:00", "21:00" } - Egypt time, only send during this window
  sequenceMessages?: ReactivationSequenceMessages // content for Day 1, 7, 14, 30 messages (text or links)
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
  reactivationRules?: ClinicReactivationRules
  patientCommunicationRules?: PatientCommunicationRules
  queueWaitlistRules?: QueueWaitlistRules
  financialAdminRules?: FinancialAdminRules
  /** Metric ids enabled for this clinic (note reminder + available for progress charts). All enabled metrics with data show in patient Progress section. */
  enabledProgressMetricIds?: string[]
  /** Checklist item keys for the Visit Progress widget (like appointment types). Can add/remove. Empty = use defaults. */
  visitProgressChecklistIds?: string[]
  /** Medical condition ids enabled for patient profiles (checkboxes on Notes tab, display on Profile tab). Empty = use all defaults. */
  medicalConditionIds?: string[]
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
