import type {
  Task,
  TaskListItem,
  CreateTaskPayload,
  UpdateTaskStatusPayload,
  AssignTaskPayload,
  ListTasksParams,
  ListTasksResponse,
} from "@/features/tasks/tasks.types"

export interface ITasksRepository {
  list(params: ListTasksParams): Promise<ListTasksResponse>
  getById(id: string): Promise<Task | null>
  create(payload: CreateTaskPayload): Promise<Task>
  updateStatus(payload: UpdateTaskStatusPayload): Promise<Task>
  assign(payload: AssignTaskPayload): Promise<Task>
  snooze(id: string, until: string): Promise<Task>
  markDone(id: string): Promise<Task>
  cancel(id: string): Promise<Task>
}
