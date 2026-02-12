import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IPrescriptionsRepository, CreatePrescriptionPayload } from "../../interfaces/prescriptions.interface"
import type { Prescription } from "@/features/prescriptions/prescriptions.types"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToPrescription(row: any): Prescription {
  return {
    id: row.id,
    patient_id: row.patient_id,
    doctor_id: row.doctor_id,
    medication: row.medication,
    dosage: row.dosage,
    frequency: row.frequency,
    duration: row.duration,
    notes: row.notes,
    created_at: row.created_at,
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
    const { data, error } = await supabase
      .from("prescriptions")
      .insert({
        patient_id: payload.patient_id,
        doctor_id: payload.doctor_id,
        medication: payload.medication,
        dosage: payload.dosage,
        frequency: payload.frequency,
        duration: payload.duration,
        notes: payload.notes,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create prescription: ${error.message}`)
    return mapRowToPrescription(data)
  }

  async update(id: string, updates: Partial<Prescription>): Promise<Prescription> {
    const { data, error } = await supabase
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
