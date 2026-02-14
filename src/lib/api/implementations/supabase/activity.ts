import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IActivityRepository, CreateActivityPayload } from "../../interfaces/activity.interface"
import type { ActivityEvent } from "@/types/activity"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToActivity(row: Record<string, unknown>): ActivityEvent {
  return {
    id: String(row.id),
    clinicId: String(row.clinic_id),
    actorUserId: String(row.user_id),
    actorName: "User",
    action: String(row.action) as ActivityEvent["action"],
    entityType: String(row.resource_type) as ActivityEvent["entityType"],
    entityId: String(row.resource_id),
    message: String(row.action),
    createdAt: String(row.created_at),
    meta: row.metadata as Record<string, unknown> | undefined,
  }
}

export class SupabaseActivityRepository implements IActivityRepository {
  async list(clinicId: string, limit: number = 50): Promise<ActivityEvent[]> {
    const { data, error } = await supabase
      .from("activity")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to list activities: ${error.message}`)
    return (data || []).map(mapRowToActivity)
  }

  async create(payload: CreateActivityPayload): Promise<ActivityEvent> {
    const insertPayload = {
      clinic_id: payload.clinic_id,
      user_id: payload.user_id,
      action: payload.action,
      resource_type: payload.resource_type,
      resource_id: payload.resource_id,
      metadata: payload.metadata,
    }
    const { data, error } = await (supabase as any)
      .from("activity")
      .insert(insertPayload)
      .select()
      .single()

    if (error) throw new Error(`Failed to create activity: ${error.message}`)
    return mapRowToActivity(data)
  }

  async getByResource(resourceType: string, resourceId: string): Promise<ActivityEvent[]> {
    const { data, error } = await supabase
      .from("activity")
      .select("*")
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId)

    if (error) throw new Error(`Failed to fetch activities: ${error.message}`)
    return (data || []).map(mapRowToActivity)
  }
}
