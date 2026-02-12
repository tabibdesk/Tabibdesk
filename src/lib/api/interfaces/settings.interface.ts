import type { ClinicSettings } from "@/features/settings/settings.types"

export interface ISettingsRepository {
  getByClinicId(clinicId: string): Promise<ClinicSettings | null>
  update(clinicId: string, settings: Partial<ClinicSettings>): Promise<ClinicSettings>
}
