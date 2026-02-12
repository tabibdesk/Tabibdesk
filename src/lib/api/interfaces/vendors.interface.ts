import type { Vendor } from "@/types/vendor"

export interface CreateVendorPayload {
  clinic_id: string
  name: string
  email?: string
  phone?: string
  address?: string
  category?: string
}

export interface IVendorsRepository {
  list(clinicId: string): Promise<Vendor[]>
  getById(id: string): Promise<Vendor | null>
  create(payload: CreateVendorPayload): Promise<Vendor>
  update(id: string, updates: Partial<Vendor>): Promise<Vendor>
  delete(id: string): Promise<void>
}
