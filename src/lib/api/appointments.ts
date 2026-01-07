// Appointment API functions
// To use: Install Supabase first (npm install @supabase/ssr @supabase/supabase-js)

import type { Database } from "@/lib/supabase/types"

type Appointment = Database["public"]["Tables"]["appointments"]["Row"]
type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"]
type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"]

// Placeholder implementations until Supabase is set up
// Uncomment and replace with real Supabase calls once configured

export async function getAppointments(_clinicId: string, _filters?: { status?: string; date?: string }): Promise<any[]> {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

export async function getAppointment(_id: string, _clinicId: string): Promise<any> {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

export async function createAppointment(_appointment: AppointmentInsert): Promise<Appointment> {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

export async function updateAppointment(_id: string, _clinicId: string, _updates: AppointmentUpdate): Promise<Appointment> {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

export async function deleteAppointment(_id: string, _clinicId: string): Promise<void> {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

/*
// Real implementation (uncomment when Supabase is configured):

import { createClient } from "@/lib/supabase/client"

export async function getAppointments(clinicId: string, filters?: { status?: string; date?: string }) {
  const supabase = createClient()
  let query = supabase
    .from("appointments")
    .select("*, patients(*)")
    .eq("clinic_id", clinicId)
    .is("deleted_at", null)

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.date) {
    const startOfDay = new Date(filters.date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(filters.date)
    endOfDay.setHours(23, 59, 59, 999)

    query = query
      .gte("scheduled_at", startOfDay.toISOString())
      .lte("scheduled_at", endOfDay.toISOString())
  }

  query = query.order("scheduled_at", { ascending: true })

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getAppointment(id: string, clinicId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patients(*)")
    .eq("id", id)
    .eq("clinic_id", clinicId)
    .is("deleted_at", null)
    .single()

  if (error) throw error
  return data
}

export async function createAppointment(appointment: AppointmentInsert) {
  const supabase = createClient()
  const { data, error } = await supabase.from("appointments").insert(appointment).select().single()

  if (error) throw error
  return data as Appointment
}

export async function updateAppointment(id: string, clinicId: string, updates: AppointmentUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("appointments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("clinic_id", clinicId)
    .select()
    .single()

  if (error) throw error
  return data as Appointment
}

export async function deleteAppointment(id: string, clinicId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("appointments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("clinic_id", clinicId)

  if (error) throw error
}
*/
