import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IProgressRepository, CreateProgressPayload } from "../../interfaces/progress.interface"
import type { Progress } from "@/types/progress"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToProgress(row: any): Progress {
  return {
    id: row.id,
    patient_id: row.patient_id,
    metric: row.metric,
    value: row.value,
    unit: row.unit,
    notes: row.notes,
    created_at: row.created_at,
  }
}

export class SupabaseProgressRepository implements IProgressRepository {
  async list(patientId: string): Promise<Progress[]> {
    const { data, error } = await supabase
      .from("progress")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to list progress: ${error.message}`)
    return (data || []).map(mapRowToProgress)
  }

  async create(payload: CreateProgressPayload): Promise<Progress> {
    const insertPayload = {
      patient_id: payload.patient_id,
      metric: payload.metric,
      value: payload.value,
      unit: payload.unit,
      notes: payload.notes,
    }
    const { data, error } = await (supabase as any)
      .from("progress")
      .insert(insertPayload)
      .select()
      .single()

    if (error) throw new Error(`Failed to create progress: ${error.message}`)
    return mapRowToProgress(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("progress").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete progress: ${error.message}`)
  }
}
