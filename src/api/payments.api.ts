/**
 * Payments API - Payment management linked to invoices
 * Mock implementation, backend-replaceable
 */

import type { Payment, PaymentMethod } from "@/types/payment"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory store
const paymentsStore: Payment[] = []

/**
 * Initialize mock payments from paid invoices
 * Creates payments linked to paid invoices
 */
function initializeMockPayments() {
  if (paymentsStore.length > 0) return // Already initialized

  // We'll initialize payments after invoices are created
  // This will be called when invoices are initialized
}

// Export function to sync payments with invoices
export async function syncPaymentsWithInvoices() {
  // Don't clear if already synced
  if (paymentsStore.length > 0) return

  try {
    const { listInvoices } = await import("./invoices.api")
    const invoicesResponse = await listInvoices({
      clinicId: "clinic-001",
      status: "paid",
      page: 1,
      pageSize: 1000,
    })

    invoicesResponse.invoices.forEach((invoice, index) => {
      // Check if payment already exists
      if (paymentsStore.find((p) => p.invoiceId === invoice.id)) {
        return
      }

      // Mix of cash, visa, and instapay
      const methods: PaymentMethod[] = ["cash", "visa", "instapay"]
      const method = methods[index % 3]
      
      const payment: Payment = {
        id: `pay_mock_${invoice.id}`,
        clinicId: invoice.clinicId,
        invoiceId: invoice.id,
        patientId: invoice.patientId,
        appointmentId: invoice.appointmentId,
        amount: invoice.amount,
        method,
        proofFileId: (method === "visa" || method === "instapay") ? `proof_${invoice.id}` : undefined,
        createdByUserId: "user-001",
        createdAt: new Date(new Date(invoice.createdAt).getTime() + 30 * 60 * 1000).toISOString(), // Payment 30 min after invoice
      }
      
      paymentsStore.push(payment)
    })

    // Fallback: if no paid invoices (e.g. no past arrived/completed appointments), seed a few so Income tab shows entries
    if (paymentsStore.length === 0) {
      const { mockData } = await import("@/data/mock/mock-data")
      const now = new Date()
      const methods: PaymentMethod[] = ["cash", "visa", "instapay"]
      const patients = mockData.patients.slice(0, 3)
      patients.forEach((pt, i) => {
        const created = new Date(now)
        created.setDate(created.getDate() - i - 1)
        created.setHours(10 + i, 30, 0, 0)
        paymentsStore.push({
          id: `pay_seed_${i + 1}`,
          clinicId: "clinic-001",
          invoiceId: `inv_seed_${i + 1}`,
          patientId: pt.id,
          appointmentId: `apt_seed_${i + 1}`,
          amount: 350,
          method: methods[i % 3],
          proofFileId: methods[i % 3] !== "cash" ? `proof_seed_${i + 1}` : undefined,
          createdByUserId: "user-001",
          createdAt: created.toISOString(),
        })
      })
    }
  } catch {
    // If invoices not initialized yet, will sync later
  }
}

// Initialize
initializeMockPayments()

export interface CreatePaymentParams {
  clinicId: string
  invoiceId: string
  patientId: string
  appointmentId: string
  amount: number
  method: PaymentMethod
  proofFileId?: string
  createdByUserId: string
}

export interface ListPaymentsParams {
  clinicId: string
  from?: string
  to?: string
  query?: string
  page?: number
  pageSize?: number
  patientId?: string
}

export interface ListPaymentsResponse {
  payments: Payment[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Create a payment
 * Rules:
 * - invoiceId is required
 * - If method is instapay, proofFileId is REQUIRED
 * - One invoice can have at most one payment (no partial payments)
 */
export async function createPayment(params: CreatePaymentParams): Promise<Payment> {
  await delay(300)
  
  // Validate invoiceId is provided
  if (!params.invoiceId) {
    throw new Error("invoiceId is required")
  }
  
  // Validate visa and instapay require proof
  if ((params.method === "visa" || params.method === "instapay") && !params.proofFileId) {
    throw new Error("proofFileId is required for visa and instapay payments")
  }
  
  // Check if payment already exists for this invoice
  const existingPayment = paymentsStore.find((p) => p.invoiceId === params.invoiceId)
  if (existingPayment) {
    throw new Error("Payment already exists for this invoice. Partial payments are not allowed.")
  }
  
  // Create payment
  const payment: Payment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clinicId: params.clinicId,
    invoiceId: params.invoiceId,
    patientId: params.patientId,
    appointmentId: params.appointmentId,
    amount: params.amount,
    method: params.method,
    proofFileId: params.proofFileId,
    createdByUserId: params.createdByUserId,
    createdAt: new Date().toISOString(),
  }
  
  paymentsStore.push(payment)
  return payment
}

/**
 * List payments with filtering and pagination
 */
export async function listPayments(params: ListPaymentsParams): Promise<ListPaymentsResponse> {
  await delay(200)

  const clinicId = params.clinicId?.trim() || "clinic-001"

  // Ensure initialization has run
  if (paymentsStore.length === 0) {
    await syncPaymentsWithInvoices()
  }

  let filtered = paymentsStore.filter((p) => p.clinicId === clinicId)
  
  // Filter by patient
  if (params.patientId) {
    filtered = filtered.filter((p) => p.patientId === params.patientId)
  }
  
  // Filter by date range (compare date strings, not full timestamps)
  if (params.from) {
    const fromDate = params.from.split("T")[0] // Get YYYY-MM-DD part
    filtered = filtered.filter((p) => {
      const payDate = p.createdAt.split("T")[0]
      return payDate >= fromDate
    })
  }
  if (params.to) {
    const toDate = params.to.split("T")[0] // Get YYYY-MM-DD part
    filtered = filtered.filter((p) => {
      const payDate = p.createdAt.split("T")[0]
      return payDate <= toDate
    })
  }
  
  // Filter by query (search in patient name, phone, invoice ID, or appointment ID)
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
        (p) =>
          matchingPatientIds.has(p.patientId) ||
          p.invoiceId.toLowerCase().includes(queryLower) ||
          p.appointmentId.toLowerCase().includes(queryLower)
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
  const paginatedPayments = filtered.slice(start, end)
  
  return {
    payments: paginatedPayments,
    total: filtered.length,
    page,
    pageSize,
    hasMore: end < filtered.length,
  }
}

/**
 * Get payment by invoice ID
 */
export async function getPaymentByInvoiceId(invoiceId: string): Promise<Payment | null> {
  await delay(100)
  
  const payment = paymentsStore.find((p) => p.invoiceId === invoiceId)
  return payment || null
}

/**
 * Get payment by ID
 */
export async function getPaymentById(paymentId: string): Promise<Payment | null> {
  await delay(100)
  
  const payment = paymentsStore.find((p) => p.id === paymentId)
  return payment || null
}

/**
 * Delete payment by invoice ID (used when reversing payment)
 */
export async function deletePaymentByInvoiceId(invoiceId: string): Promise<void> {
  await delay(100)
  
  const index = paymentsStore.findIndex((p) => p.invoiceId === invoiceId)
  if (index !== -1) {
    paymentsStore.splice(index, 1)
  }
}
