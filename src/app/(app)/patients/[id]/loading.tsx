"use client"

import { PageSkeleton } from "@/components/skeletons"

/**
 * Route-level loading UI for patient profile. Shown immediately when
 * navigating to /patients/[id] while the page segment and data load.
 * Pure skeleton only — no text, no borders.
 */
export default function PatientProfileLoading() {
  return <PageSkeleton showHeader contentBlocks={2} />
}
