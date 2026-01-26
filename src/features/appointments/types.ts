/**
 * Centralized types for appointments feature
 * All appointment-related types should be defined here
 */

// Core Slot type (normalized)
export interface Slot {
  id: string
  clinicId: string
  doctorId: string
  startAt: string // ISO datetime
  endAt: string // ISO datetime
  appointmentType?: string
  state: "booked" | "cancelled" | "empty"
  appointmentId?: string // if booked/cancelled
  patientId?: string // if booked/cancelled
  patientName?: string // if booked/cancelled
  patientPhone?: string // if booked/cancelled
}

// Appointment (from API)
export interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientPhone: string
  doctorId: string
  clinicId: string
  startAt: string
  endAt: string
  durationMinutes: number
  status: "scheduled" | "completed" | "cancelled" | "confirmed" | "in_progress" | "no_show" | "arrived"
  type: string
  notes?: string
  createdAt: string
}

// Waiting List Entry
export interface WaitlistEntry {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  patientPhone: string
  requestedDoctorId?: string
  appointmentType?: "new" | "followup" | "online"
  preferredTimeWindow?: "any" | "morning" | "afternoon" | "evening"
  preferredDays?: string[]
  status: "active" | "offered" | "booked" | "snoozed" | "removed"
  priority: "low" | "normal" | "high"
  notes?: string
  createdAt: string
  updatedAt: string
}

// Doctor Availability
export interface DoctorAvailability {
  id: string
  doctorId: string
  clinicId: string
  daysOfWeek: string[]
  startTime: string // "09:00"
  endTime: string // "17:00"
  slotDuration: number // minutes (default/fallback duration)
  appointmentType?: string // Legacy field, use appointmentTypeDurations instead
  appointmentTypeDurations?: Record<string, number> // Maps appointment type to duration in minutes
  breaks?: {
    startTime: string
    endTime: string
  }[]
  createdAt: string
  updatedAt: string
}

// Appointment Approval Request
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
