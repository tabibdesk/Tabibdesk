import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IPaymentsRepository, CreatePaymentPayload, ListPaymentsParams } from "../../interfaces/payments.interface"
import type { PaymentRecord } from "@/types/payment"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToPayment(row: Record<string, unknown>): PaymentRecord {
  return {
    id: String(row.id),
    clinicId: String(row.clinic_id ?? ""),
    invoiceId: String(row.invoice_id),
    patientId: String(row.patient_id),
    appointmentId: String(row.appointment_id ?? ""),
    amount: Number(row.amount),
    method: String(row.method) as PaymentRecord["method"],
    createdByUserId: String(row.created_by_user_id ?? ""),
    createdAt: String(row.created_at),
  }
}

export class SupabasePaymentsRepository implements IPaymentsRepository {
  async list(params: ListPaymentsParams): Promise<PaymentRecord[]> {
    let query = supabase.from("payments").select("*")

    if (params.from) {
      query = query.gte("created_at", params.from)
    }

    if (params.to) {
      query = query.lte("created_at", params.to)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to list payments: ${error.message}`)
    return (data || []).map(mapRowToPayment)
  }

  async create(payload: CreatePaymentPayload): Promise<PaymentRecord> {
    const insertPayload = {
      invoice_id: payload.invoice_id,
      patient_id: payload.patient_id,
      amount: payload.amount,
      method: payload.method,
      reference: payload.reference,
    }
    const { data, error } = await (supabase as any)
      .from("payments")
      .insert(insertPayload)
      .select()
      .single()

    if (error) throw new Error(`Failed to create payment: ${error.message}`)
    return mapRowToPayment(data)
  }

  async getByInvoiceId(invoiceId: string): Promise<PaymentRecord[]> {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("invoice_id", invoiceId)

    if (error) throw new Error(`Failed to fetch payments: ${error.message}`)
    return (data || []).map(mapRowToPayment)
  }

  async getByPatientId(patientId: string): Promise<PaymentRecord[]> {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("patient_id", patientId)

    if (error) throw new Error(`Failed to fetch payments: ${error.message}`)
    return (data || []).map(mapRowToPayment)
  }
}
