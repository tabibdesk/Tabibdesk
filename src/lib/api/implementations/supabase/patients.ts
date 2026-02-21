/**
 * Supabase patients repository - real implementation.
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */

import { createClient } from "@/lib/supabase/client"
import type {
  IPatientsRepository,
  PatientRow,
  PatientInsert,
  PatientUpdate,
} from "../../interfaces/patients.interface"
import { NotFoundError, translateError } from "../../errors"

function rowToPatientRow(row: Record<string, unknown>): PatientRow {
  const bool = (v: unknown) => (v === true || v === false ? v : null)
  return {
    id: row.id as string,
    clinic_id: row.clinic_id as string,
    first_name: row.first_name as string,
    last_name: row.last_name as string,
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string) ?? "",
    date_of_birth: (row.date_of_birth as string | null) ?? null,
    gender: (row.gender as string) ?? "",
    address: (row.address as string | null) ?? null,
    height: (row.height as number | null) ?? null,
    age: (row.age as number | null) ?? null,
    complaint: (row.complaint as string | null) ?? null,
    job: (row.job as string | null) ?? null,
    social_status: (row.social_status as string | null) ?? undefined,
    source: (row.source as string | null) ?? undefined,
    source_other: undefined,
    doctor_id: (row.doctor_id as string | null) ?? null,
    status: (row.status as PatientRow["status"]) ?? "inactive",
    first_visit_at: (row.first_visit_at as string | null) ?? null,
    last_visit_at: (row.last_visit_at as string | null) ?? null,
    last_activity_at: (row.last_activity_at as string | null) ?? undefined,
    is_cold: (row.is_cold as boolean | null) ?? undefined,
    lead_status: (row.lead_status as PatientRow["lead_status"]) ?? undefined,
    last_interaction_date: (row.last_interaction_date as string | null) ?? undefined,
    lost_reason: (row.lost_reason as string | null) ?? undefined,
    opt_out_reactivation: (row.opt_out_reactivation as boolean | null) ?? undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    // Medical conditions (from Settings > Patient)
    is_diabetic: bool(row.is_diabetic),
    is_hypertensive: bool(row.is_hypertensive),
    has_pancreatitis: bool(row.has_pancreatitis),
    has_gerd: bool(row.has_gerd),
    has_gastritis: bool(row.has_gastritis),
    has_hepatic: bool(row.has_hepatic),
    has_anaemia: bool(row.has_anaemia),
    has_bronchial_asthma: bool(row.has_bronchial_asthma),
    has_rheumatoid: bool(row.has_rheumatoid),
    has_ihd: bool(row.has_ihd),
    has_heart_failure: bool(row.has_heart_failure),
    is_pregnant: bool(row.is_pregnant),
    is_breastfeeding: bool(row.is_breastfeeding),
    glp1a_previous_exposure: bool(row.glp1a_previous_exposure),
  }
}

export class SupabasePatientsRepository implements IPatientsRepository {
  async getPatients(clinicId: string): Promise<PatientRow[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("clinic_id", clinicId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data ?? []).map(rowToPatientRow)
    } catch (error) {
      throw translateError(error)
    }
  }

  async getPatient(id: string, clinicId: string): Promise<PatientRow> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .eq("clinic_id", clinicId)
        .is("deleted_at", null)
        .single()

      if (error) {
        if (error.code === "PGRST116") throw new NotFoundError("Patient", id)
        throw error
      }
      return rowToPatientRow(data as Record<string, unknown>)
    } catch (error) {
      throw translateError(error)
    }
  }

  async getById(patientId: string): Promise<PatientRow | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .is("deleted_at", null)
        .maybeSingle()

      if (error) throw error
      return data ? rowToPatientRow(data as Record<string, unknown>) : null
    } catch (error) {
      throw translateError(error)
    }
  }

  async createPatient(insert: PatientInsert): Promise<PatientRow> {
    try {
      const supabase = createClient()
      const row: Record<string, unknown> = {
        clinic_id: insert.clinic_id,
        first_name: insert.first_name,
        last_name: insert.last_name,
        phone: insert.phone,
        email: insert.email ?? null,
        gender: insert.gender ?? null,
        date_of_birth: insert.date_of_birth ?? null,
        address: insert.address ?? null,
        age: insert.age ?? null,
        height: insert.height ?? null,
        complaint: insert.complaint ?? null,
        job: insert.job ?? null,
        social_status: insert.social_status ?? null,
        source: insert.source ?? null,
        status: insert.status ?? "inactive",
        doctor_id: insert.doctor_id ?? null,
      }

      const { data, error } = await supabase
        .from("patients")
        .insert(row)
        .select()
        .single()

      if (error) throw error
      return rowToPatientRow(data as Record<string, unknown>)
    } catch (error) {
      throw translateError(error)
    }
  }

  async updatePatient(
    id: string,
    clinicId: string,
    updates: PatientUpdate
  ): Promise<PatientRow> {
    try {
      const supabase = createClient()
      const payload: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("patients")
        .update(payload)
        .eq("id", id)
        .eq("clinic_id", clinicId)
        .select()
        .single()

      if (error) {
        if (error.code === "PGRST116") throw new NotFoundError("Patient", id)
        throw error
      }
      return rowToPatientRow(data as Record<string, unknown>)
    } catch (error) {
      throw translateError(error)
    }
  }

  async deletePatient(id: string, clinicId: string): Promise<void> {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("patients")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)
        .eq("clinic_id", clinicId)

      if (error) throw error
    } catch (error) {
      throw translateError(error)
    }
  }

  async searchPatients(clinicId: string, query: string): Promise<PatientRow[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("clinic_id", clinicId)
        .is("deleted_at", null)
        .or(
          `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`
        )
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data ?? []).map((r) => rowToPatientRow(r as Record<string, unknown>))
    } catch (error) {
      throw translateError(error)
    }
  }
}
