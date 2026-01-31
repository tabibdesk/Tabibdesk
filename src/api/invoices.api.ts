/**
 * Invoices API - Invoice management
 * Mock implementation, backend-replaceable
 */

import type { Invoice, InvoiceStatus } from "@/types/invoice"
import { getPriceForAppointmentType } from "./pricing.api"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory store
const invoicesStore: Invoice[] = []

/**
 * Initialize mock invoices from past appointments
 * Creates invoices for appointments that were marked as "arrived" or "completed"
 */
async function initializeMockInvoices() {
  if (invoicesStore.length > 0) return // Already initialized

  const { mockData } = await import("@/data/mock/mock-data")
  const { getPriceForAppointmentType } = await import("./pricing.api")
  
  const now = new Date()
  const pastAppointments = mockData.appointments.filter((apt) => {
    const aptDate = new Date(apt.scheduled_at)
    // Only include past appointments that were arrived or completed
    // Exclude future appointments and scheduled/confirmed future ones
    return aptDate < now && (apt.status === "arrived" || apt.status === "completed")
  })

  // Create invoices for past appointments (deterministic paid/unpaid so Income tab always has entries)
  for (const apt of pastAppointments) {
    const hash = (apt.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + apt.id.length) % 3
    const shouldBePaid = hash !== 0 // ~67% paid so mock Income tab shows data
    
    // Get pricing for this appointment type
    let amount = 350 // default
    try {
      const price = await getPriceForAppointmentType({
        clinicId: apt.clinic_id || "clinic-001",
        doctorId: apt.doctor_id || "user-001",
        appointmentType: apt.type,
      })
      if (price) {
        amount = price
      }
    } catch {
      // Use default if pricing not found
    }
    
    const invoice: Invoice = {
      id: `inv_mock_${apt.id}`,
      clinicId: apt.clinic_id || "clinic-001",
      doctorId: apt.doctor_id || "user-001",
      patientId: apt.patient_id,
      appointmentId: apt.id,
      appointmentType: apt.type,
      amount,
      status: shouldBePaid ? "paid" : "unpaid",
      createdAt: apt.scheduled_at, // Invoice created when appointment was marked arrived
    }
    
    invoicesStore.push(invoice)
  }

  // Sync payments after invoices are created so Income tab has entries
  const { syncPaymentsWithInvoices } = await import("./payments.api")
  await syncPaymentsWithInvoices()
}

// Initialize on module load (async)
initializeMockInvoices()

export interface ListInvoicesParams {
  clinicId: string
  status?: InvoiceStatus
  from?: string
  to?: string
  query?: string
  page?: number
  pageSize?: number
  patientId?: string
}

export interface ListInvoicesResponse {
  invoices: Invoice[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Create invoice for an arrived appointment
 * Only creates if pricing exists and invoice doesn't already exist
 */
export async function createInvoiceForArrivedAppointment(appointment: {
  id: string
  clinic_id: string
  doctor_id: string
  patient_id: string
  type: string
}): Promise<Invoice> {
  await delay(200)
  
  // Check if invoice already exists
  const existing = invoicesStore.find((inv) => inv.appointmentId === appointment.id)
  if (existing) {
    return existing
  }
  
  // Get pricing for this appointment type
  const amount = await getPriceForAppointmentType({
    clinicId: appointment.clinic_id,
    doctorId: appointment.doctor_id,
    appointmentType: appointment.type,
  })
  
  if (!amount) {
    throw new Error(`Pricing not set for appointment type: ${appointment.type}`)
  }
  
  // Create invoice
  const invoice: Invoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clinicId: appointment.clinic_id,
    doctorId: appointment.doctor_id,
    patientId: appointment.patient_id,
    appointmentId: appointment.id,
    appointmentType: appointment.type,
    amount,
    status: "unpaid",
    createdAt: new Date().toISOString(),
  }
  
  invoicesStore.push(invoice)
  return invoice
}

/**
 * Create an invoice with a specific amount (e.g. partial payment or balance due).
 * Used when recording partial payments: one invoice for amount paid, one for remainder (due).
 */
export async function createInvoiceWithAmount(params: {
  clinicId: string
  doctorId: string
  patientId: string
  appointmentId: string
  appointmentType: string
  amount: number
}): Promise<Invoice> {
  await delay(200)

  if (params.amount <= 0) {
    throw new Error("Invoice amount must be positive")
  }

  const invoice: Invoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clinicId: params.clinicId,
    doctorId: params.doctorId,
    patientId: params.patientId,
    appointmentId: params.appointmentId,
    appointmentType: params.appointmentType,
    amount: params.amount,
    status: "unpaid",
    createdAt: new Date().toISOString(),
  }

  invoicesStore.push(invoice)
  return invoice
}

export interface RecordPartialPaymentWithDueParams {
  clinicId: string
  doctorId: string
  patientId: string
  appointmentId: string
  appointmentType: string
  amountPaid: number
  serviceAmount: number
  createDueForRemainder: boolean
  createdByUserId: string
}

export interface RecordPartialPaymentWithDueResult {
  paidInvoice: Invoice
  dueInvoice: Invoice | null
}

/**
 * Record a partial payment in the data store and optionally create a due record
 * for the remaining amount. All writes (invoices + payment) happen here.
 */
export async function recordPartialPaymentWithOptionalDue(
  params: RecordPartialPaymentWithDueParams
): Promise<RecordPartialPaymentWithDueResult> {
  await delay(200)

  const remainder = params.serviceAmount - params.amountPaid
  const createDue = params.createDueForRemainder && remainder > 0.01

  const paidInvoice = await createInvoiceWithAmount({
    clinicId: params.clinicId,
    doctorId: params.doctorId,
    patientId: params.patientId,
    appointmentId: params.appointmentId,
    appointmentType: params.appointmentType,
    amount: params.amountPaid,
  })

  const { createPayment } = await import("./payments.api")
  await createPayment({
    clinicId: params.clinicId,
    invoiceId: paidInvoice.id,
    patientId: params.patientId,
    appointmentId: params.appointmentId,
    amount: params.amountPaid,
    method: "cash",
    createdByUserId: params.createdByUserId,
  })
  await markInvoicePaid(paidInvoice.id)

  let dueInvoice: Invoice | null = null
  if (createDue) {
    dueInvoice = await createInvoiceWithAmount({
      clinicId: params.clinicId,
      doctorId: params.doctorId,
      patientId: params.patientId,
      appointmentId: params.appointmentId,
      appointmentType: params.appointmentType,
      amount: remainder,
    })
  }

  return { paidInvoice, dueInvoice }
}

/**
 * List invoices with filtering and pagination
 */
export async function listInvoices(params: ListInvoicesParams): Promise<ListInvoicesResponse> {
  await delay(200)

  const clinicId = params.clinicId?.trim() || "clinic-001"

  // Ensure initialization has run
  if (invoicesStore.length === 0) {
    await initializeMockInvoices()
  }

  let filtered = invoicesStore.filter((inv) => inv.clinicId === clinicId)
  
  // Filter by status
  if (params.status) {
    filtered = filtered.filter((inv) => inv.status === params.status)
  }
  
  // Filter by patient
  if (params.patientId) {
    filtered = filtered.filter((inv) => inv.patientId === params.patientId)
  }
  
  // Filter by date range (compare date strings, not full timestamps)
  if (params.from) {
    const fromDate = params.from.split("T")[0] // Get YYYY-MM-DD part
    filtered = filtered.filter((inv) => {
      const invDate = inv.createdAt.split("T")[0]
      return invDate >= fromDate
    })
  }
  if (params.to) {
    const toDate = params.to.split("T")[0] // Get YYYY-MM-DD part
    filtered = filtered.filter((inv) => {
      const invDate = inv.createdAt.split("T")[0]
      return invDate <= toDate
    })
  }
  
  // Filter by query (search in patient name, phone, or appointment type)
  if (params.query) {
    const queryLower = params.query.trim().toLowerCase()
    if (queryLower) {
      const { mockData } = await import("@/data/mock/mock-data")
      const matchingPatientIds = new Set(
        mockData.patients
          .filter(
            (pt) =>
              `${(pt.first_name || "").toLowerCase()} ${(pt.last_name || "").toLowerCase()}`.includes(queryLower) ||
              (pt.first_name || "").toLowerCase().includes(queryLower) ||
              (pt.last_name || "").toLowerCase().includes(queryLower) ||
              (pt.phone || "").toLowerCase().includes(queryLower)
          )
          .map((pt) => pt.id)
      )
      filtered = filtered.filter(
        (inv) =>
          matchingPatientIds.has(inv.patientId) ||
          inv.appointmentType.toLowerCase().includes(queryLower)
      )
    }
  }
  
  // Sort by date desc
  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  
  // Pagination
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedInvoices = filtered.slice(start, end)
  
  return {
    invoices: paginatedInvoices,
    total: filtered.length,
    page,
    pageSize,
    hasMore: end < filtered.length,
  }
}

/**
 * Get invoice by appointment ID
 */
export async function getInvoiceByAppointmentId(appointmentId: string): Promise<Invoice | null> {
  await delay(100)
  
  const invoice = invoicesStore.find((inv) => inv.appointmentId === appointmentId)
  return invoice || null
}

/**
 * Mark invoice as paid
 */
export async function markInvoicePaid(invoiceId: string): Promise<Invoice> {
  await delay(200)
  
  const index = invoicesStore.findIndex((inv) => inv.id === invoiceId)
  if (index === -1) {
    throw new Error("Invoice not found")
  }
  
  const updated: Invoice = {
    ...invoicesStore[index],
    status: "paid",
  }
  
  invoicesStore[index] = updated
  return updated
}

/**
 * Mark invoice as unpaid (reverse payment)
 * Also removes the associated payment record
 */
export async function markInvoiceUnpaid(invoiceId: string): Promise<Invoice> {
  await delay(200)
  
  const index = invoicesStore.findIndex((inv) => inv.id === invoiceId)
  if (index === -1) {
    throw new Error("Invoice not found")
  }
  
  // Remove associated payment
  const { deletePaymentByInvoiceId } = await import("./payments.api")
  await deletePaymentByInvoiceId(invoiceId)
  
  const updated: Invoice = {
    ...invoicesStore[index],
    status: "unpaid",
  }
  
  invoicesStore[index] = updated
  return updated
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  await delay(100)
  
  const invoice = invoicesStore.find((inv) => inv.id === invoiceId)
  return invoice || null
}

/**
 * Mark invoice as void (e.g. when replacing with partial paid + due pair)
 */
export async function voidInvoice(invoiceId: string): Promise<Invoice> {
  await delay(200)

  const index = invoicesStore.findIndex((inv) => inv.id === invoiceId)
  if (index === -1) {
    throw new Error("Invoice not found")
  }

  const updated: Invoice = {
    ...invoicesStore[index],
    status: "void",
  }

  invoicesStore[index] = updated
  return updated
}

export interface UpdateInvoiceLineItemsParams {
  invoiceId: string
  consultationWaived: boolean
  consultationAmount: number
  procedureLines: { id?: string; label: string; amount: number }[]
  discountAmount: number
}

/**
 * Update invoice with line items (consultation, procedures, discount).
 * Recalculates amount from line items.
 */
export async function updateInvoiceLineItems(
  params: UpdateInvoiceLineItemsParams
): Promise<Invoice> {
  await delay(150)

  const index = invoicesStore.findIndex((inv) => inv.id === params.invoiceId)
  if (index === -1) {
    throw new Error("Invoice not found")
  }

  const lineItems: Invoice["lineItems"] = []

  if (!params.consultationWaived && params.consultationAmount > 0) {
    lineItems!.push({
      id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: "consultation",
      label: "Consultation",
      amount: params.consultationAmount,
    })
  } else {
    lineItems!.push({
      id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: "consultation",
      label: "Consultation — Waived",
      amount: 0,
    })
  }

  for (const p of params.procedureLines) {
    if (p.amount <= 0) continue
    lineItems!.push({
      id: p.id ?? `line_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: "procedure",
      label: p.label,
      amount: p.amount,
    })
  }

  if (params.discountAmount > 0) {
    lineItems!.push({
      id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: "discount",
      label: "Discount",
      amount: -params.discountAmount,
    })
  }

  const total = lineItems!.reduce((sum, i) => sum + i.amount, 0)
  const updated: Invoice = {
    ...invoicesStore[index],
    lineItems,
    amount: Math.max(0, total),
  }

  invoicesStore[index] = updated
  return updated
}
