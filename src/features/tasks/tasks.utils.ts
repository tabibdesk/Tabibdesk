import type { TaskStatus, TaskType, TaskPriority, TaskSource } from "./tasks.types"

/** Translation keys for task badges - use with t.tasks[key] */
export const TASK_STATUS_KEYS: Record<TaskStatus, string> = {
  pending: "statusPending",
  done: "statusDone",
  cancelled: "statusCancelled",
}
export const TASK_TYPE_KEYS: Record<TaskType, string> = {
  follow_up: "typeFollowUp",
  appointment: "typeAppointment",
  labs: "typeLabs",
  scan: "typeScan",
  billing: "typeBilling",
  other: "typeOther",
}
export const TASK_SOURCE_KEYS: Record<TaskSource, string> = {
  alert: "sourceAutomated",
  manual: "sourceManual",
  ai: "sourceAi",
}
export const TASK_PRIORITY_KEYS: Record<TaskPriority, string> = {
  low: "low",
  normal: "normal",
  high: "high",
}

export function getStatusBadgeVariant(status: TaskStatus): "default" | "success" | "error" | "warning" | "neutral" {
  switch (status) {
    case "pending":
      return "default"
    case "done":
      return "success"
    case "cancelled":
      return "error"
    default:
      return "neutral"
  }
}

export function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "pending":
      return "Pending"
    case "done":
      return "Done"
    case "cancelled":
      return "Cancelled"
    default:
      return status
  }
}

export function getTypeLabel(type: TaskType): string {
  switch (type) {
    case "follow_up":
      return "Follow Up"
    case "appointment":
      return "Appointment"
    case "labs":
      return "Labs"
    case "scan":
      return "Scan"
    case "billing":
      return "Billing"
    case "other":
      return "Other"
    default:
      return type
  }
}

export function getSourceLabel(source: TaskSource): string {
  switch (source) {
    case "alert":
      return "Automated"
    case "manual":
      return "Manual"
    case "ai":
      return "AI"
    default:
      return source
  }
}

export function getSourceBadgeVariant(source: TaskSource): "default" | "success" | "error" | "warning" | "neutral" {
  switch (source) {
    case "alert":
      return "warning"
    case "ai":
      return "success"
    case "manual":
      return "neutral"
    default:
      return "neutral"
  }
}

export function getPriorityBadgeVariant(priority: TaskPriority): "default" | "success" | "error" | "warning" | "neutral" {
  switch (priority) {
    case "low":
      return "neutral"
    case "normal":
      return "default"
    case "high":
      return "error"
    default:
      return "neutral"
  }
}

export function getPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case "low":
      return "Low"
    case "normal":
      return "Normal"
    case "high":
      return "High"
    default:
      return priority
  }
}

export function formatTaskDate(dateString?: string): string {
  if (!dateString) return "—"
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDate = new Date(date)
  taskDate.setHours(0, 0, 0, 0)

  if (taskDate.getTime() === today.getTime()) {
    return "Today"
  }

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (taskDate.getTime() === tomorrow.getTime()) {
    return "Tomorrow"
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (taskDate.getTime() === yesterday.getTime()) {
    return "Yesterday"
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

/** Get relative day key for translation, or null if absolute date */
export function getTaskDateRelativeKey(dateString?: string): "today" | "tomorrow" | "yesterday" | null {
  if (!dateString) return null
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDate = new Date(date)
  taskDate.setHours(0, 0, 0, 0)

  if (taskDate.getTime() === today.getTime()) return "today"
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (taskDate.getTime() === tomorrow.getTime()) return "tomorrow"
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (taskDate.getTime() === yesterday.getTime()) return "yesterday"
  return null
}

/** Format task date with translations and locale-aware fallback */
export function formatTaskDateTranslated(
  dateString: string | undefined,
  t: { common: { today: string; tomorrow: string; yesterday: string } },
  lang: "en" | "ar"
): string {
  if (!dateString) return "—"
  const relativeKey = getTaskDateRelativeKey(dateString)
  if (relativeKey) return t.common[relativeKey]
  const date = new Date(dateString)
  const locale = lang === "ar" ? "ar-EG" : "en-US"
  return date.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })
}

export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false
  const due = new Date(dueDate)
  const now = new Date()
  return due < now && due.toDateString() !== now.toDateString()
}
