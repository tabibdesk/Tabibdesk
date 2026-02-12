import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { ISettingsRepository } from "../../interfaces/settings.interface"
import type { ClinicSettings } from "@/features/settings/settings.types"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToSettings(row: any): ClinicSettings {
  return {
    clinic_id: row.clinic_id,
    clinic_name: row.clinic_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    zip_code: row.zip_code,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export class SupabaseSettingsRepository implements ISettingsRepository {
  async getByClinicId(clinicId: string): Promise<ClinicSettings | null> {
    const { data, error } = await supabase
      .from("clinic_settings")
      .select("*")
      .eq("clinic_id", clinicId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data ? mapRowToSettings(data) : null
  }

  async update(clinicId: string, updates: Partial<ClinicSettings>): Promise<ClinicSettings> {
    const { data, error } = await supabase
      .from("clinic_settings")
      .update(updates)
      .eq("clinic_id", clinicId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update settings: ${error.message}`)
    return mapRowToSettings(data)
  }
}
