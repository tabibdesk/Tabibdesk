/**
 * useFeatures Hook
 * Central hook for accessing feature flags throughout the application
 * Combines plan tier limits with clinic-specific overrides
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useUserClinic } from "@/contexts/user-clinic-context"
import * as settingsApi from "@/api/settings.api"
import { getPlanAllowedFeatures } from "./planCatalog"
import { resolveEffectiveFeatures } from "./featureResolver"
import type { FeatureKey, PlanTier } from "./settings.types"

export interface UseFeaturesResult {
  // Effective feature flags (what user can actually access)
  effective: Record<FeatureKey, boolean>
  // Check if a feature is locked by plan tier
  isLocked: (key: FeatureKey) => boolean
  // Current plan tier
  planTier: PlanTier | null
  // Loading state
  loading: boolean
  // Error state
  error: Error | null
  // Refetch data (call after updates)
  refetch: () => void
}

/**
 * Hook to access feature flags for the current clinic
 * Automatically updates when clinic changes
 */
export function useFeatures(): UseFeaturesResult {
  const { currentClinic } = useUserClinic()
  const clinicId = currentClinic?.id

  const [planTier, setPlanTier] = useState<PlanTier | null>(null)
  const [clinicOverrides, setClinicOverrides] = useState<Partial<Record<FeatureKey, boolean>>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  // Load data when clinic changes or refetch is triggered
  useEffect(() => {
    let isMounted = true

    async function loadFeatures() {
      if (!clinicId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Load plan info and clinic overrides in parallel
        const [planInfo, overrides] = await Promise.all([
          settingsApi.getPlanInfo(),
          settingsApi.getClinicFeatureFlags(clinicId),
        ])

        if (!isMounted) return

        setPlanTier(planInfo.planTier)
        setClinicOverrides(overrides)
      } catch (err) {
        if (!isMounted) return

        console.error("Failed to load features:", err)
        setError(err instanceof Error ? err : new Error("Failed to load features"))
        
        // Fail-open: allow all features if loading fails (for demo purposes)
        setPlanTier("more")
        setClinicOverrides({})
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadFeatures()

    return () => {
      isMounted = false
    }
  }, [clinicId, refetchTrigger])

  // Compute effective features (memoized)
  const effective = useMemo(() => {
    if (!planTier) {
      // While loading, fail-open by allowing all features to show in sidebar
      // This prevents empty sidebar during initial load
      return {
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
        ai_summary: true,
        ai_dictation: true,
        ai_lab_extraction: true,
      } as Record<FeatureKey, boolean>
    }

    const planAllowed = getPlanAllowedFeatures(planTier)
    return resolveEffectiveFeatures(planAllowed, clinicOverrides)
  }, [planTier, clinicOverrides])

  // Check if feature is locked by plan
  const isLocked = useCallback(
    (key: FeatureKey): boolean => {
      if (!planTier) return false
      const planAllowed = getPlanAllowedFeatures(planTier)
      return !planAllowed[key]
    },
    [planTier]
  )

  // Refetch function
  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1)
  }, [])

  return {
    effective,
    isLocked,
    planTier,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook to check if a specific feature is enabled
 * Convenience wrapper around useFeatures
 */
export function useFeatureEnabled(featureKey: FeatureKey): boolean {
  const { effective, loading } = useFeatures()
  
  // While loading, assume enabled (fail-open)
  if (loading) return true
  
  return effective[featureKey] ?? false
}

/**
 * Hook to check if a feature is locked by the plan
 */
export function useFeatureLocked(featureKey: FeatureKey): boolean {
  const { isLocked } = useFeatures()
  return isLocked(featureKey)
}
