import type { PaymentRecord } from "@/types/payment"

export interface CreatePaymentPayload {
  invoice_id: string
  patient_id: string
  amount: number
  method: "cash" | "card" | "transfer" | "check"
  reference?: string
}

export interface ListPaymentsParams {
  clinic_id: string
  from?: string
  to?: string
}

export interface IPaymentsRepository {
  list(params: ListPaymentsParams): Promise<PaymentRecord[]>
  create(payload: CreatePaymentPayload): Promise<PaymentRecord>
  getByInvoiceId(invoiceId: string): Promise<PaymentRecord[]>
  getByPatientId(patientId: string): Promise<PaymentRecord[]>
}
