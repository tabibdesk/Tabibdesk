/**
 * Appointments API - business logic layer.
 * Uses repository factory for data access (mock or Supabase).
 */

import { getAppointmentsRepository, getPatientsRepository } from "@/lib/api/repository-factory"
import { DEMO_CLINIC_ID } from "@/lib/constants"
import { activate as activatePatient } from "@/api/patients.api"
import { shouldActivatePatientFromAppointment } from "@/features/patients/patientLifecycle"
import { isAppointmentArchived } from "@/features/archive/archive.rules"
import { logActivity } from "@/api/activity.api"
import { removeByPatientId as removeWaitlistByPatientId } from "./waitlist/waitingList.api"
import { getFollowUpRules } from "@/api/settings.api"
import type { AppointmentStatus } from "@/features/patients/patientLifecycle"
import type { ListAppointmentsParams, ListAppointmentsResponse, AppointmentListItem } from "./appointments.types"
import { getAppointmentTypeIdForStorage } from "./appointmentTypes"
import type { Appointment as AppointmentType, WaitlistEntry, Slot } from "./types"

// Reschedule history tracking
export interface RescheduleHistory {
  appointmentId: string
  patientId: string
  patientName: string
  originalScheduledAt: string
  newScheduledAt: string
  rescheduledAt: string
  rescheduledBy: string
  rescheduledByRole: string
  reason?: string
}

const rescheduleHistoryStore: RescheduleHistory[] = []

export function getRescheduleHistory(appointmentId?: string): RescheduleHistory[] {
  if (appointmentId) {
    return rescheduleHistoryStore.filter(h => h.appointmentId === appointmentId)
  }
  return [...rescheduleHistoryStore]
}

export interface Appointment {
  id: string
  patientId: string
  patient_id: string
  status: AppointmentStatus
  appointmentDate: string
  scheduled_at: string
  [key: string]: unknown
}

/** @deprecated Created appointments are now in the repository; use listAppointments instead. */
export function getCreatedAppointments(): AppointmentListItem[] {
  return []
}

export async function listAppointments(params: ListAppointmentsParams): Promise<ListAppointmentsResponse> {
  const { page, pageSize, query, status, timeFilter } = params
  const clinicId = params.clinicId ?? DEMO_CLINIC_ID

  const repo = await getAppointmentsRepository()
  const patientsRepo = await getPatientsRepository()
  const appointments = await repo.getAppointments(clinicId)

  const patientIds = [...new Set(appointments.map((a) => a.patient_id))]
  const patientMap = new Map<string, { phone: string }>()
  await Promise.all(
    patientIds.map(async (id) => {
      const p = await patientsRepo.getById(id)
      if (p) patientMap.set(id, { phone: p.phone })
    })
  )

  const allAppointments: AppointmentListItem[] = appointments.map((apt) => {
    const date = new Date(apt.scheduled_at)
    const patientPhone = patientMap.get(apt.patient_id)?.phone ?? ""
    const rescheduleHistory = rescheduleHistoryStore.filter((h) => h.appointmentId === apt.id)
    const isRescheduled = rescheduleHistory.length > 0
    const firstReschedule = [...rescheduleHistory].sort(
      (a, b) => new Date(a.rescheduledAt).getTime() - new Date(b.rescheduledAt).getTime()
    )[0]

    return {
      id: apt.id,
      patient_id: apt.patient_id,
      patient_name: apt.patient_name ?? "",
      patient_phone: patientPhone,
      appointment_date: date.toISOString().split("T")[0],
      appointment_time: date.toTimeString().slice(0, 5),
      duration_minutes: 30,
      status: apt.status as AppointmentListItem["status"],
      type: apt.type ?? "consultation",
      scheduled_at: apt.scheduled_at,
      notes: apt.notes,
      created_at: apt.created_at,
      rescheduled: isRescheduled,
      reschedule_count: rescheduleHistory.length,
      original_scheduled_at: firstReschedule?.originalScheduledAt ?? apt.scheduled_at,
    }
  })

  const combinedAppointments = allAppointments

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
  const repo = await getAppointmentsRepository()
  const appointment = await repo.getById(appointmentId)
  if (!appointment) throw new Error("Appointment not found")

  const clinicId = appointment.clinic_id ?? DEMO_CLINIC_ID
  const updated = await repo.updateAppointment(appointmentId, { status })

  if (shouldActivatePatientFromAppointment(status)) {
    const activationReason = status === "in_progress" ? ("in_progress" as const) : ("completed" as const)
    await activatePatient(appointment.patient_id, activationReason)
  }

  if (status === "cancelled" || status === "no_show") {
    try {
      const rules = await getFollowUpRules(clinicId)
      const shouldCreateTask =
        (status === "cancelled" && rules.followUpOnCancelled) ||
        (status === "no_show" && rules.followUpOnNoShow)

      if (shouldCreateTask) {
        // TODO: Implement follow-up task creation
        // This will be re-enabled once tasks.api exports createFollowUpTask
        /*
        const hasExisting = await hasOpenFollowUpTask(
          clinicId,
          appointmentId,
          status === "cancelled" ? "cancelled" : "no_show"
        )

        if (!hasExisting) {
          const delayHours =
            status === "cancelled" ? rules.cancelFollowUpDelayHours : rules.noShowFollowUpDelayHours
          const dueDate = new Date()
          dueDate.setHours(dueDate.getHours() + delayHours)

          await createFollowUpTask({
            clinicId,
            patientId: appointment.patient_id,
            appointmentId,
            kind: status === "cancelled" ? "cancelled" : "no_show",
            dueAt: dueDate.toISOString(),
            attempt: 1,
          })
        }
        */
      }
    } catch (error) {
      console.warn("Failed to create follow-up task:", error)
    }
  }

  await logActivity({
    clinicId,
    actorUserId: "user-001",
    actorName: "Dr. Ahmed Hassan",
    actorRole: "doctor",
    action: "status_change",
    entityType: "appointment",
    entityId: appointmentId,
    entityLabel: `Appt: ${appointment.patient_name ?? ""}`,
    message: `Changed appointment status to ${status}`,
    meta: { oldStatus: appointment.status, newStatus: status },
  })

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
  const repo = await getAppointmentsRepository()
  const appointment = await repo.getById(appointmentId)
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
  const { clinicId, doctorId, date: dateStr } = params
  const repo = await getAppointmentsRepository()
  const patientsRepo = await getPatientsRepository()
  const appointments = await repo.getAppointments(clinicId)

  const result: AppointmentType[] = []
  for (const apt of appointments) {
    const aptDateStr = new Date(apt.scheduled_at).toISOString().split("T")[0]
    if (aptDateStr !== dateStr) continue
    if (doctorId && apt.doctor_id !== doctorId) continue

    const patient = await patientsRepo.getById(apt.patient_id)
    const date = new Date(apt.scheduled_at)
    const aptListItem: AppointmentListItem = {
      id: apt.id,
      patient_id: apt.patient_id,
      patient_name: apt.patient_name ?? "",
      patient_phone: patient?.phone ?? "",
      appointment_date: date.toISOString().split("T")[0],
      appointment_time: date.toTimeString().slice(0, 5),
      duration_minutes: 30,
      status: apt.status as AppointmentListItem["status"],
      type: apt.type ?? "consultation",
      scheduled_at: apt.scheduled_at,
      notes: apt.notes,
      created_at: apt.created_at,
    }
    if (isAppointmentArchived(aptListItem)) continue

    const startAt = new Date(apt.scheduled_at)
    const durationMinutes = 30
    const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000)
    result.push({
      id: apt.id,
      patientId: apt.patient_id,
      patientName: apt.patient_name ?? "",
      patientPhone: patient?.phone ?? "",
      doctorId: apt.doctor_id ?? "",
      clinicId: apt.clinic_id ?? "",
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      durationMinutes,
      status: apt.status as AppointmentType["status"],
      type: apt.type ?? "consultation",
      notes: apt.notes ?? undefined,
      createdAt: apt.created_at,
    } as AppointmentType)
  }

  result.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  return result
}

/**
 * Update appointment time (for drag-and-drop rearranging)
 */
export async function updateAppointmentTime(
  appointmentId: string,
  newStartAt: string,
  newEndAt: string,
  options?: {
    rescheduledBy?: string
    rescheduledByRole?: string
    rescheduledByName?: string
    reason?: string
  }
): Promise<AppointmentType> {
  const repo = await getAppointmentsRepository()
  const patientsRepo = await getPatientsRepository()
  const appointment = await repo.getById(appointmentId)
  if (!appointment) throw new Error("Appointment not found")

  const originalScheduledAt = appointment.scheduled_at
  const isReschedule = originalScheduledAt !== newStartAt
  const originalStart = new Date(originalScheduledAt)
  const durationMinutes = 30
  const calculatedEndAt =
    newEndAt ||
    new Date(new Date(newStartAt).getTime() + durationMinutes * 60 * 1000).toISOString()

  if (isReschedule) {
    rescheduleHistoryStore.push({
      appointmentId,
      patientId: appointment.patient_id,
      patientName: appointment.patient_name ?? "",
      originalScheduledAt,
      newScheduledAt: newStartAt,
      rescheduledAt: new Date().toISOString(),
      rescheduledBy: options?.rescheduledBy ?? "user-001",
      rescheduledByRole: options?.rescheduledByRole ?? "assistant",
      reason: options?.reason,
    })
    await logActivity({
      clinicId: appointment.clinic_id ?? "",
      actorUserId: options?.rescheduledBy ?? "user-001",
      actorName: options?.rescheduledByName ?? "Assistant",
      actorRole: options?.rescheduledByRole ?? "assistant",
      action: "reschedule",
      entityType: "appointment",
      entityId: appointmentId,
      entityLabel: `Appt: ${appointment.patient_name ?? ""}`,
      message: `Rescheduled appointment from ${new Date(originalScheduledAt).toLocaleString()} to ${new Date(newStartAt).toLocaleString()}`,
      meta: { originalScheduledAt, newScheduledAt: newStartAt, reason: options?.reason },
    })
  } else {
    await logActivity({
      clinicId: appointment.clinic_id ?? "",
      actorUserId: options?.rescheduledBy ?? "user-001",
      actorName: options?.rescheduledByName ?? "Assistant",
      actorRole: options?.rescheduledByRole ?? "assistant",
      action: "update",
      entityType: "appointment",
      entityId: appointmentId,
      entityLabel: `Appt: ${appointment.patient_name ?? ""}`,
      message: `Updated appointment time to ${new Date(newStartAt).toLocaleString()}`,
    })
  }

  await repo.updateAppointment(appointmentId, { scheduled_at: newStartAt })

  const patient = await patientsRepo.getById(appointment.patient_id)
  return {
    id: appointment.id,
    patientId: appointment.patient_id,
    patientName: appointment.patient_name ?? "",
    patientPhone: patient?.phone ?? "",
    doctorId: appointment.doctor_id ?? "",
    clinicId: appointment.clinic_id ?? "",
    startAt: newStartAt,
    endAt: calculatedEndAt,
    durationMinutes,
    status: appointment.status as AppointmentType["status"],
    type: appointment.type ?? "consultation",
    notes: appointment.notes ?? undefined,
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
  const {
    patientId,
    patientName,
    patientPhone,
    clinicId,
    doctorId,
    startAt,
    endAt,
    appointmentType: appointmentTypeParam,
    notes,
  } = params
  const appointmentType = getAppointmentTypeIdForStorage(appointmentTypeParam)
  const start = new Date(startAt)
  const end = new Date(endAt)
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

  const repo = await getAppointmentsRepository()
  const created = await repo.createAppointment({
    clinic_id: clinicId,
    patient_id: patientId,
    scheduled_at: startAt,
    status: "scheduled",
    notes: notes ?? null,
    doctor_id: doctorId,
    type: appointmentType,
    patient_name: patientName,
  })

  try {
    await removeWaitlistByPatientId(patientId)
  } catch (error) {
    console.error("Failed to remove patient from waitlist:", error)
  }

  await logActivity({
    clinicId,
    actorUserId: "user-001",
    actorName: "Dr. Ahmed Hassan",
    actorRole: "doctor",
    action: "book",
    entityType: "appointment",
    entityId: created.id,
    entityLabel: `Appt: ${patientName}`,
    message: `Booked appointment for ${patientName}`,
  })

  return {
    id: created.id,
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
    createdAt: created.created_at,
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
  const startAt = new Date(slot.startAt)
  const endAt = new Date(slot.endAt)
  const durationMinutes = Math.round((endAt.getTime() - startAt.getTime()) / (1000 * 60))
  const appointmentType = getAppointmentTypeIdForStorage(waitlistEntry.appointmentType)

  const repo = await getAppointmentsRepository()
  const created = await repo.createAppointment({
    clinic_id: clinicId,
    patient_id: waitlistEntry.patientId,
    scheduled_at: slot.startAt,
    status: "scheduled",
    notes: waitlistEntry.notes ?? null,
    doctor_id: doctorId ?? null,
    type: appointmentType,
    patient_name: waitlistEntry.patientName,
  })

  try {
    await removeWaitlistByPatientId(waitlistEntry.patientId)
  } catch (error) {
    console.error("Failed to remove patient from waitlist:", error)
  }

  await logActivity({
    clinicId,
    actorUserId: "user-001",
    actorName: "Dr. Ahmed Hassan",
    actorRole: "doctor",
    action: "book",
    entityType: "appointment",
    entityId: created.id,
    entityLabel: `Appt: ${waitlistEntry.patientName}`,
    message: `Booked appointment from waitlist for ${waitlistEntry.patientName}`,
  })

  return {
    id: created.id,
    patientId: waitlistEntry.patientId,
    patientName: waitlistEntry.patientName,
    patientPhone: waitlistEntry.patientPhone,
    doctorId: doctorId ?? "",
    clinicId,
    startAt: slot.startAt,
    endAt: slot.endAt,
    durationMinutes,
    status: "scheduled",
    type: appointmentType,
    notes: waitlistEntry.notes,
    createdAt: created.created_at,
  }
}
