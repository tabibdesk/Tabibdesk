/**
 * Tasks API - thin wrapper around tasks repository.
 * All data access goes through getTasksRepository() - one place decides mock vs Supabase.
 */

import { getTasksRepository } from "@/lib/api/repository-factory"
import type {
  Task,
  CreateTaskPayload,
  UpdateTaskStatusPayload,
  AssignTaskPayload,
  ListTasksParams,
  ListTasksResponse,
} from "./tasks.types"

export async function list(params: ListTasksParams): Promise<ListTasksResponse> {
  const repo = await getTasksRepository()
  return repo.list(params)
}

export async function getById(id: string): Promise<Task | null> {
  const repo = await getTasksRepository()
  return repo.getById(id)
}

export async function create(payload: CreateTaskPayload): Promise<Task> {
  const repo = await getTasksRepository()
  return repo.create(payload)
}

export async function updateStatus(payload: UpdateTaskStatusPayload): Promise<Task> {
  const repo = await getTasksRepository()
  return repo.updateStatus(payload)
}

export async function assign(payload: AssignTaskPayload): Promise<Task> {
  const repo = await getTasksRepository()
  return repo.assign(payload)
}

export async function snooze(id: string, until: string): Promise<Task> {
  const repo = await getTasksRepository()
  return repo.snooze(id, until)
}

export async function markDone(id: string): Promise<Task> {
  const repo = await getTasksRepository()
  return repo.markDone(id)
}

export async function cancel(id: string): Promise<Task> {
  const repo = await getTasksRepository()
  return repo.cancel(id)
}
