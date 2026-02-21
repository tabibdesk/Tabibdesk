import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
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

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdByUserId: row.created_by_user_id,
    assignedToUserId: row.assigned_to_user_id,
    assignedToPatientId: row.assigned_to_patient_id,
    patientId: row.patient_id,
    clinicId: row.clinic_id,
    source: row.source,
    sourceId: row.source_id,
    sourcePayload: row.source_payload,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    follow_up_kind: row.follow_up_kind,
    attempt: row.attempt,
    is_system_generated: row.is_system_generated,
    snoozed_until: row.snoozed_until,
  }
}

function mapRowToTaskListItem(row: any): TaskListItem {
  const assignedToName =
    row.assigned_to_user?.first_name && row.assigned_to_user?.last_name
      ? `${row.assigned_to_user.first_name} ${row.assigned_to_user.last_name}`
      : row.assigned_to_patient?.first_name && row.assigned_to_patient?.last_name
        ? `${row.assigned_to_patient.first_name} ${row.assigned_to_patient.last_name}`
        : undefined
  return {
    ...mapRowToTask(row),
    patientName: row.patient?.first_name && row.patient?.last_name
      ? `${row.patient.first_name} ${row.patient.last_name}`
      : undefined,
    patientPhone: row.patient?.phone,
    assignedToName,
    createdByName: row.created_by_user?.first_name && row.created_by_user?.last_name
      ? `${row.created_by_user.first_name} ${row.created_by_user.last_name}`
      : undefined,
  }
}

export class SupabaseTasksRepository implements ITasksRepository {
  async list(params: ListTasksParams): Promise<ListTasksResponse> {
    let query = supabase
      .from("tasks")
      .select(
        `*,
        patient:patients!patient_id(id, first_name, last_name, phone),
        assigned_to_user:clinic_members!assigned_to_user_id(id, first_name, last_name),
        assigned_to_patient:patients!assigned_to_patient_id(id, first_name, last_name),
        created_by_user:clinic_members!created_by_user_id(id, first_name, last_name)`,
      )
      .eq("clinic_id", params.clinicId)

    if (params.assignedToUserId) {
      query = query.eq("assigned_to_user_id", params.assignedToUserId)
    }
    if (params.createdByUserId) {
      query = query.eq("created_by_user_id", params.createdByUserId)
    }
    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status)
    }
    if (params.type && params.type !== "all") {
      query = query.eq("type", params.type)
    }
    if (params.priority && params.priority !== "all") {
      query = query.eq("priority", params.priority)
    }
    if (params.source && params.source !== "all") {
      query = query.eq("source", params.source)
    }
    if (params.query) {
      query = query.or(
        `title.ilike.%${params.query}%,description.ilike.%${params.query}%`,
      )
    }

    query = query.order("due_date", { ascending: true })

    const { data: allData, error: countError } = await query

    if (countError) throw new Error(`Failed to fetch tasks: ${countError.message}`)

    const total = allData?.length || 0
    const start = (params.page - 1) * params.pageSize
    const end = start + params.pageSize
    const tasks = (allData || []).slice(start, end).map(mapRowToTaskListItem)

    return {
      tasks,
      total,
      page: params.page,
      pageSize: params.pageSize,
      hasMore: end < total,
    }
  }

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single()

    if (error && error.code !== "PGRST116") throw new Error(`Failed to fetch task: ${error.message}`)
    return data ? mapRowToTask(data) : null
  }

  async create(payload: CreateTaskPayload): Promise<Task> {
    const insertPayload = {
      title: payload.title,
      description: payload.description,
      type: payload.type,
      priority: payload.priority || "normal",
      due_date: payload.dueDate,
      assigned_to_user_id: payload.assignedToUserId ?? null,
      assigned_to_patient_id: payload.assignedToPatientId ?? null,
      patient_id: payload.patientId,
      clinic_id: payload.clinicId,
      created_by_user_id: payload.createdByUserId,
      source: "manual",
    }
    const { data, error } = await (supabase as any)
      .from("tasks")
      .insert(insertPayload)
      .select()
      .single()

    if (error) throw new Error(`Failed to create task: ${error.message}`)
    return mapRowToTask(data)
  }

  async updateStatus(payload: UpdateTaskStatusPayload): Promise<Task> {
    const { data, error } = await (supabase as any)
      .from("tasks")
      .update({ status: payload.status })
      .eq("id", payload.id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update task: ${error.message}`)
    return mapRowToTask(data)
  }

  async assign(payload: AssignTaskPayload): Promise<Task> {
    const updatePayload: Record<string, unknown> = {
      assigned_to_user_id: payload.assignedToUserId ?? null,
      assigned_to_patient_id: payload.assignedToPatientId ?? null,
    }
    const { data, error } = await (supabase as any)
      .from("tasks")
      .update(updatePayload)
      .eq("id", payload.id)
      .select()
      .single()

    if (error) throw new Error(`Failed to assign task: ${error.message}`)
    return mapRowToTask(data)
  }

  async snooze(id: string, until: string): Promise<Task> {
    const { data, error } = await (supabase as any)
      .from("tasks")
      .update({ snoozed_until: until })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to snooze task: ${error.message}`)
    return mapRowToTask(data)
  }

  async markDone(id: string): Promise<Task> {
    const { data, error } = await (supabase as any)
      .from("tasks")
      .update({ status: "done" })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to mark task done: ${error.message}`)
    return mapRowToTask(data)
  }

  async cancel(id: string): Promise<Task> {
    const { data, error } = await (supabase as any)
      .from("tasks")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to cancel task: ${error.message}`)
    return mapRowToTask(data)
  }
}
