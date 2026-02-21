/**
 * Reactivation API - stats and data for Lead Re-activation Dashboard
 */

import { list } from "@/api/patients.api"
import { getReactivationRules } from "@/api/settings.api"
import { DEMO_CLINIC_ID } from "@/lib/constants"
import type { Patient } from "@/features/patients/patients.types"

export interface ReactivationStats {
  totalColdLeads: number
  potentialRevenue: number
  recoveryRate: number
  lostReasonDistribution: { reason: string; count: number }[]
  highValueColdLeads: Array<{
    id: string
    name: string
    lastInteraction: string | null
    lostReason: string | null
    estimatedValue: number
  }>
}

/**
 * Get patients considered cold/lapsed for reactivation.
 * Uses lead_status when available, else derives from is_cold and last_visit_at.
 */
export async function getColdLeads(clinicId: string): Promise<Patient[]> {
  const rules = await getReactivationRules(clinicId)
  const thresholdDays = rules.inactivityDaysThreshold
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000
  const now = Date.now()

  const response = await list({
    clinicId: clinicId || DEMO_CLINIC_ID,
    page: 1,
    pageSize: 2000,
    query: "",
  })

  return response.patients.filter((p) => {
    if (p.lead_status === "cold" || p.lead_status === "lapsed") return true
    if (p.is_cold) return true
    const lastActivity =
      p.last_interaction_date ?? p.last_visit_at ?? p.last_activity_at ?? p.created_at
    if (!lastActivity) return true
    const daysSince = (now - new Date(lastActivity).getTime()) / (24 * 60 * 60 * 1000)
    return daysSince >= thresholdDays
  })
}

/**
 * Get reactivation dashboard stats
 */
export async function getReactivationStats(clinicId: string): Promise<ReactivationStats> {
  const effectiveClinicId = clinicId || DEMO_CLINIC_ID
  const coldLeads = await getColdLeads(effectiveClinicId)

  const lostReasonMap = new Map<string, number>()
  for (const p of coldLeads) {
    const reason = p.lost_reason || "Unknown"
    lostReasonMap.set(reason, (lostReasonMap.get(reason) ?? 0) + 1)
  }
  const lostReasonDistribution = Array.from(lostReasonMap.entries()).map(([reason, count]) => ({
    reason,
    count,
  }))

  // High-value: cold leads with non-null last_interaction (placeholder - no quotes table)
  const highValueColdLeads = coldLeads.slice(0, 10).map((p) => ({
    id: p.id,
    name: `${p.first_name} ${p.last_name}`.trim(),
    lastInteraction: p.last_interaction_date ?? p.last_visit_at ?? p.created_at,
    lostReason: p.lost_reason ?? null,
    estimatedValue: 450,
  }))

  const isDemo = effectiveClinicId === "clinic-001" || effectiveClinicId === DEMO_CLINIC_ID

  return {
    totalColdLeads: coldLeads.length || (isDemo ? 47 : 0),
    potentialRevenue: isDemo ? 12450 : 0,
    recoveryRate: isDemo ? 12.5 : 0,
    lostReasonDistribution:
      coldLeads.length > 0
        ? lostReasonDistribution
        : isDemo
        ? [
            { reason: "Price sensitive", count: 15 },
            { reason: "Location", count: 8 },
            { reason: "Found another doctor", count: 12 },
            { reason: "Timing", count: 12 },
          ]
        : [],
    highValueColdLeads:
      highValueColdLeads.length > 0
        ? highValueColdLeads
        : isDemo
        ? [
            {
              id: "demo-1",
              name: "Mohamed Ahmed",
              lastInteraction: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
              lostReason: "Price sensitive",
              estimatedValue: 1200,
            },
            {
              id: "demo-2",
              name: "Sarah Ibrahim",
              lastInteraction: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              lostReason: "Timing",
              estimatedValue: 850,
            },
            {
              id: "demo-3",
              name: "Ahmed Hassan",
              lastInteraction: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
              lostReason: "Found another doctor",
              estimatedValue: 2400,
            },
          ]
        : [],
  }
}
