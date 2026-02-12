import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IPaymentsRepository, CreatePaymentPayload, ListPaymentsParams } from "../../interfaces/payments.interface"
import type { PaymentRecord } from "@/types/payment"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToPayment(row: any): PaymentRecord {
  return {
    id: row.id,
    invoice_id: row.invoice_id,
    patient_id: row.patient_id,
    amount: row.amount,
    method: row.method,
    reference: row.reference,
    created_at: row.created_at,
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
    const { data, error } = await supabase
      .from("payments")
      .insert({
        invoice_id: payload.invoice_id,
        patient_id: payload.patient_id,
        amount: payload.amount,
        method: payload.method,
        reference: payload.reference,
      })
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
