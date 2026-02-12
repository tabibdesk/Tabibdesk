import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IInvoicesRepository, CreateInvoicePayload, ListInvoicesParams, ListInvoicesResponse } from "../../interfaces/invoices.interface"
import type { Invoice, InvoiceStatus } from "@/types/invoice"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToInvoice(row: any): Invoice {
  return {
    id: row.id,
    clinicId: row.clinic_id,
    doctorId: row.doctor_id,
    patientId: row.patient_id,
    appointmentId: row.appointment_id,
    appointmentType: row.appointment_type,
    amount: row.amount,
    status: row.status,
    createdAt: row.created_at,
    lineItems: row.line_items,
  }
}

export class SupabaseInvoicesRepository implements IInvoicesRepository {
  async list(params: ListInvoicesParams): Promise<ListInvoicesResponse> {
    let query = supabase
      .from("invoices")
      .select("*", { count: "exact" })
      .eq("clinic_id", params.clinicId)

    if (params.status) {
      query = query.eq("status", params.status)
    }

    if (params.from) {
      query = query.gte("created_at", params.from)
    }

    if (params.to) {
      query = query.lte("created_at", params.to)
    }

    const { data, count, error } = await query.order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to list invoices: ${error.message}`)

    return {
      data: (data || []).map(mapRowToInvoice),
      total: count || 0,
    }
  }

  async getById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase.from("invoices").select("*").eq("id", id).single()

    if (error && error.code !== "PGRST116") throw error
    return data ? mapRowToInvoice(data) : null
  }

  async getByAppointmentId(appointmentId: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("appointment_id", appointmentId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data ? mapRowToInvoice(data) : null
  }

  async create(payload: CreateInvoicePayload): Promise<Invoice> {
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        clinic_id: payload.clinic_id,
        doctor_id: payload.doctor_id,
        patient_id: payload.patient_id,
        appointment_id: payload.appointment_id,
        appointment_type: payload.appointment_type,
        amount: payload.amount,
        line_items: payload.line_items,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create invoice: ${error.message}`)
    return mapRowToInvoice(data)
  }

  async updateLineItems(id: string, lineItems: any[]): Promise<Invoice> {
    const amount = lineItems.reduce((sum, item) => sum + item.amount, 0)

    const { data, error } = await supabase
      .from("invoices")
      .update({ line_items: lineItems, amount })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update invoice: ${error.message}`)
    return mapRowToInvoice(data)
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const { data, error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update invoice status: ${error.message}`)
    return mapRowToInvoice(data)
  }

  async markUnpaid(id: string): Promise<Invoice> {
    return this.updateStatus(id, "unpaid")
  }
}
