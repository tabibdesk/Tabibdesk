import { mockUsers, getMockUsersByRole } from "@/data/mock/users-clinics"
import { mockData } from "@/data/mock/mock-data"
import type { ITasksRepository } from "../../interfaces/tasks.interface"
import type {
  Task,
  TaskListItem,
  CreateTaskPayload,
  UpdateTaskStatusPayload,
  AssignTaskPayload,
  ListTasksParams,
  ListTasksResponse,
} from "@/features/tasks/tasks.types"

let tasksStore: Task[] = []
let initialized = false

function initStore() {
  if (initialized) return
  initialized = true

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
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
      updatedAt: now.toISOString(),
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
      status: "done",
      priority: "normal",
      dueDate: nextWeek.toISOString(),
      createdAt: yesterday.toISOString(),
      updatedAt: now.toISOString(),
      createdByUserId: "user-001",
      assignedToUserId: "user-001",
      patientId: mockData.patients[1]?.id,
      clinicId: "clinic-001",
      source: "manual",
    },
  ]

  tasksStore = [...manualTasks]
}

function enrichTaskWithNames(task: Task): TaskListItem {
  const patient = task.patientId ? mockData.patients.find((p) => p.id === task.patientId) : undefined
  const assignedToUser = task.assignedToUserId ? mockUsers.find((u) => u.id === task.assignedToUserId) : undefined
  const assignedToPatient = task.assignedToPatientId ? mockData.patients.find((p) => p.id === task.assignedToPatientId) : undefined
  const assignedToName = assignedToUser
    ? `${assignedToUser.first_name} ${assignedToUser.last_name}`
    : assignedToPatient
      ? `${assignedToPatient.first_name} ${assignedToPatient.last_name}`
      : undefined
  const createdBy = mockUsers.find((u) => u.id === task.createdByUserId)

  return {
    ...task,
    patientName: patient ? `${patient.first_name} ${patient.last_name}` : undefined,
    patientPhone: patient?.phone,
    assignedToName,
    createdByName: createdBy ? `${createdBy.first_name} ${createdBy.last_name}` : undefined,
  }
}

function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockTasksRepository implements ITasksRepository {
  async list(params: ListTasksParams): Promise<ListTasksResponse> {
    initStore()

    let filtered = tasksStore.filter((t) => t.clinicId === params.clinicId)

    if (params.assignedToUserId) {
      filtered = filtered.filter((t) => t.assignedToUserId === params.assignedToUserId)
    }
    if (params.createdByUserId) {
      filtered = filtered.filter((t) => t.createdByUserId === params.createdByUserId)
    }
    if (params.status && params.status !== "all") {
      filtered = filtered.filter((t) => t.status === params.status)
    }
    if (params.type && params.type !== "all") {
      filtered = filtered.filter((t) => t.type === params.type)
    }
    if (params.priority && params.priority !== "all") {
      filtered = filtered.filter((t) => t.priority === params.priority)
    }
    if (params.source && params.source !== "all") {
      filtered = filtered.filter((t) => t.source === params.source)
    }
    if (params.query) {
      const q = params.query.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          enrichTaskWithNames(t).patientName?.toLowerCase().includes(q),
      )
    }

    const total = filtered.length
    const start = (params.page - 1) * params.pageSize
    const end = start + params.pageSize
    const tasks = filtered.slice(start, end).map(enrichTaskWithNames)

    return {
      tasks,
      total,
      page: params.page,
      pageSize: params.pageSize,
      hasMore: end < total,
    }
  }

  async getById(id: string): Promise<Task | null> {
    initStore()
    return tasksStore.find((t) => t.id === id) || null
  }

  async create(payload: CreateTaskPayload): Promise<Task> {
    initStore()
    const now = new Date().toISOString()

    const task: Task = {
      id: generateId(),
      ...payload,
      assignedToUserId: payload.assignedToUserId,
      assignedToPatientId: payload.assignedToPatientId,
      priority: payload.priority ?? "normal",
      createdAt: now,
      updatedAt: now,
      status: "pending",
      source: "manual",
    }

    tasksStore.push(task)
    return task
  }

  async updateStatus(payload: UpdateTaskStatusPayload): Promise<Task> {
    initStore()
    const idx = tasksStore.findIndex((t) => t.id === payload.id)
    if (idx === -1) throw new Error("Task not found")

    const updated = { ...tasksStore[idx], status: payload.status }
    if (payload.status === "done" || payload.status === "cancelled") {
      updated.updatedAt = new Date().toISOString()
    }
    tasksStore[idx] = updated
    return tasksStore[idx]
  }

  async assign(payload: AssignTaskPayload): Promise<Task> {
    initStore()
    const idx = tasksStore.findIndex((t) => t.id === payload.id)
    if (idx === -1) throw new Error("Task not found")

    tasksStore[idx] = {
      ...tasksStore[idx],
      assignedToUserId: payload.assignedToUserId,
      assignedToPatientId: payload.assignedToPatientId,
    }
    return tasksStore[idx]
  }

  async snooze(id: string, until: string): Promise<Task> {
    initStore()
    const idx = tasksStore.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error("Task not found")

    tasksStore[idx] = { ...tasksStore[idx], snoozed_until: until }
    return tasksStore[idx]
  }

  async markDone(id: string): Promise<Task> {
    initStore()
    const idx = tasksStore.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error("Task not found")

    tasksStore[idx] = { ...tasksStore[idx], status: "done" }
    return tasksStore[idx]
  }

  async cancel(id: string): Promise<Task> {
    initStore()
    const idx = tasksStore.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error("Task not found")

    tasksStore[idx] = { ...tasksStore[idx], status: "cancelled" }
    return tasksStore[idx]
  }
}
