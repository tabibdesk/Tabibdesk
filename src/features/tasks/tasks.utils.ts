import type { TaskStatus, TaskType, TaskPriority, TaskSource } from "./tasks.types"

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

export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false
  const due = new Date(dueDate)
  const now = new Date()
  return due < now && due.toDateString() !== now.toDateString()
}
