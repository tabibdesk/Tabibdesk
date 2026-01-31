/**
 * FeatureGate Component
 * Route/feature protection based on feature flags
 * Shows appropriate empty state when feature is disabled or locked
 */

"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/Card"
import { Button } from "@/components/Button"
import { useFeatures } from "@/features/settings/useFeatures"
import { PageSkeleton } from "@/components/skeletons"
import type { FeatureKey } from "@/features/settings/settings.types"
import { RiLockLine, RiSettings3Line } from "@remixicon/react"

export interface FeatureGateProps {
  feature: FeatureKey
  children: React.ReactNode
  fallback?: React.ReactNode
  redirect?: boolean
}

/**
 * Guard component that protects features based on feature flags
 * 
 * Usage:
 * <FeatureGate feature="tasks">
 *   <TasksPageContent />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  redirect = false,
}: FeatureGateProps) {
  const { effective, isLocked, loading } = useFeatures()
  const router = useRouter()

  const isEnabled = effective[feature]
  const isFeatureLocked = isLocked(feature)

  // Handle redirect if requested
  useEffect(() => {
    if (redirect && !loading && !isEnabled) {
      router.push("/dashboard")
      // Note: Toast would be shown here in a real implementation
      // For now, relying on the empty state
    }
  }, [redirect, loading, isEnabled, router])

  if (loading) {
    return (
      <div className="min-h-[400px] py-8">
        <PageSkeleton showHeader={false} contentBlocks={2} />
      </div>
    )
  }

  // Feature is enabled - render children
  if (isEnabled) {
    return <>{children}</>
  }

  // Feature is disabled - show custom fallback or default empty state
  if (fallback) {
    return <>{fallback}</>
  }

  // Default empty state
  return <FeatureDisabledState feature={feature} isLocked={isFeatureLocked} />
}

/**
 * Default empty state shown when feature is disabled
 */
function FeatureDisabledState({
  feature,
  isLocked,
}: {
  feature: FeatureKey
  isLocked: boolean
}) {
  const featureNames: Record<FeatureKey, string> = {
    patients: "Patients",
    appointments: "Appointments",
    tasks: "Tasks",
    insights: "Insights",
    alerts: "Alerts",
    accounting: "Accounting",
    labs: "Labs",
    medications: "Medications",
    files: "Files",
    reminders: "Reminders",
    ai_summary: "AI Clinical Notes Summary",
    ai_dictation: "AI Voice Dictation",
    ai_lab_extraction: "AI Lab Report Extraction",
  }

  const featureName = featureNames[feature] || feature

  return (
    <div className="flex min-h-[600px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            {isLocked ? (
              <RiLockLine className="size-8 text-gray-500 dark:text-gray-400" />
            ) : (
              <RiSettings3Line className="size-8 text-gray-500 dark:text-gray-400" />
            )}
          </div>

          {/* Title */}
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
            {isLocked ? "Feature Locked" : "Feature Disabled"}
          </h3>

          {/* Message */}
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {isLocked ? (
              <>
                <strong>{featureName}</strong> is not included in your current plan.
                <br />
                Upgrade your subscription to access this feature.
              </>
            ) : (
              <>
                <strong>{featureName}</strong> has been disabled for this clinic.
                <br />
                Contact your clinic administrator to enable it.
              </>
            )}
          </p>

          {/* CTA */}
          {isLocked ? (
            <Button
              variant="primary"
              onClick={() => (window.location.href = "/pricing")}
              className="inline-flex items-center gap-2"
            >
              <RiLockLine className="size-4" />
              View Plans & Upgrade
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => (window.location.href = "/settings")}
              className="inline-flex items-center gap-2"
            >
              <RiSettings3Line className="size-4" />
              Open Settings
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
