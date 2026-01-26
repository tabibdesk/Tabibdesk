import { mockUsers, getMockUsersByRole } from "@/data/mock/users-clinics"
import { mockData } from "@/data/mock/mock-data"
import { isTaskArchived } from "@/features/archive/archive.rules"
import { logActivity } from "@/api/activity.api"
import { getFollowUpRules } from "@/api/settings.api"
import type {
  ListTasksParams,
  ListTasksResponse,
  Task,
  TaskListItem,
  CreateTaskPayload,
  UpdateTaskStatusPayload,
  AssignTaskPayload,
  TaskStatus,
} from "./tasks.types"

// In-memory store for tasks (demo mode only)
let tasksStore: Task[] = []

// Initialize with some mock tasks
function initializeMockTasks() {
  // Migrate any existing tasks with old clinic ID
  tasksStore.forEach((task) => {
    if (task.clinicId === "demo-clinic-001") {
      task.clinicId = "clinic-001"
    }
  })

  // Check if we have the default mock tasks - if not, initialize them
  const hasDefaultTasks = tasksStore.some((task) => task.id === "task-001" || task.id === "alert-task-alert-001")
  
  if (!hasDefaultTasks) {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const manualTasks: Task[] = [
      {
        id: "task-001",
        title: "Follow up with patient Ahmed",
        description: "Check on recovery progress",
        type: "follow_up",
        status: "pending",
        priority: "high",
        dueDate: tomorrow.toISOString(),
        createdAt: now.toISOString(),
        createdByUserId: "user-001",
        assignedToUserId: "user-003",
        patientId: mockData.patients[0]?.id,
        clinicId: "clinic-001",
        source: "manual",
      },
      {
        id: "task-002",
        title: "Review lab results",
        description: "Patient Fatima - blood work results",
        type: "labs",
        status: "pending",
        priority: "normal",
        dueDate: nextWeek.toISOString(),
        createdAt: now.toISOString(),
        createdByUserId: "user-001",
        assignedToUserId: "user-001",
        patientId: mockData.patients[1]?.id,
        clinicId: "clinic-001",
        source: "manual",
      },
      {
        id: "task-003",
        title: "Schedule appointment",
        description: "Book follow-up for patient",
        type: "appointment",
        status: "pending",
        priority: "normal",
        dueDate: tomorrow.toISOString(),
        createdAt: now.toISOString(),
        createdByUserId: "user-001",
        assignedToUserId: "user-003",
        clinicId: "clinic-001",
        source: "manual",
      },
      {
        id: "task-004",
        title: "Process billing",
        description: "Invoice for last visit",
        type: "billing",
        status: "done",
        priority: "low",
        dueDate: now.toISOString(),
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdByUserId: "user-001",
        assignedToUserId: "user-003",
        clinicId: "clinic-001",
        source: "manual",
      },
      {
        id: "task-005",
        title: "Review scan results",
        description: "X-ray review needed",
        type: "scan",
        status: "pending",
        priority: "high",
        dueDate: nextWeek.toISOString(),
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdByUserId: "user-001",
        assignedToUserId: "user-001",
        clinicId: "clinic-001",
        source: "manual",
      },
    ]

    const makeAlertTask = (seed: {
      id: string
      alertType: "question" | "lab"
      severity: "critical" | "warning" | "info"
      patientId: string
      title: string
      message: string
      createdAt: string
      isReviewed: boolean
      labResultId?: string
      labTestName?: string
    }): Task => {
      const priority = seed.severity === "critical" ? "high" : seed.severity === "warning" ? "normal" : "low"
      const type = seed.alertType === "lab" ? "labs" : "follow_up"

      // Lightweight SLA based on severity
      const due = new Date(seed.createdAt)
      if (seed.severity === "critical") due.setHours(due.getHours() + 1)
      else if (seed.severity === "warning") due.setHours(due.getHours() + 24)
      else due.setHours(due.getHours() + 72)

      return {
        id: `alert-task-${seed.id}`,
        title: seed.title,
        description: seed.message,
        type,
        status: seed.isReviewed ? "done" : "pending",
        priority,
        dueDate: due.toISOString(),
        createdAt: seed.createdAt,
        createdByUserId: "system",
        // Default triage owner: assistant
        assignedToUserId: "user-003",
        patientId: seed.patientId,
        clinicId: "clinic-001",
        source: "alert",
        sourceId: seed.id,
        sourcePayload: {
          alertType: seed.alertType,
          severity: seed.severity,
          message: seed.message,
          labResultId: seed.labResultId,
          labTestName: seed.labTestName,
        },
      }
    };

    const alertSeeds = [
      // Critical - patient question
      {
        id: "alert-001",
        alertType: "question" as const,
        severity: "critical" as const,
        patientId: "patient-004",
        title: "Urgent: Severe Side Effects",
        message: "Patient reports severe chest pain and breathing difficulty",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        isReviewed: false,
      },
      // Critical lab result
      {
        id: "alert-002",
        alertType: "lab" as const,
        severity: "critical" as const,
        patientId: "patient-002",
        title: "Abnormal HbA1c Result",
        message: "HbA1c level at 6.8% - above normal range",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isReviewed: false,
        labResultId: "lab-004",
        labTestName: "HbA1c",
      },
      // Warning - patient question
      {
        id: "alert-003",
        alertType: "question" as const,
        severity: "warning" as const,
        patientId: "patient-001",
        title: "Patient Complaint: Dizziness",
        message: "Experiencing frequent dizziness after taking blood pressure medication",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        isReviewed: false,
      },
      // Warning - lab result
      {
        id: "alert-004",
        alertType: "lab" as const,
        severity: "warning" as const,
        patientId: "patient-001",
        title: "Borderline LDL Cholesterol",
        message: "LDL level at 115 mg/dL - slightly above recommended range",
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        isReviewed: false,
        labResultId: "lab-003",
        labTestName: "LDL",
      },
      // Info - patient question
      {
        id: "alert-005",
        alertType: "question" as const,
        severity: "info" as const,
        patientId: "patient-003",
        title: "Question About Diet Plan",
        message: "Can I substitute quinoa with brown rice in my meal plan?",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        isReviewed: false,
      },
      // Already reviewed
      {
        id: "alert-006",
        alertType: "question" as const,
        severity: "warning" as const,
        patientId: "patient-005",
        title: "GERD Symptoms Worsening",
        message: "Experiencing increased heartburn despite medication",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isReviewed: true,
      },
    ]

    const alertTasks: Task[] = alertSeeds.map(makeAlertTask)

    tasksStore = [...alertTasks, ...manualTasks]
  }
}

initializeMockTasks()

function enrichTaskWithNames(task: Task): TaskListItem {
  const patient = task.patientId ? mockData.patients.find((p) => p.id === task.patientId) : undefined
  const assignedTo = task.assignedToUserId ? mockUsers.find((u) => u.id === task.assignedToUserId) : undefined
  const createdBy = mockUsers.find((u) => u.id === task.createdByUserId)

  return {
    ...task,
    patientName: patient ? `${patient.first_name} ${patient.last_name}` : undefined,
    patientPhone: patient?.phone,
    assignedToName: assignedTo?.full_name,
    createdByName: createdBy?.full_name || (task.createdByUserId === "system" ? "System" : undefined),
  }
}

export async function listTasks(params: ListTasksParams): Promise<ListTasksResponse> {
  // Ensure initialization and migration happen
  initializeMockTasks()
  
  const { clinicId, assignedToUserId, createdByUserId, status, type, priority, source, query, page, pageSize } = params

  // Debug logging
  console.log("listTasks called with:", { clinicId, status, totalTasksInStore: tasksStore.length })
  console.log("Tasks in store:", tasksStore.map(t => ({ id: t.id, clinicId: t.clinicId, status: t.status })))

  let filteredTasks = tasksStore.filter((task) => task.clinicId === clinicId)
  console.log("After clinic filter:", filteredTasks.length)

  // Filter by assigned user
  if (assignedToUserId !== undefined) {
    if (assignedToUserId === null) {
      filteredTasks = filteredTasks.filter((task) => !task.assignedToUserId)
    } else {
      filteredTasks = filteredTasks.filter((task) => task.assignedToUserId === assignedToUserId)
    }
  }

  // Filter by created by user
  if (createdByUserId) {
    filteredTasks = filteredTasks.filter((task) => task.createdByUserId === createdByUserId)
  }

  // Filter by status
  if (status && status !== "all") {
    filteredTasks = filteredTasks.filter((task) => task.status === status)
  }

  // Filter by type
  if (type && type !== "all") {
    filteredTasks = filteredTasks.filter((task) => task.type === type)
  }

  // Filter by priority
  if (priority && priority !== "all") {
    filteredTasks = filteredTasks.filter((task) => task.priority === priority)
  }

  // Filter by source
  if (source && source !== "all") {
    filteredTasks = filteredTasks.filter((task) => task.source === source)
  }

  // Filter by query (search in title, description, patient name)
  if (query && query.trim()) {
    const lowerQuery = query.toLowerCase().trim()
    filteredTasks = filteredTasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(lowerQuery)
      const descriptionMatch = task.description?.toLowerCase().includes(lowerQuery) || false
      const patient = task.patientId ? mockData.patients.find((p) => p.id === task.patientId) : undefined
      const patientNameMatch = patient
        ? `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(lowerQuery)
        : false
      const typeMatch = task.type.toLowerCase().replace("_", " ").includes(lowerQuery)
      const sourceMatch = task.source.toLowerCase().includes(lowerQuery)

      return titleMatch || descriptionMatch || patientNameMatch || typeMatch || sourceMatch
    })
  }

  // Exclude archived tasks (only show pending/active tasks)
  // Enrich tasks first to check archive status
  const enrichedForArchiveCheck = filteredTasks.map(enrichTaskWithNames)
  filteredTasks = filteredTasks.filter((task, index) => {
    return !isTaskArchived(enrichedForArchiveCheck[index])
  })

  // Sort by due date (overdue first, then by date), then by priority
  filteredTasks.sort((a, b) => {
    // Overdue tasks first
    const aOverdue = a.dueDate ? new Date(a.dueDate) < new Date() && a.status === "pending" : false
    const bOverdue = b.dueDate ? new Date(b.dueDate) < new Date() && b.status === "pending" : false

    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1

    // Then by due date
    if (a.dueDate && b.dueDate) {
      const dateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      if (dateDiff !== 0) return dateDiff
    } else if (a.dueDate) return -1
    else if (b.dueDate) return 1

    // Then by priority
    const priorityOrder: Record<string, number> = { high: 0, normal: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Paginate
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex)
  const total = filteredTasks.length
  const hasMore = endIndex < total

  // Enrich with names
  const enrichedTasks = paginatedTasks.map(enrichTaskWithNames)

  return {
    tasks: enrichedTasks,
    total,
    page,
    pageSize,
    hasMore,
  }
}

export async function createTask(payload: CreateTaskPayload): Promise<TaskListItem> {
  const newTask: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: payload.title,
    description: payload.description,
    type: payload.type,
    status: "pending",
    priority: payload.priority || "normal",
    dueDate: payload.dueDate,
    createdAt: new Date().toISOString(),
    createdByUserId: payload.createdByUserId,
    assignedToUserId: payload.assignedToUserId,
    patientId: payload.patientId,
    clinicId: payload.clinicId,
    source: "manual",
  }

  tasksStore.push(newTask)

  // Log activity
  await logActivity({
    clinicId: payload.clinicId,
    actorUserId: payload.createdByUserId,
    actorName: "Dr. Ahmed Hassan", // TODO: Get name
    actorRole: "doctor",
    action: "create",
    entityType: "task",
    entityId: newTask.id,
    entityLabel: newTask.title,
    message: `Created task: ${newTask.title}`,
  });

  return enrichTaskWithNames(newTask)
}

export async function updateTaskStatus(payload: UpdateTaskStatusPayload): Promise<TaskListItem> {
  const task = tasksStore.find((t) => t.id === payload.id)
  if (!task) {
    throw new Error("Task not found")
  }

  task.status = payload.status

  // Log activity
  await logActivity({
    clinicId: task.clinicId,
    actorUserId: "user-001",
    actorName: "Dr. Ahmed Hassan",
    actorRole: "doctor",
    action: "status_change",
    entityType: "task",
    entityId: task.id,
    entityLabel: task.title,
    message: `Updated task status to ${payload.status}`,
  });

  return enrichTaskWithNames(task)
}

export async function assignTask(payload: AssignTaskPayload): Promise<TaskListItem> {
  const task = tasksStore.find((t) => t.id === payload.id)
  if (!task) {
    throw new Error("Task not found")
  }

  task.assignedToUserId = payload.assignedToUserId || undefined

  // Log activity
  await logActivity({
    clinicId: task.clinicId,
    actorUserId: "user-001",
    actorName: "Dr. Ahmed Hassan",
    actorRole: "doctor",
    action: "assign",
    entityType: "task",
    entityId: task.id,
    entityLabel: task.title,
    message: payload.assignedToUserId 
      ? `Assigned task to user ${payload.assignedToUserId}`
      : `Unassigned task`,
  });

  return enrichTaskWithNames(task)
}

/**
 * Snooze a task (set snoozed_until and update due date)
 */
export async function snoozeTask(
  taskId: string,
  snoozedUntil: string
): Promise<TaskListItem> {
  const task = tasksStore.find((t) => t.id === taskId)
  if (!task) {
    throw new Error("Task not found")
  }

  task.snoozed_until = snoozedUntil
  task.dueDate = snoozedUntil

  // Log activity
  await logActivity({
    clinicId: task.clinicId,
    actorUserId: "user-001",
    actorName: "Dr. Ahmed Hassan",
    actorRole: "doctor",
    action: "update", // "snooze" is not a valid ActivityAction, using "update"
    entityType: "task",
    entityId: task.id,
    entityLabel: task.title,
    message: `Snoozed task until ${new Date(snoozedUntil).toLocaleString()}`,
  })

  return enrichTaskWithNames(task)
}

/**
 * Update task (for general updates)
 */
export async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<TaskListItem> {
  const task = tasksStore.find((t) => t.id === taskId)
  if (!task) {
    throw new Error("Task not found")
  }

  Object.assign(task, updates)

  return enrichTaskWithNames(task)
}

/**
 * Check if an open follow-up task already exists for the given appointment and kind
 */
export async function hasOpenFollowUpTask(
  clinicId: string,
  appointmentId: string,
  kind: "cancelled" | "no_show"
): Promise<boolean> {
  const openTasks = tasksStore.filter(
    (task) =>
      task.clinicId === clinicId &&
      task.status === "pending" &&
      task.entity_type === "appointment" &&
      task.entity_id === appointmentId &&
      task.follow_up_kind === kind
  )
  return openTasks.length > 0
}

/**
 * Create a follow-up task for cancelled/no-show appointments
 */
export async function createFollowUpTask(params: {
  clinicId: string
  patientId: string
  appointmentId: string
  kind: "cancelled" | "no_show"
  dueAt: string
  attempt?: number
}): Promise<TaskListItem> {
  const { clinicId, patientId, appointmentId, kind, dueAt, attempt = 1 } = params

  // Get follow-up rules to determine assignment
  const rules = await getFollowUpRules(clinicId)

  // Find user with matching role
  const usersWithRole = getMockUsersByRole(rules.autoAssignRole === "assistant" ? "assistant" : "assistant")
  const assignedToUserId = usersWithRole[0]?.id || "user-003" // Default to first assistant

  // Get patient name for task title
  const patient = mockData.patients.find((p) => p.id === patientId)
  const patientName = patient ? `${patient.first_name} ${patient.last_name}` : "Patient"

  // Generate task title
  const kindLabel = kind === "cancelled" ? "Cancelled" : "No-show"
  const title = `Follow up: ${patientName} - ${kindLabel} (Attempt ${attempt})`

  const newTask: Task = {
    id: `followup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    description: `Follow-up task for ${kind} appointment. Attempt ${attempt} of ${rules.maxAttempts}.`,
    type: "follow_up",
    status: "pending",
    priority: "normal",
    dueDate: dueAt,
    createdAt: new Date().toISOString(),
    createdByUserId: "system",
    assignedToUserId,
    patientId,
    clinicId,
    source: "manual",
    entity_type: "appointment",
    entity_id: appointmentId,
    follow_up_kind: kind,
    attempt,
    is_system_generated: true,
  }

  tasksStore.push(newTask)

  // Log activity
  await logActivity({
    clinicId,
    actorUserId: "system",
    actorName: "System",
    actorRole: "assistant",
    action: "create",
    entityType: "task",
    entityId: newTask.id,
    entityLabel: newTask.title,
    message: `Created follow-up task: ${newTask.title}`,
  })

  return enrichTaskWithNames(newTask)
}

/**
 * List active tasks (status = "pending")
 */
export async function listActiveTasks(params: {
  clinicId: string
  query?: string
  status?: TaskStatus
  assignedToUserId?: string
  dueFrom?: string
  dueTo?: string
  page: number
  pageSize: number
}): Promise<ListTasksResponse> {
  return listTasks({
    ...params,
    status: params.status || "pending",
  })
}
