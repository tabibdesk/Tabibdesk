/**
 * Feature Metadata
 * Display information for features in the UI
 */

import type { FeatureKey, FeatureMetadata } from "./settings.types"

/**
 * Feature metadata for UI display
 * Used in Settings page and other feature management UIs
 */
export const FEATURE_METADATA: Record<FeatureKey, FeatureMetadata> = {
  // Core modules
  patients: {
    key: "patients",
    name: "Patients",
    description: "Patient records and profile management",
    group: "core",
  },
  appointments: {
    key: "appointments",
    name: "Appointments",
    description: "Scheduling and calendar management",
    group: "core",
  },
  tasks: {
    key: "tasks",
    name: "Tasks",
    description: "Task management and team assignments",
    group: "core",
  },
  insights: {
    key: "insights",
    name: "Insights",
    description: "Analytics, reports, and business intelligence",
    group: "core",
  },
  alerts: {
    key: "alerts",
    name: "Alerts",
    description: "Important notifications and urgent patient alerts",
    group: "core",
  },
  accounting: {
    key: "accounting",
    name: "Accounting",
    description: "Payment collection, expenses, and financial tracking",
    group: "core",
  },

  // Optional modules
  campaign: {
    key: "campaign",
    name: "Leads",
    description: "Lead management, campaign tracking, and ROI analytics",
    group: "optional",
  },
  labs: {
    key: "labs",
    name: "Labs",
    description: "Lab results and test management",
    group: "optional",
  },
  medications: {
    key: "medications",
    name: "Medications",
    description: "Prescription and medication tracking",
    group: "optional",
  },
  files: {
    key: "files",
    name: "Files",
    description: "Document storage and patient attachments",
    group: "optional",
  },
  reminders: {
    key: "reminders",
    name: "Reminders",
    description: "Automated appointment and follow-up reminders",
    group: "optional",
  },

  // AI features
  ai_summary: {
    key: "ai_summary",
    name: "AI Clinical Notes Summary",
    description: "Automatic visit note generation and summaries",
    group: "ai",
  },
  ai_dictation: {
    key: "ai_dictation",
    name: "AI Voice Dictation",
    description: "Voice-to-text transcription for clinical notes",
    group: "ai",
  },
  ai_lab_extraction: {
    key: "ai_lab_extraction",
    name: "AI Lab Report Extraction",
    description: "Automated parsing and extraction of lab reports",
    group: "ai",
  },
}

/**
 * Get feature metadata by key
 */
export function getFeatureMetadata(key: FeatureKey): FeatureMetadata {
  return FEATURE_METADATA[key]
}

/**
 * Get all features in a group
 */
export function getFeaturesByGroup(
  group: "core" | "optional" | "ai"
): FeatureMetadata[] {
  return Object.values(FEATURE_METADATA).filter((f) => f.group === group)
}

/**
 * Get feature display name
 */
export function getFeatureName(key: FeatureKey): string {
  return FEATURE_METADATA[key].name
}

/**
 * Get feature description
 */
export function getFeatureDescription(key: FeatureKey): string {
  return FEATURE_METADATA[key].description
}
