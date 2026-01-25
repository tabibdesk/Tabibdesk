/**
 * Archive API - replaceable backend layer
 * Provides functions to list archived appointments and tasks
 */

import { mockData } from "@/data/mock/mock-data"
import { getCreatedAppointments } from "@/features/appointments/appointments.api"
import { isAppointmentArchived } from "@/features/archive/archive.rules"
import { isTaskArchived } from "@/features/archive/archive.rules"
import type {
  ListArchivedAppointmentsParams,
  ListArchivedAppointmentsResponse,
  ListArchivedTasksParams,
  ListArchivedTasksResponse,
} from "@/features/archive/archive.types"
import type { AppointmentListItem } from "@/features/appointments/appointments.types"
import type { TaskListItem } from "@/features/tasks/tasks.types"

// Import tasks store - we'll need to access it
// Since tasks.api.ts doesn't export the store, we'll need to use listTasks and filter
import { listTasks } from "@/features/tasks/tasks.api"

/**
 * List archived appointments
 */
export async function listArchivedAppointments(
  params: ListArchivedAppointmentsParams
): Promise<ListArchivedAppointmentsResponse> {
  const { clinicId, from, to, query, status, doctorId, type, page, pageSize } = params

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
      duration_minutes: 30,
      status: apt.status,
      type: apt.type,
      scheduled_at: apt.scheduled_at,
      notes: apt.notes,
      created_at: apt.created_at,
    }
  })

  // Combine with created appointments
  const createdAppointments = getCreatedAppointments()
  const combinedAppointments = [...allAppointments, ...createdAppointments]

  // Filter by clinic
  let filteredAppointments = combinedAppointments.filter((apt) => {
    // Extract clinic_id from appointment if available
    const appointment = mockData.appointments.find((a) => a.id === apt.id)
    // If appointment exists in mockData, check clinic_id
    // If not, it's a created appointment - check if it matches clinicId
    // Created appointments should have clinic_id in the store, but for now we'll include them
    // In a real implementation, clinic_id would be part of AppointmentListItem
    if (appointment) {
      return appointment.clinic_id === clinicId
    }
    // For created appointments, we'll include them (they're created for current clinic)
    // In production, clinic_id should be part of the appointment data
    return true
  })

  // Apply archive rules - only include archived appointments
  filteredAppointments = filteredAppointments.filter((apt) => isAppointmentArchived(apt))

  // Filter by date range
  if (from || to) {
    filteredAppointments = filteredAppointments.filter((apt) => {
      const appointmentDate = new Date(`${apt.appointment_date}T00:00:00`)
      if (from && appointmentDate < from) return false
      if (to) {
        const toDate = new Date(to)
        toDate.setHours(23, 59, 59, 999)
        if (appointmentDate > toDate) return false
      }
      return true
    })
  }

  // Filter by status (multi-select)
  if (status && status.length > 0) {
    filteredAppointments = filteredAppointments.filter((apt) => status.includes(apt.status as any))
  }

  // Filter by doctor
  if (doctorId) {
    filteredAppointments = filteredAppointments.filter((apt) => {
      const appointment = mockData.appointments.find((a) => a.id === apt.id)
      return appointment?.doctor_id === doctorId
    })
  }

  // Filter by type
  if (type) {
    filteredAppointments = filteredAppointments.filter((apt) => apt.type === type)
  }

  // Filter by query (search)
  if (query && query.trim()) {
    const lowerQuery = query.toLowerCase().trim()
    filteredAppointments = filteredAppointments.filter((apt) => {
      const patientName = apt.patient_name.toLowerCase()
      const phone = apt.patient_phone.toLowerCase()
      const aptType = apt.type.toLowerCase()
      return patientName.includes(lowerQuery) || phone.includes(lowerQuery) || aptType.includes(lowerQuery)
    })
  }

  // Sort by date (most recent first for archive)
  filteredAppointments.sort((a, b) => {
    const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`)
    const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`)
    return dateB.getTime() - dateA.getTime()
  })

  // Paginate
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex)
  const total = filteredAppointments.length
  const hasMore = endIndex < total

  return {
    items: paginatedAppointments,
    total,
    page,
    pageSize,
    hasMore,
  }
}

/**
 * List archived tasks
 */
export async function listArchivedTasks(params: ListArchivedTasksParams): Promise<ListArchivedTasksResponse> {
  const { clinicId, from, to, query, status, assigneeId, type, page, pageSize } = params

  // Get all tasks for the clinic (we'll filter archived after)
  // We need to get all tasks first, then filter
  const allTasksResponse = await listTasks({
    clinicId,
    page: 1,
    pageSize: 10000, // Get all tasks
    status: "all",
  })

  // Filter to only archived tasks
  let filteredTasks = allTasksResponse.tasks.filter((task) => isTaskArchived(task))

  // Filter by date range (based on completed_at or ignored_at)
  if (from || to) {
    filteredTasks = filteredTasks.filter((task) => {
      // For completed tasks, use completed_at if available
      // For ignored tasks, use ignored_at
      // Otherwise, use createdAt
      const taskWithDates = task as TaskListItem & { completed_at?: string | null; ignored_at?: string | null }
      let taskDate: Date | null = null

      if (task.status === "done" && taskWithDates.completed_at) {
        taskDate = new Date(taskWithDates.completed_at)
      } else if (taskWithDates.ignored_at) {
        taskDate = new Date(taskWithDates.ignored_at)
      } else {
        taskDate = new Date(task.createdAt)
      }

      if (!taskDate) return true

      if (from && taskDate < from) return false
      if (to) {
        const toDate = new Date(to)
        toDate.setHours(23, 59, 59, 999)
        if (taskDate > toDate) return false
      }
      return true
    })
  }

  // Filter by status (multi-select)
  // Map UI statuses to actual task statuses
  if (status && status.length > 0) {
    filteredTasks = filteredTasks.filter((task) => {
      const taskWithIgnored = task as TaskListItem & { ignored_at?: string | null }
      if (status.includes("completed") && task.status === "done") return true
      if (status.includes("cancelled") && task.status === "cancelled") return true
      if (status.includes("ignored") && taskWithIgnored.ignored_at) return true
      return false
    })
  }

  // Filter by assignee
  if (assigneeId) {
    filteredTasks = filteredTasks.filter((task) => task.assignedToUserId === assigneeId)
  }

  // Filter by type
  if (type) {
    filteredTasks = filteredTasks.filter((task) => task.type === type)
  }

  // Filter by query (search)
  if (query && query.trim()) {
    const lowerQuery = query.toLowerCase().trim()
    filteredTasks = filteredTasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(lowerQuery)
      const descriptionMatch = task.description?.toLowerCase().includes(lowerQuery) || false
      const patientNameMatch = task.patientName?.toLowerCase().includes(lowerQuery) || false
      return titleMatch || descriptionMatch || patientNameMatch
    })
  }

  // Sort by date (most recent first for archive)
  filteredTasks.sort((a, b) => {
    const taskA = a as TaskListItem & { completed_at?: string | null; ignored_at?: string | null }
    const taskB = b as TaskListItem & { completed_at?: string | null; ignored_at?: string | null }

    let dateA: Date
    let dateB: Date

    if (a.status === "done" && taskA.completed_at) {
      dateA = new Date(taskA.completed_at)
    } else if (taskA.ignored_at) {
      dateA = new Date(taskA.ignored_at)
    } else {
      dateA = new Date(a.createdAt)
    }

    if (b.status === "done" && taskB.completed_at) {
      dateB = new Date(taskB.completed_at)
    } else if (taskB.ignored_at) {
      dateB = new Date(taskB.ignored_at)
    } else {
      dateB = new Date(b.createdAt)
    }

    return dateB.getTime() - dateA.getTime()
  })

  // Paginate
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex)
  const total = filteredTasks.length
  const hasMore = endIndex < total

  return {
    items: paginatedTasks,
    total,
    page,
    pageSize,
    hasMore,
  }
}
