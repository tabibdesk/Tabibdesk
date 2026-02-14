import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IPricingRepository } from "../../interfaces/pricing.interface"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const DEFAULT_PRICES: Record<string, number> = {
  consultation: 300,
  checkup: 200,
  followup: 150,
  procedure: 500,
}

export class SupabasePricingRepository implements IPricingRepository {
  async getPriceForAppointmentType(clinicId: string, doctorId: string, appointmentType: string): Promise<number | null> {
    const { data, error } = await supabase
      .from("pricing")
      .select("price")
      .eq("clinic_id", clinicId)
      .eq("doctor_id", doctorId)
      .eq("appointment_type", appointmentType)
      .single()

    if (error && error.code !== "PGRST116") throw error
    if (data) return (data as { price: number }).price

    return DEFAULT_PRICES[appointmentType] || 300
  }

  async setPriceForAppointmentType(
    clinicId: string,
    doctorId: string,
    appointmentType: string,
    price: number,
  ): Promise<void> {
    const { error } = await (supabase as any)
      .from("pricing")
      .upsert({
        clinic_id: clinicId,
        doctor_id: doctorId,
        appointment_type: appointmentType,
        price,
      })

    if (error) throw new Error(`Failed to set price: ${error.message}`)
  }
}
