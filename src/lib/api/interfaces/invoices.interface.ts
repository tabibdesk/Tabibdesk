import type { Invoice, InvoiceStatus, ChargeLineItem } from "@/types/invoice"

export interface ListInvoicesParams {
  clinicId: string
  status?: InvoiceStatus
  from?: string
  to?: string
  query?: string
}

export interface ListInvoicesResponse {
  data: Invoice[]
  total: number
}

export interface CreateInvoicePayload {
  clinic_id: string
  doctor_id: string
  patient_id: string
  appointment_id: string
  appointment_type: string
  amount: number
  line_items?: ChargeLineItem[]
}

export interface IInvoicesRepository {
  list(params: ListInvoicesParams): Promise<ListInvoicesResponse>
  getById(id: string): Promise<Invoice | null>
  getByAppointmentId(appointmentId: string): Promise<Invoice | null>
  create(payload: CreateInvoicePayload): Promise<Invoice>
  updateLineItems(id: string, lineItems: ChargeLineItem[]): Promise<Invoice>
  updateStatus(id: string, status: InvoiceStatus): Promise<Invoice>
  markUnpaid(id: string): Promise<Invoice>
}
