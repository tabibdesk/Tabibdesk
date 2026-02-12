import { mockData } from "@/data/mock/mock-data"
import type { ISettingsRepository } from "../../interfaces/settings.interface"
import type { ClinicSettings } from "@/features/settings/settings.types"

let settingsStore = new Map<string, ClinicSettings>()

export class MockSettingsRepository implements ISettingsRepository {
  async getByClinicId(clinicId: string): Promise<ClinicSettings | null> {
    if (!settingsStore.has(clinicId)) {
      const defaultSettings: ClinicSettings = {
        clinic_id: clinicId,
        clinic_name: mockData.clinics.find((c) => c.id === clinicId)?.name || "Clinic",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      settingsStore.set(clinicId, defaultSettings)
    }
    return settingsStore.get(clinicId) || null
  }

  async update(clinicId: string, updates: Partial<ClinicSettings>): Promise<ClinicSettings> {
    const current = await this.getByClinicId(clinicId)
    if (!current) throw new Error("Settings not found")

    const updated: ClinicSettings = {
      ...current,
      ...updates,
      clinic_id: clinicId,
      updated_at: new Date().toISOString(),
    }
    settingsStore.set(clinicId, updated)
    return updated
  }
}
