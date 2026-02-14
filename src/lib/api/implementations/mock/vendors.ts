import type { IVendorsRepository, CreateVendorPayload } from "../../interfaces/vendors.interface"
import type { Vendor } from "@/types/vendor"

let vendorsStore: Vendor[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    vendorsStore = []
    initialized = true
  }
}

function generateId(): string {
  return `ven-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockVendorsRepository implements IVendorsRepository {
  async list(clinicId: string): Promise<Vendor[]> {
    initStore()
    return vendorsStore.filter((v) => v.clinicId === clinicId)
  }

  async getById(id: string): Promise<Vendor | null> {
    initStore()
    return vendorsStore.find((v) => v.id === id) || null
  }

  async create(payload: CreateVendorPayload): Promise<Vendor> {
    initStore()
    const now = new Date().toISOString()
    const vendor: Vendor = {
      id: generateId(),
      clinicId: payload.clinic_id,
      name: payload.name,
      normalizedName: payload.name.toLowerCase().trim(),
      phone: payload.phone,
      createdAt: now,
    }
    vendorsStore.push(vendor)
    return vendor
  }

  async update(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    initStore()
    const index = vendorsStore.findIndex((v) => v.id === id)
    if (index === -1) throw new Error("Vendor not found")
    vendorsStore[index] = { ...vendorsStore[index], ...updates }
    return vendorsStore[index]
  }

  async delete(id: string): Promise<void> {
    initStore()
    vendorsStore = vendorsStore.filter((v) => v.id !== id)
  }
}
