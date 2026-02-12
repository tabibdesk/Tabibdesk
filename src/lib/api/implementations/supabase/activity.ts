import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IActivityRepository, CreateActivityPayload } from "../../interfaces/activity.interface"
import type { Activity } from "@/types/activity"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToActivity(row: any): Activity {
  return {
    id: row.id,
    clinic_id: row.clinic_id,
    user_id: row.user_id,
    action: row.action,
    resource_type: row.resource_type,
    resource_id: row.resource_id,
    metadata: row.metadata,
    created_at: row.created_at,
  }
}

export class SupabaseActivityRepository implements IActivityRepository {
  async list(clinicId: string, limit: number = 50): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activity")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to list activities: ${error.message}`)
    return (data || []).map(mapRowToActivity)
  }

  async create(payload: CreateActivityPayload): Promise<Activity> {
    const { data, error } = await supabase
      .from("activity")
      .insert({
        clinic_id: payload.clinic_id,
        user_id: payload.user_id,
        action: payload.action,
        resource_type: payload.resource_type,
        resource_id: payload.resource_id,
        metadata: payload.metadata,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create activity: ${error.message}`)
    return mapRowToActivity(data)
  }

  async getByResource(resourceType: string, resourceId: string): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activity")
      .select("*")
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId)

    if (error) throw new Error(`Failed to fetch activities: ${error.message}`)
    return (data || []).map(mapRowToActivity)
  }
}
