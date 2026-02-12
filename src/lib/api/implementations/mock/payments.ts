import { mockData } from "@/data/mock/mock-data"
import type { IPaymentsRepository, CreatePaymentPayload, ListPaymentsParams } from "../../interfaces/payments.interface"
import type { PaymentRecord } from "@/types/payment"

let paymentsStore: PaymentRecord[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    paymentsStore = mockData.payments.map((p) => ({
      id: p.id,
      invoice_id: p.invoice_id,
      patient_id: p.patient_id,
      amount: p.amount,
      method: p.method,
      reference: p.reference,
      created_at: p.created_at,
    }))
    initialized = true
  }
}

function generateId(): string {
  return `pay-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockPaymentsRepository implements IPaymentsRepository {
  async list(params: ListPaymentsParams): Promise<PaymentRecord[]> {
    initStore()
    let filtered = paymentsStore

    if (params.from) {
      const fromDate = new Date(params.from)
      filtered = filtered.filter((p) => new Date(p.created_at) >= fromDate)
    }

    if (params.to) {
      const toDate = new Date(params.to)
      filtered = filtered.filter((p) => new Date(p.created_at) <= toDate)
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async create(payload: CreatePaymentPayload): Promise<PaymentRecord> {
    initStore()
    const payment: PaymentRecord = {
      id: generateId(),
      invoice_id: payload.invoice_id,
      patient_id: payload.patient_id,
      amount: payload.amount,
      method: payload.method,
      reference: payload.reference,
      created_at: new Date().toISOString(),
    }
    paymentsStore.push(payment)
    return payment
  }

  async getByInvoiceId(invoiceId: string): Promise<PaymentRecord[]> {
    initStore()
    return paymentsStore.filter((p) => p.invoice_id === invoiceId)
  }

  async getByPatientId(patientId: string): Promise<PaymentRecord[]> {
    initStore()
    return paymentsStore.filter((p) => p.patient_id === patientId)
  }
}
