// Patient API functions
// To use: Install Supabase first (npm install @supabase/ssr @supabase/supabase-js)

import type { Database } from "@/lib/supabase/types"

type Patient = Database["public"]["Tables"]["patients"]["Row"]
type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"]
type PatientUpdate = Database["public"]["Tables"]["patients"]["Update"]

// Placeholder implementations until Supabase is set up
// Uncomment and replace with real Supabase calls once configured

export async function getPatients(_clinicId: string): Promise<Patient[]> {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

export async function getPatient(_id: string, _clinicId: string): Promise<Patient> {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

export async function createPatient(_patient: PatientInsert): Promise<Patient> {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

export async function updatePatient(_id: string, _clinicId: string, _updates: PatientUpdate): Promise<Patient> {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

export async function deletePatient(_id: string, _clinicId: string): Promise<void> {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

export async function searchPatients(_clinicId: string, _query: string): Promise<Patient[]> {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

/*
// Real implementation (uncomment when Supabase is configured):

import { createClient } from "@/lib/supabase/client"

export async function getPatients(clinicId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("clinic_id", clinicId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Patient[]
}

export async function getPatient(id: string, clinicId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .eq("clinic_id", clinicId)
    .is("deleted_at", null)
    .single()

  if (error) throw error
  return data as Patient
}

export async function createPatient(patient: PatientInsert) {
  const supabase = createClient()
  const { data, error } = await supabase.from("patients").insert(patient).select().single()

  if (error) throw error
  return data as Patient
}

export async function updatePatient(id: string, clinicId: string, updates: PatientUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("patients")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("clinic_id", clinicId)
    .select()
    .single()

  if (error) throw error
  return data as Patient
}

export async function deletePatient(id: string, clinicId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("patients")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("clinic_id", clinicId)

  if (error) throw error
}

export async function searchPatients(clinicId: string, query: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("clinic_id", clinicId)
    .is("deleted_at", null)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Patient[]
}
*/
