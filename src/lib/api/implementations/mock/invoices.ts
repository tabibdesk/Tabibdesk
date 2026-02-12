import { mockData } from "@/data/mock/mock-data"
import type { IInvoicesRepository, CreateInvoicePayload, ListInvoicesParams, ListInvoicesResponse } from "../../interfaces/invoices.interface"
import type { Invoice, InvoiceStatus } from "@/types/invoice"

let invoicesStore: Invoice[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    const now = new Date()
    const pastAppointments = mockData.appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduled_at)
      return aptDate < now && (apt.status === "arrived" || apt.status === "completed")
    })

    for (const apt of pastAppointments) {
      const hash = (apt.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + apt.id.length) % 3
      const shouldBePaid = hash !== 0

      const invoice: Invoice = {
        id: `inv_mock_${apt.id}`,
        clinicId: apt.clinic_id || "clinic-001",
        doctorId: apt.doctor_id || "user-001",
        patientId: apt.patient_id,
        appointmentId: apt.id,
        appointmentType: apt.type,
        amount: 350,
        status: shouldBePaid ? "paid" : "unpaid",
        createdAt: apt.scheduled_at,
      }

      invoicesStore.push(invoice)
    }
    initialized = true
  }
}

function generateId(): string {
  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockInvoicesRepository implements IInvoicesRepository {
  async list(params: ListInvoicesParams): Promise<ListInvoicesResponse> {
    initStore()
    let filtered = invoicesStore.filter((inv) => inv.clinicId === params.clinicId)

    if (params.status) {
      filtered = filtered.filter((inv) => inv.status === params.status)
    }

    if (params.from) {
      const fromDate = new Date(params.from)
      filtered = filtered.filter((inv) => new Date(inv.createdAt) >= fromDate)
    }

    if (params.to) {
      const toDate = new Date(params.to)
      filtered = filtered.filter((inv) => new Date(inv.createdAt) <= toDate)
    }

    return {
      data: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      total: filtered.length,
    }
  }

  async getById(id: string): Promise<Invoice | null> {
    initStore()
    return invoicesStore.find((inv) => inv.id === id) || null
  }

  async getByAppointmentId(appointmentId: string): Promise<Invoice | null> {
    initStore()
    return invoicesStore.find((inv) => inv.appointmentId === appointmentId) || null
  }

  async create(payload: CreateInvoicePayload): Promise<Invoice> {
    initStore()
    const invoice: Invoice = {
      id: generateId(),
      clinicId: payload.clinic_id,
      doctorId: payload.doctor_id,
      patientId: payload.patient_id,
      appointmentId: payload.appointment_id,
      appointmentType: payload.appointment_type,
      amount: payload.amount,
      status: "unpaid",
      createdAt: new Date().toISOString(),
      lineItems: payload.line_items,
    }
    invoicesStore.push(invoice)
    return invoice
  }

  async updateLineItems(id: string, lineItems: any[]): Promise<Invoice> {
    initStore()
    const inv = invoicesStore.find((i) => i.id === id)
    if (!inv) throw new Error("Invoice not found")
    inv.lineItems = lineItems
    inv.amount = lineItems.reduce((sum, item) => sum + item.amount, 0)
    return inv
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    initStore()
    const inv = invoicesStore.find((i) => i.id === id)
    if (!inv) throw new Error("Invoice not found")
    inv.status = status
    return inv
  }

  async markUnpaid(id: string): Promise<Invoice> {
    initStore()
    const inv = invoicesStore.find((i) => i.id === id)
    if (!inv) throw new Error("Invoice not found")
    inv.status = "unpaid"
    return inv
  }
}
