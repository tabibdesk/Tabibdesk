/**
 * Archive Types - Types for archive filters and responses
 */

import type { AppointmentListItem } from "@/features/appointments/appointments.types"
import type { TaskListItem } from "@/features/tasks/tasks.types"

export type DateRangePreset = "7" | "30" | "90" | "custom"

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export type ArchivedAppointmentStatus = "completed" | "cancelled" | "no_show"

export type ArchivedTaskStatus = "completed" | "ignored" | "cancelled"

export interface ListArchivedAppointmentsParams {
  clinicId: string
  from?: Date
  to?: Date
  query?: string
  status?: ArchivedAppointmentStatus[]
  doctorId?: string
  type?: string
  page: number
  pageSize: number
}

export interface ListArchivedTasksParams {
  clinicId: string
  from?: Date
  to?: Date
  query?: string
  status?: ArchivedTaskStatus[]
  assigneeId?: string
  type?: string
  page: number
  pageSize: number
}

export interface ListArchivedAppointmentsResponse {
  items: AppointmentListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ListArchivedTasksResponse {
  items: TaskListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
