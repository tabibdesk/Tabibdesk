/**
 * Slot Events API - handles slot opened events and triggers candidate suggestions
 * Currently uses mock data, but structured for easy backend replacement
 */

import { suggestCandidates } from "./waitingList.api"
import type { WaitlistEntry } from "../types"

export interface SlotOpenedParams {
  clinicId: string
  doctorId?: string
  appointmentType: string
  startAt: string // ISO datetime
  endAt: string // ISO datetime
  reason: "cancellation" | "no_show" | "manual_gap"
}

export interface SlotOpenedResponse {
  slotId: string
  suggestedCandidates: WaitlistEntry[]
}

/**
 * Called when a slot becomes available (cancellation, no-show, or manual gap)
 * Returns suggested candidates from the waiting list
 */
export async function onSlotOpened(params: SlotOpenedParams): Promise<SlotOpenedResponse> {
  const { clinicId, doctorId, appointmentType, startAt, endAt, reason } = params

  // Generate a unique slot ID
  const slotId = `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Get suggested candidates from waiting list
  const suggestedCandidates = await suggestCandidates({
    clinicId,
    doctorId,
    appointmentType,
    startAt,
    endAt,
    limit: 5,
  })

  // Log the event (for debugging in demo mode)
  console.log(`[Slot Event] Slot opened: ${slotId}`, {
    reason,
    doctorId,
    appointmentType,
    startAt,
    candidateCount: suggestedCandidates.length,
  })

  return {
    slotId,
    suggestedCandidates,
  }
}
