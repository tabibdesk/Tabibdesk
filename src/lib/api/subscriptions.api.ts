/**
 * Subscriptions and clinic members API - Supabase implementation.
 * Use for getClinicsForUser, getSubscriptionById, etc. when backend is Supabase.
 */

import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type ClinicRow = Database["public"]["Tables"]["clinics"]["Row"]
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"]
type ClinicMemberRow = Database["public"]["Tables"]["clinic_members"]["Row"]

export interface ClinicForUser {
  id: string
  subscription_id: string
  name: string
  location: string
  address: string | null
  phone: string | null
}

function mapClinicRowToClinic(row: ClinicRow): ClinicForUser {
  return {
    id: row.id,
    subscription_id: row.subscription_id,
    name: row.name,
    location: row.name,
    address: row.address,
    phone: row.phone,
  }
}

/**
 * Get clinics the user is a member of (via clinic_members).
 * Used to enforce "user can only see these clinics".
 */
export async function getClinicsForUser(userId: string): Promise<ClinicForUser[]> {
  const supabase = createClient()
  const { data: members, error: membersError } = await supabase
    .from("clinic_members")
    .select("clinic_id")
    .eq("user_id", userId)

  if (membersError) throw membersError
  const clinicIds = (members ?? []).map((m) => m.clinic_id)
  if (clinicIds.length === 0) return []

  const { data: clinics, error: clinicsError } = await supabase
    .from("clinics")
    .select("*")
    .in("id", clinicIds)
    .is("deleted_at", null)

  if (clinicsError) throw clinicsError
  return (clinics ?? []).map(mapClinicRowToClinic)
}

/**
 * Get subscription by ID.
 */
export async function getSubscriptionById(
  subscriptionId: string
): Promise<SubscriptionRow | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .single()
  if (error && error.code !== "PGRST116") throw error
  return data
}

/**
 * Get clinic members by user ID.
 */
export async function getClinicMembersByUserId(
  userId: string
): Promise<ClinicMemberRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("clinic_members")
    .select("*")
    .eq("user_id", userId)
  if (error) throw error
  return data ?? []
}

/**
 * Get clinic members by clinic ID (e.g. for listDoctorsByClinic).
 */
export async function getClinicMembersByClinicId(
  clinicId: string
): Promise<ClinicMemberRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("clinic_members")
    .select("*")
    .eq("clinic_id", clinicId)
  if (error) throw error
  return data ?? []
}

/**
 * Get subscription for a clinic (for plan tier).
 */
export async function getSubscriptionForClinic(
  clinicId: string
): Promise<SubscriptionRow | null> {
  const supabase = createClient()
  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("subscription_id")
    .eq("id", clinicId)
    .single()
  if (clinicError || !clinic?.subscription_id) return null
  return getSubscriptionById(clinic.subscription_id)
}
