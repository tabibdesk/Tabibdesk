/**
 * Appointments API - replaceable backend layer
 * Currently uses mock data, but structured for easy backend replacement
 */

import { mockData } from "@/data/mock/mock-data"
import { activate as activatePatient } from "@/api/patients.api"
import { shouldActivatePatientFromAppointment } from "@/features/patients/patientLifecycle"
import { isAppointmentArchived } from "@/features/archive/archive.rules"
import { logActivity } from "@/api/activity.api"
import type { AppointmentStatus } from "@/features/patients/patientLifecycle"
import type { ListAppointmentsParams, ListAppointmentsResponse, AppointmentListItem } from "./appointments.types"
import type { Appointment as AppointmentType, WaitlistEntry, Slot } from "./types"

// In-memory store for appointments (demo mode only)
let appointmentsStore = [...mockData.appointments]

// In-memory store for created/updated appointments (demo mode only)
let createdAppointments: AppointmentListItem[] = []

export interface Appointment {
  id: string
  patientId: string
  patient_id: string
  status: AppointmentStatus
  appointmentDate: string
  scheduled_at: string
  [key: string]: unknown
}

export function getCreatedAppointments(): AppointmentListItem[] {
  return createdAppointments
}

export async function listAppointments(params: ListAppointmentsParams): Promise<ListAppointmentsResponse> {
  const { page, pageSize, query, status, timeFilter } = params

  // Transform mock appointments to match AppointmentListItem format
  const allAppointments: AppointmentListItem[] = mockData.appointments.map((apt) => {
    const date = new Date(apt.scheduled_at)
    const patient = mockData.patients.find((p) => p.id === apt.patient_id)
    
    return {
      id: apt.id,
      patient_id: apt.patient_id,
      patient_name: apt.patient_name,
      patient_phone: patient?.phone || "",
      appointment_date: date.toISOString().split("T")[0],
      appointment_time: date.toTimeString().slice(0, 5),
      duration_minutes: 30, // Default duration
      status: apt.status,
      type: apt.type,
      scheduled_at: apt.scheduled_at,
      notes: apt.notes,
      created_at: apt.created_at,
    }
  })

  // Combine with created appointments
  const combinedAppointments = [...allAppointments, ...createdAppointments]

  // Filter by query if provided
  let filteredAppointments = combinedAppointments
  if (query && query.trim()) {
    const lowerQuery = query.toLowerCase().trim()
    filteredAppointments = combinedAppointments.filter((apt) => {
      const patientName = apt.patient_name.toLowerCase()
      const phone = apt.patient_phone.toLowerCase()
      const type = apt.type.toLowerCase()

      return (
        patientName.includes(lowerQuery) ||
        phone.includes(lowerQuery) ||
        type.includes(lowerQuery)
      )
    })
  }

  // Filter by status
  if (status && status !== "all") {
    filteredAppointments = filteredAppointments.filter((apt) => apt.status === status)
  }

  // Filter by time (upcoming/past)
  if (timeFilter && timeFilter !== "all") {
    const now = new Date()
    filteredAppointments = filteredAppointments.filter((apt) => {
      const appointmentDateTime = new Date(`${apt.appointment_date} ${apt.appointment_time}`)
      if (timeFilter === "upcoming") {
        return appointmentDateTime >= now
      } else if (timeFilter === "past") {
        return appointmentDateTime < now
      }
      return true
    })
  }

  // Exclude archived appointments (only show active/pending appointments)
  filteredAppointments = filteredAppointments.filter((apt) => !isAppointmentArchived(apt))

  // Sort by date and time (earliest first)
  filteredAppointments.sort((a, b) => {
    const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`)
    const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`)
    return dateA.getTime() - dateB.getTime()
  })

  // Paginate
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex)
  const total = filteredAppointments.length
  const hasMore = endIndex < total

  return {
    appointments: paginatedAppointments,
    total,
    page,
    pageSize,
    hasMore,
  }
}

/**
 * Update appointment status
 * Automatically triggers patient activation if status is 'arrived' or 'completed'
 */
export async function updateStatus(appointmentId: string, status: AppointmentStatus): Promise<Appointment> {
  const appointment = appointmentsStore.find((apt) => apt.id === appointmentId)
  if (!appointment) {
    throw new Error("Appointment not found")
  }

  // Update appointment status
  const updated = {
    ...appointment,
    status,
    updated_at: new Date().toISOString(),
  }

  const index = appointmentsStore.findIndex((apt) => apt.id === appointmentId)
  appointmentsStore[index] = updated

  // Update createdAppointments if it exists there
  const createdIndex = createdAppointments.findIndex((apt) => apt.id === appointmentId)
  if (createdIndex !== -1) {
    createdAppointments[createdIndex] = {
      ...createdAppointments[createdIndex],
      status,
    }
  }

  // Trigger patient activation if needed
  if (shouldActivatePatientFromAppointment(status)) {
    const activationReason = status === "in_progress" ? ("in_progress" as const) : ("completed" as const)
    await activatePatient(appointment.patient_id, activationReason)
  }

  // Log activity
  await logActivity({
    clinicId: appointment.clinic_id,
    actorUserId: "user-001", // TODO: Get current user ID
    actorName: "Dr. Ahmed Hassan", // TODO: Get current user name
    actorRole: "doctor",
    action: "status_change",
    entityType: "appointment",
    entityId: appointmentId,
    entityLabel: `Appt: ${appointment.patient_name}`,
    message: `Changed appointment status to ${status}`,
    meta: { oldStatus: appointment.status, newStatus: status }
  });

  // Also update mock data for consistency
  const mockIndex = mockData.appointments.findIndex((apt) => apt.id === appointmentId)
  if (mockIndex !== -1) {
    mockData.appointments[mockIndex] = updated as typeof mockData.appointments[0]
  }

  return {
    ...updated,
    patientId: appointment.patient_id,
    appointmentDate: appointment.scheduled_at,
  } as Appointment
}

/**
 * Get appointment by ID
 */
export async function getById(appointmentId: string): Promise<Appointment | null> {
  const appointment = appointmentsStore.find((apt) => apt.id === appointmentId)
  if (!appointment) return null
  
  return {
    ...appointment,
    patientId: appointment.patient_id,
    appointmentDate: appointment.scheduled_at,
  } as Appointment
}

/**
 * List appointments for a specific day
 */
export async function listByDay(params: {
  clinicId: string
  doctorId?: string
  date: string // YYYY-MM-DD format
}): Promise<AppointmentType[]> {
  const { clinicId, doctorId, date } = params
  
  // Get all appointments for the day (compare by date string to avoid timezone issues)
  const dateStr = date // YYYY-MM-DD format
  
  // Use appointmentsStore (which includes updates) instead of mockData.appointments directly
  // This ensures rescheduled appointments are included
  const allMockAppointments = [...appointmentsStore]
  
  // Add created appointments that match the format
  const createdApptsForDay = createdAppointments
    .filter((apt) => {
      const aptDateStr = new Date(apt.scheduled_at).toISOString().split("T")[0]
      return aptDateStr === dateStr
    })
    .map((apt) => ({
      id: apt.id,
      patient_id: apt.patient_id,
      patient_name: apt.patient_name,
      scheduled_at: apt.scheduled_at,
      status: apt.status,
      type: apt.type,
      notes: apt.notes,
      created_at: apt.created_at,
      doctor_id: doctorId || null,
      doctor_full_name: null,
      clinic_id: clinicId,
      clinic_name: null,
    }))
  
  // Combine and deduplicate by ID (prioritize createdAppointments over mockData)
  const appointmentMap = new Map<string, typeof allMockAppointments[0]>()
  
  // First add all mock appointments
  allMockAppointments.forEach((apt) => {
    appointmentMap.set(apt.id, apt)
  })
  
  // Then add/override with created appointments (these take priority)
  createdApptsForDay.forEach((apt) => {
    appointmentMap.set(apt.id, apt as typeof allMockAppointments[0])
  })
  
  // Transform all appointments and exclude archived
  const allAppointments = Array.from(appointmentMap.values())
    .filter((apt) => {
      const aptDateStr = new Date(apt.scheduled_at).toISOString().split("T")[0]
      const matchesDate = aptDateStr === dateStr
      const matchesClinic = apt.clinic_id === clinicId
      const matchesDoctor = !doctorId || apt.doctor_id === doctorId
      return matchesDate && matchesClinic && matchesDoctor
    })
    .filter((apt) => {
      // Check if archived - transform to AppointmentListItem format for archive check
      const date = new Date(apt.scheduled_at)
      const patient = mockData.patients.find((p) => p.id === apt.patient_id)
      const aptListItem: AppointmentListItem = {
        id: apt.id,
        patient_id: apt.patient_id,
        patient_name: apt.patient_name,
        patient_phone: patient?.phone || "",
        appointment_date: date.toISOString().split("T")[0],
        appointment_time: date.toTimeString().slice(0, 5),
        duration_minutes: 30,
        status: apt.status,
        type: apt.type,
        scheduled_at: apt.scheduled_at,
        notes: apt.notes,
        created_at: apt.created_at,
      }
      // Exclude archived appointments
      return !isAppointmentArchived(aptListItem)
    })
    .map((apt) => {
      const patient = mockData.patients.find((p) => p.id === apt.patient_id)
      const startAt = new Date(apt.scheduled_at)
      const durationMinutes = 30 // Default, could be from appointment type
      const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000)
      
      return {
        id: apt.id,
        patientId: apt.patient_id,
        patientName: apt.patient_name,
        patientPhone: patient?.phone || "",
        doctorId: apt.doctor_id || "",
        clinicId: apt.clinic_id,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        durationMinutes,
        status: apt.status as AppointmentType["status"],
        type: apt.type,
        notes: apt.notes || undefined,
        createdAt: apt.created_at,
      }
    })
  
  // Sort by time
  allAppointments.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  
  return allAppointments
}

/**
 * Update appointment time (for drag-and-drop rearranging)
 */
export async function updateAppointmentTime(
  appointmentId: string,
  newStartAt: string,
  newEndAt: string
): Promise<AppointmentType> {
  const appointment = appointmentsStore.find((apt) => apt.id === appointmentId)
  if (!appointment) {
    throw new Error("Appointment not found")
  }
  
  // Calculate duration from original appointment
  const originalStart = new Date(appointment.scheduled_at)
  const originalEnd = new Date(originalStart.getTime() + 30 * 60 * 1000) // Default 30 min
  const durationMinutes = Math.round((originalEnd.getTime() - originalStart.getTime()) / (1000 * 60))
  
  // Use provided endAt or calculate from startAt + duration
  const calculatedEndAt = newEndAt || new Date(new Date(newStartAt).getTime() + durationMinutes * 60 * 1000).toISOString()
  
  // Update appointment
  const updated = {
    ...appointment,
    scheduled_at: newStartAt,
    updated_at: new Date().toISOString(),
  }

  // Log activity
  await logActivity({
    clinicId: appointment.clinic_id,
    actorUserId: "user-001",
    actorName: "Dr. Ahmed Hassan",
    actorRole: "doctor",
    action: "update",
    entityType: "appointment",
    entityId: appointmentId,
    entityLabel: `Appt: ${appointment.patient_name}`,
    message: `Rescheduled appointment to ${new Date(newStartAt).toLocaleString()}`,
  });

  const index = appointmentsStore.findIndex((apt) => apt.id === appointmentId)
  appointmentsStore[index] = updated
  
  // Update or add to createdAppointments to ensure it's tracked
  const createdIndex = createdAppointments.findIndex((apt) => apt.id === appointmentId)
  const date = new Date(newStartAt)
  const patient = mockData.patients.find((p) => p.id === appointment.patient_id)
  
  if (createdIndex !== -1) {
    // Update existing entry
    createdAppointments[createdIndex] = {
      ...createdAppointments[createdIndex],
      appointment_date: date.toISOString().split("T")[0],
      appointment_time: date.toTimeString().slice(0, 5),
      scheduled_at: newStartAt,
    }
  } else {
    // Add new entry to createdAppointments for tracking
    const durationMinutes = Math.round((new Date(calculatedEndAt).getTime() - new Date(newStartAt).getTime()) / (1000 * 60))
    createdAppointments.push({
      id: appointment.id,
      patient_id: appointment.patient_id,
      patient_name: appointment.patient_name,
      patient_phone: patient?.phone || "",
      appointment_date: date.toISOString().split("T")[0],
      appointment_time: date.toTimeString().slice(0, 5),
      duration_minutes: durationMinutes,
      status: appointment.status,
      type: appointment.type,
      scheduled_at: newStartAt,
      notes: appointment.notes || null,
      created_at: appointment.created_at,
    })
  }
  
  // Update mock data
  const mockIndex = mockData.appointments.findIndex((apt) => apt.id === appointmentId)
  if (mockIndex !== -1) {
    mockData.appointments[mockIndex] = updated as typeof mockData.appointments[0]
  }
  
  // Return transformed appointment (patient variable already defined above)
  return {
    id: appointment.id,
    patientId: appointment.patient_id,
    patientName: appointment.patient_name,
    patientPhone: patient?.phone || "",
    doctorId: appointment.doctor_id || "",
    clinicId: appointment.clinic_id,
    startAt: newStartAt,
    endAt: calculatedEndAt,
    durationMinutes,
    status: appointment.status as AppointmentType["status"],
    type: appointment.type,
    notes: appointment.notes || undefined,
    createdAt: appointment.created_at,
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(params: {
  patientId: string
  patientName: string
  patientPhone: string
  clinicId: string
  doctorId: string
  startAt: string
  endAt: string
  appointmentType: string
  notes?: string
}): Promise<AppointmentType> {
  const { patientId, patientName, patientPhone, clinicId, doctorId, startAt, endAt, appointmentType, notes } = params
  
  // Calculate duration from slot
  const start = new Date(startAt)
  const end = new Date(endAt)
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  
  // Create appointment entry
  const appointmentId = `apt-${Date.now()}`
  const now = new Date().toISOString()
  
  // Add to created appointments store
  const newAppointment: AppointmentListItem = {
    id: appointmentId,
    patient_id: patientId,
    patient_name: patientName,
    patient_phone: patientPhone,
    appointment_date: start.toISOString().split("T")[0],
    appointment_time: start.toTimeString().slice(0, 5),
    duration_minutes: durationMinutes,
    status: "scheduled",
    type: appointmentType,
    scheduled_at: startAt,
    notes: notes || null,
    created_at: now,
  }
  
  createdAppointments.push(newAppointment)
  
  // Also add to appointments store for listByDay to find it
  const appointmentForStore = {
    id: appointmentId,
    patient_id: patientId,
    patient_name: patientName,
    scheduled_at: startAt,
    status: "scheduled" as const,
    type: appointmentType,
    notes: notes || null,
    created_at: now,
    doctor_id: doctorId,
    doctor_full_name: null,
    clinic_id: clinicId,
    clinic_name: null,
  }
  
  appointmentsStore.push(appointmentForStore as typeof appointmentsStore[0])

  // Log activity
  await logActivity({
    clinicId,
    actorUserId: "user-001",
    actorName: "Dr. Ahmed Hassan",
    actorRole: "doctor",
    action: "book",
    entityType: "appointment",
    entityId: appointmentId,
    entityLabel: `Appt: ${patientName}`,
    message: `Booked appointment for ${patientName}`,
  });

  // Return transformed appointment
  return {
    id: appointmentId,
    patientId,
    patientName,
    patientPhone,
    doctorId,
    clinicId,
    startAt,
    endAt,
    durationMinutes,
    status: "scheduled",
    type: appointmentType,
    notes,
    createdAt: now,
  }
}

/**
 * Create appointment from waitlist entry
 */
export async function createAppointmentFromWaitlist(params: {
  waitlistEntry: WaitlistEntry
  slot: Slot
  clinicId: string
  doctorId?: string
}): Promise<AppointmentType> {
  const { waitlistEntry, slot, clinicId, doctorId } = params
  
  // Calculate duration from slot
  const startAt = new Date(slot.startAt)
  const endAt = new Date(slot.endAt)
  const durationMinutes = Math.round((endAt.getTime() - startAt.getTime()) / (1000 * 60))
  
  // Create appointment entry
  const appointmentId = `apt-waitlist-${Date.now()}`
  const now = new Date().toISOString()
  
  // Add to created appointments store
  const newAppointment: AppointmentListItem = {
    id: appointmentId,
    patient_id: waitlistEntry.patientId,
    patient_name: waitlistEntry.patientName,
    patient_phone: waitlistEntry.patientPhone,
    appointment_date: startAt.toISOString().split("T")[0],
    appointment_time: startAt.toTimeString().slice(0, 5),
    duration_minutes: durationMinutes,
    status: "scheduled",
    type: waitlistEntry.appointmentType || "Consultation",
    scheduled_at: slot.startAt,
    notes: waitlistEntry.notes || null,
    created_at: now,
  }
  
  createdAppointments.push(newAppointment)
  
  // Also add to appointments store for listByDay to find it
  const appointmentForStore = {
    id: appointmentId,
    patient_id: waitlistEntry.patientId,
    patient_name: waitlistEntry.patientName,
    scheduled_at: slot.startAt,
    status: "scheduled" as const,
    type: waitlistEntry.appointmentType || "Consultation",
    notes: waitlistEntry.notes || null,
    created_at: now,
    doctor_id: doctorId || null,
    doctor_full_name: null,
    clinic_id: clinicId,
    clinic_name: null,
  }
  
  appointmentsStore.push(appointmentForStore as typeof appointmentsStore[0])

  // Log activity
  await logActivity({
    clinicId,
    actorUserId: "user-001",
    actorName: "Dr. Ahmed Hassan",
    actorRole: "doctor",
    action: "book",
    entityType: "appointment",
    entityId: appointmentId,
    entityLabel: `Appt: ${waitlistEntry.patientName}`,
    message: `Booked appointment from waitlist for ${waitlistEntry.patientName}`,
  });

  // Return transformed appointment
  return {
    id: appointmentId,
    patientId: waitlistEntry.patientId,
    patientName: waitlistEntry.patientName,
    patientPhone: waitlistEntry.patientPhone,
    doctorId: doctorId || "",
    clinicId,
    startAt: slot.startAt,
    endAt: slot.endAt,
    durationMinutes,
    status: "scheduled",
    type: waitlistEntry.appointmentType || "Consultation",
    notes: waitlistEntry.notes,
    createdAt: now,
  }
}
