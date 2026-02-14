export type TaskType = "follow_up" | "appointment" | "labs" | "scan" | "billing" | "other"

export type TaskStatus = "pending" | "done" | "cancelled"

export type TaskPriority = "low" | "normal" | "high"

export type TaskSource = "manual" | "alert" | "ai"

export type AlertTaskPayload = {
  alertType: "question" | "lab"
  severity: "critical" | "warning" | "info"
  message?: string
  labResultId?: string
  labTestName?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  createdAt: string
  createdByUserId: string
  assignedToUserId?: string
  patientId?: string
  clinicId: string
  source: TaskSource
  sourceId?: string
  sourcePayload?: AlertTaskPayload
  // Follow-up task fields
  entity_type?: "patient" | "appointment"
  entity_id?: string
  follow_up_kind?: "cancelled" | "no_show" | "inactive"
  attempt?: number // default 1
  is_system_generated?: boolean
  snoozed_until?: string | null
}

export interface TaskListItem extends Task {
  patientName?: string
  patientPhone?: string
  assignedToName?: string
  createdByName?: string
}

export interface ListTasksParams {
  clinicId: string
  assignedToUserId?: string
  createdByUserId?: string
  status?: TaskStatus | "all"
  type?: TaskType | "all"
  priority?: TaskPriority | "all"
  source?: TaskSource | "all"
  query?: string
  page: number
  pageSize: number
}

export interface ListTasksResponse {
  tasks: TaskListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface CreateTaskPayload {
  title: string
  description?: string
  type: TaskType
  priority?: TaskPriority
  dueDate?: string
  /** Alias for dueDate used by follow-up task creation */
  dueAt?: string
  assignedToUserId?: string
  patientId?: string
  appointmentId?: string
  /** Follow-up kind when type is follow_up */
  kind?: "cancelled" | "no_show" | "inactive"
  attempt?: number
  clinicId: string
  createdByUserId: string
}

export interface UpdateTaskStatusPayload {
  id: string
  status: TaskStatus
}

export interface AssignTaskPayload {
  id: string
  assignedToUserId?: string
}
