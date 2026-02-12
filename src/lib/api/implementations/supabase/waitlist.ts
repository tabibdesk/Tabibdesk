import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IWaitlistRepository } from "../../interfaces/waitlist.interface"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export class SupabaseWaitlistRepository implements IWaitlistRepository {
  async list(appointmentTypeId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .eq("appointment_type", appointmentTypeId)
      .eq("status", "pending")

    if (error) throw new Error(`Failed to list waitlist: ${error.message}`)
    return data || []
  }

  async create(patientId: string, appointmentTypeId: string): Promise<any> {
    const { data, error } = await supabase
      .from("waitlist")
      .insert({ patient_id: patientId, appointment_type: appointmentTypeId, status: "pending" })
      .select()
      .single()

    if (error) throw new Error(`Failed to create waitlist entry: ${error.message}`)
    return data
  }

  async approve(id: string): Promise<any> {
    const { data, error } = await supabase
      .from("waitlist")
      .update({ status: "approved" })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to approve: ${error.message}`)
    return data
  }

  async reject(id: string): Promise<any> {
    const { data, error } = await supabase
      .from("waitlist")
      .update({ status: "rejected" })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to reject: ${error.message}`)
    return data
  }
}
