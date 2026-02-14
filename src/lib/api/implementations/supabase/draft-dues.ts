import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IDraftDuesRepository, CreateDraftDuePayload } from "../../interfaces/draft-dues.interface"
import type { DraftDue } from "@/types/draft-due"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToDraftDue(row: Record<string, unknown>): DraftDue {
  const now = new Date().toISOString()
  return {
    id: String(row.id),
    clinicId: String(row.clinic_id),
    patientId: String(row.patient_id),
    doctorId: "",
    appointmentId: null,
    status: "draft",
    lineItems: [{ id: "1", type: "consultation", label: "Consultation", amount: Number(row.amount) }],
    total: Number(row.amount),
    createdAt: String(row.created_at ?? now),
    updatedAt: String(row.updated_at ?? now),
  }
}

export class SupabaseDraftDuesRepository implements IDraftDuesRepository {
  async list(clinicId: string): Promise<DraftDue[]> {
    const { data, error } = await supabase
      .from("draft_dues")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to list draft dues: ${error.message}`)
    return (data || []).map(mapRowToDraftDue)
  }

  async create(payload: CreateDraftDuePayload): Promise<DraftDue> {
    const insertPayload = {
      clinic_id: payload.clinic_id,
      patient_id: payload.patient_id,
      amount: payload.amount,
      reason: payload.reason,
      due_date: payload.due_date,
    }
    const { data, error } = await (supabase as any)
      .from("draft_dues")
      .insert(insertPayload)
      .select()
      .single()

    if (error) throw new Error(`Failed to create draft due: ${error.message}`)
    return mapRowToDraftDue(data)
  }

  async update(id: string, updates: Partial<DraftDue>): Promise<DraftDue> {
    const { data, error } = await (supabase as any)
      .from("draft_dues")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update draft due: ${error.message}`)
    return mapRowToDraftDue(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("draft_dues").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete draft due: ${error.message}`)
  }
}
