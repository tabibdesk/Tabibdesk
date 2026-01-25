/**
 * Pure function: Suggest candidates for a slot
 * No side effects, no API calls, no state
 */

import type { Slot, WaitlistEntry } from "../types"

export function suggestCandidates(
  slot: Slot,
  entries: WaitlistEntry[]
): WaitlistEntry[] {
  // Filter by same clinic
  let filtered = entries.filter((e) => e.clinicId === slot.clinicId)
  
  // Filter by doctor if requested
  if (slot.doctorId) {
    filtered = filtered.filter(
      (e) => !e.requestedDoctorId || e.requestedDoctorId === slot.doctorId
    )
  }
  
  // Filter by appointment type if set
  if (slot.appointmentType) {
    filtered = filtered.filter(
      (e) => !e.appointmentType || e.appointmentType === slot.appointmentType
    )
  }
  
  // Filter by time window
  const slotHour = new Date(slot.startAt).getHours()
  filtered = filtered.filter((e) => {
    if (!e.preferredTimeWindow || e.preferredTimeWindow === "any") return true
    const isMorning = slotHour >= 6 && slotHour < 12
    const isAfternoon = slotHour >= 12 && slotHour < 18
    const isEvening = slotHour >= 18 && slotHour < 21
    
    return (
      (e.preferredTimeWindow === "morning" && isMorning) ||
      (e.preferredTimeWindow === "afternoon" && isAfternoon) ||
      (e.preferredTimeWindow === "evening" && isEvening)
    )
  })
  
  // Sort: priority desc, then createdAt asc
  filtered.sort((a, b) => {
    const priorityOrder = { high: 3, normal: 2, low: 1 }
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
  
  return filtered.slice(0, 2) // Top 2 only
}
