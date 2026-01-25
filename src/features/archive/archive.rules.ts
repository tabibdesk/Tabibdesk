/**
 * Archive Rules - Single source of truth for what counts as "archived"
 * These rules are used by both archive API and main list APIs to exclude archived items
 */

import type { AppointmentListItem } from "@/features/appointments/appointments.types"
import type { TaskListItem } from "@/features/tasks/tasks.types"

/**
 * Determines if an appointment should be considered archived
 * 
 * Appointments are archived if:
 * - status is 'completed', 'cancelled', or 'no_show' OR
 * - appointment_date is in the past (before start of today)
 */
export function isAppointmentArchived(appointment: AppointmentListItem): boolean {
  // Check if status indicates archived
  const archivedStatuses: AppointmentListItem["status"][] = ["completed", "cancelled", "no_show"]
  if (archivedStatuses.includes(appointment.status)) {
    return true
  }

  // Check if appointment date is in the past
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const appointmentDate = new Date(`${appointment.appointment_date}T00:00:00`)
  
  return appointmentDate < today
}

/**
 * Determines if a task should be considered archived
 * 
 * Tasks are archived if:
 * - status is 'done' (completed) or 'cancelled' OR
 * - ignored_at field exists (task was ignored)
 */
export function isTaskArchived(task: TaskListItem): boolean {
  // Check if status indicates archived
  if (task.status === "done" || task.status === "cancelled") {
    return true
  }

  // Check if task has been ignored (has ignored_at field)
  // Note: TaskListItem extends Task, which may have ignored_at
  const taskWithIgnored = task as TaskListItem & { ignored_at?: string | null }
  if (taskWithIgnored.ignored_at) {
    return true
  }

  return false
}
