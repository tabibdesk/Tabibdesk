import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IAvailabilityRepository } from "../../interfaces/availability.interface"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export class SupabaseAvailabilityRepository implements IAvailabilityRepository {
  async getByDoctorId(doctorId: string, date: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("date", date)

    if (error) throw new Error(`Failed to fetch availability: ${error.message}`)
    return data || []
  }

  async create(doctorId: string, date: string, slots: any[]): Promise<any> {
    const { data, error } = await (supabase as any)
      .from("availability_slots")
      .insert(slots.map((slot) => ({ doctor_id: doctorId, date, ...slot })))
      .select()

    if (error) throw new Error(`Failed to create availability: ${error.message}`)
    return { doctorId, date, slots: data }
  }

  async update(doctorId: string, date: string, slots: any[]): Promise<any> {
    await (supabase as any).from("availability_slots").delete().eq("doctor_id", doctorId).eq("date", date)

    const { data, error } = await (supabase as any)
      .from("availability_slots")
      .insert(slots.map((slot) => ({ doctor_id: doctorId, date, ...slot })))
      .select()

    if (error) throw new Error(`Failed to update availability: ${error.message}`)
    return { doctorId, date, slots: data }
  }
}
