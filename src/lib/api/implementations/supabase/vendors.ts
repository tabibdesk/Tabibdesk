import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IVendorsRepository, CreateVendorPayload } from "../../interfaces/vendors.interface"
import type { Vendor } from "@/types/vendor"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToVendor(row: Record<string, unknown>): Vendor {
  return {
    id: String(row.id),
    clinicId: String(row.clinic_id),
    name: String(row.name),
    normalizedName: String(row.name).toLowerCase().trim(),
    phone: row.phone != null ? String(row.phone) : undefined,
    createdAt: String(row.created_at),
  }
}

export class SupabaseVendorsRepository implements IVendorsRepository {
  async list(clinicId: string): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("name")

    if (error) throw new Error(`Failed to list vendors: ${error.message}`)
    return (data || []).map(mapRowToVendor)
  }

  async getById(id: string): Promise<Vendor | null> {
    const { data, error } = await supabase.from("vendors").select("*").eq("id", id).single()

    if (error && error.code !== "PGRST116") throw error
    return data ? mapRowToVendor(data) : null
  }

  async create(payload: CreateVendorPayload): Promise<Vendor> {
    const insertPayload = {
      clinic_id: payload.clinic_id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      category: payload.category,
    }
    const { data, error } = await (supabase as any)
      .from("vendors")
      .insert(insertPayload)
      .select()
      .single()

    if (error) throw new Error(`Failed to create vendor: ${error.message}`)
    return mapRowToVendor(data)
  }

  async update(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    const { data, error } = await (supabase as any).from("vendors").update(updates).eq("id", id).select().single()

    if (error) throw new Error(`Failed to update vendor: ${error.message}`)
    return mapRowToVendor(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("vendors").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete vendor: ${error.message}`)
  }
}
