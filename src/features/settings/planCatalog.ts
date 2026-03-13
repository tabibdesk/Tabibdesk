/**
 * Plan Catalog - Feature ceiling per plan tier
 * Defines what features each plan ALLOWS (maximum access)
 * Clinics can only DISABLE features allowed by their plan, not enable locked ones
 */

import type { PlanTier, FeatureKey } from "./settings.types"

// Plan feature matrix - true means allowed, false means locked by plan
export const PLAN_FEATURES: Record<PlanTier, Record<FeatureKey, boolean>> = {
  // Solo: Basic patient management for individual practitioners
  solo: {
    patients: true,
    appointments: true,
    tasks: false, // Locked - requires Multi
    insights: false, // Locked - requires Multi
    alerts: true,
    accounting: true,
    campaign: true,
    labs: false, // Locked - requires Multi
    medications: true,
    files: true,
    reminders: false, // Locked - requires Multi
    ai_summary: false, // Locked - requires More
    ai_dictation: false, // Locked - requires More
    ai_lab_extraction: false, // Locked - requires More
  },

  // Multi: Team collaboration + advanced features
  multi: {
    patients: true,
    appointments: true,
    tasks: true, // ✅ Unlocked
    insights: true, // ✅ Unlocked
    alerts: true,
    accounting: true,
    campaign: true,
    labs: true, // ✅ Unlocked
    medications: true,
    files: true,
    reminders: true, // ✅ Unlocked
    ai_summary: false, // Locked - requires More
    ai_dictation: false, // Locked - requires More
    ai_lab_extraction: false, // Locked - requires More
  },

  // More: Everything including AI features
  more: {
    patients: true,
    appointments: true,
    tasks: true,
    insights: true,
    alerts: true,
    accounting: true,
    campaign: true,
    labs: true,
    medications: true,
    files: true,
    reminders: true,
    ai_summary: true, // ✅ Unlocked
    ai_dictation: true, // ✅ Unlocked
    ai_lab_extraction: true, // ✅ Unlocked
  },
}

/**
 * Get allowed features for a plan tier
 */
export function getPlanAllowedFeatures(planTier: PlanTier): Record<FeatureKey, boolean> {
  return PLAN_FEATURES[planTier]
}

/**
 * Check if a feature is locked by the plan
 */
export function isFeatureLockedByPlan(planTier: PlanTier, featureKey: FeatureKey): boolean {
  return !PLAN_FEATURES[planTier][featureKey]
}

/**
 * Get plan tier display name
 */
export function getPlanTierName(planTier: PlanTier): string {
  const names: Record<PlanTier, string> = {
    solo: "Solo",
    multi: "Multi",
    more: "More",
  }
  return names[planTier]
}

/**
 * Get plan tier pricing (for display)
 */
export function getPlanTierPrice(planTier: PlanTier): string {
  const prices: Record<PlanTier, string> = {
    solo: "$49",
    multi: "$99",
    more: "$199",
  }
  return prices[planTier]
}
