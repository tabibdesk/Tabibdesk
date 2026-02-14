import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IPrescriptionsRepository, CreatePrescriptionPayload } from "../../interfaces/prescriptions.interface"
import type { Prescription } from "@/features/prescriptions/prescriptions.types"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToPrescription(row: Record<string, unknown>): Prescription {
  return {
    id: String(row.id),
    clinicId: String(row.clinic_id ?? ""),
    patientId: String(row.patient_id),
    doctorId: row.doctor_id != null ? String(row.doctor_id) : undefined,
    createdAt: String(row.created_at),
    diagnosisText: String(row.diagnosis_text ?? row.medication ?? ""),
    items: Array.isArray(row.items) ? (row.items as any[]) : [{ id: "1", name: String(row.medication ?? ""), sig: String(row.dosage ?? "") }],
  }
}

export class SupabasePrescriptionsRepository implements IPrescriptionsRepository {
  async list(patientId: string): Promise<Prescription[]> {
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to list prescriptions: ${error.message}`)
    return (data || []).map(mapRowToPrescription)
  }

  async getById(id: string): Promise<Prescription | null> {
    const { data, error } = await supabase.from("prescriptions").select("*").eq("id", id).single()

    if (error && error.code !== "PGRST116") throw error
    return data ? mapRowToPrescription(data) : null
  }

  async create(payload: CreatePrescriptionPayload): Promise<Prescription> {
    const insertPayload = {
      patient_id: payload.patient_id,
      doctor_id: payload.doctor_id,
      medication: payload.medication,
      dosage: payload.dosage,
      frequency: payload.frequency,
      duration: payload.duration,
      notes: payload.notes,
    }
    const { data, error } = await (supabase as any)
      .from("prescriptions")
      .insert(insertPayload)
      .select()
      .single()

    if (error) throw new Error(`Failed to create prescription: ${error.message}`)
    return mapRowToPrescription(data)
  }

  async update(id: string, updates: Partial<Prescription>): Promise<Prescription> {
    const { data, error } = await (supabase as any)
      .from("prescriptions")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update prescription: ${error.message}`)
    return mapRowToPrescription(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("prescriptions").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete prescription: ${error.message}`)
  }
}
