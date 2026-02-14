import type { IPaymentsRepository, CreatePaymentPayload, ListPaymentsParams } from "../../interfaces/payments.interface"
import type { PaymentRecord } from "@/types/payment"

let paymentsStore: PaymentRecord[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    paymentsStore = []
    initialized = true
  }
}

function generateId(): string {
  return `pay-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function mapMethod(m: string): PaymentRecord["method"] {
  if (m === "cash" || m === "visa" || m === "instapay") return m
  return "cash"
}

export class MockPaymentsRepository implements IPaymentsRepository {
  async list(params: ListPaymentsParams): Promise<PaymentRecord[]> {
    initStore()
    let filtered = paymentsStore

    if (params.from) {
      const fromDate = new Date(params.from)
      filtered = filtered.filter((p) => new Date(p.createdAt) >= fromDate)
    }

    if (params.to) {
      const toDate = new Date(params.to)
      filtered = filtered.filter((p) => new Date(p.createdAt) <= toDate)
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async create(payload: CreatePaymentPayload): Promise<PaymentRecord> {
    initStore()
    const payment: PaymentRecord = {
      id: generateId(),
      clinicId: "",
      invoiceId: payload.invoice_id,
      patientId: payload.patient_id,
      appointmentId: "",
      amount: payload.amount,
      method: mapMethod(payload.method),
      createdByUserId: "",
      createdAt: new Date().toISOString(),
    }
    paymentsStore.push(payment)
    return payment
  }

  async getByInvoiceId(invoiceId: string): Promise<PaymentRecord[]> {
    initStore()
    return paymentsStore.filter((p) => p.invoiceId === invoiceId)
  }

  async getByPatientId(patientId: string): Promise<PaymentRecord[]> {
    initStore()
    return paymentsStore.filter((p) => p.patientId === patientId)
  }
}
