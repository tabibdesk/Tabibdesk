/**
 * Shared types for waiting list and slot fill features
 */

export interface WaitingListEntry {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  patientPhone: string
  requestedDoctorId?: string
  appointmentType?: "new" | "followup" | "online"
  earliestDate?: string
  latestDate?: string
  preferredTimeWindow?: "any" | "morning" | "afternoon" | "evening"
  preferredDays?: string[]
  status: "active" | "offered" | "booked" | "snoozed" | "removed"
  priority: "low" | "normal" | "high"
  notes?: string
  nextActionAt?: string
  createdAt: string
  updatedAt: string
  _matchScore?: number // Internal: matching score (not persisted)
}

export interface Slot {
  clinicId: string
  doctorId?: string
  appointmentType: string
  startAt: string // ISO datetime
  endAt: string // ISO datetime
}

export interface AppointmentApprovalRequest {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  patientPhone: string
  doctorId?: string
  appointmentType: string
  requestedStartAt: string
  requestedEndAt: string
  source: "integration" | "online_booking"
  status: "pending" | "approved" | "rejected"
  notes?: string
  createdAt: string
}
