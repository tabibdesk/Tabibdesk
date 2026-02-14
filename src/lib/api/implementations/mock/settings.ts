import type { ISettingsRepository } from "../../interfaces/settings.interface"
import type { ClinicSettings } from "@/features/settings/settings.types"

let settingsStore = new Map<string, ClinicSettings>()

export class MockSettingsRepository implements ISettingsRepository {
  async getByClinicId(clinicId: string): Promise<ClinicSettings | null> {
    if (!settingsStore.has(clinicId)) {
      const defaultSettings: ClinicSettings = {
        clinicId,
        name: "Clinic",
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
      clinicId,
    }
    settingsStore.set(clinicId, updated)
    return updated
  }
}
