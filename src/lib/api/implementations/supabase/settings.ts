import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { ISettingsRepository } from "../../interfaces/settings.interface"
import type { ClinicSettings } from "@/features/settings/settings.types"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToSettings(row: Record<string, unknown>): ClinicSettings {
  return {
    clinicId: String(row.clinic_id),
    name: String(row.clinic_name ?? row.name ?? "Clinic"),
    address: row.address != null ? String(row.address) : undefined,
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
    const { data, error } = await (supabase as any)
      .from("clinic_settings")
      .update(updates)
      .eq("clinic_id", clinicId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update settings: ${error.message}`)
    return mapRowToSettings(data)
  }
}
