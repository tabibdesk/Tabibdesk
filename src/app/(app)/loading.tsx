"use client"

import { PageSkeleton } from "@/components/skeletons"

/**
 * App-wide loading UI for the (app) segment. Shown immediately when
 * navigating between any app routes (dashboard, patients, appointments,
 * tasks, etc.) while the destination page segment loads.
 * Pure skeleton only — no text, no borders.
 */
export default function AppLoading() {
  return <PageSkeleton showHeader contentBlocks={2} />
}
