/**
 * Accounting API
 * Reads from single source: invoices.api + payments.api (no duplicate payment store).
 * Expenses remain local; payments and cashier/balances come from payments.api + invoices.api.
 */

import type {
  Payment,
  Expense,
  CashierRow,
  PatientBalance,
  PatientPaymentHistory,
  MonthlySummary,
  ClinicAccountingSettings,
  AccountingIntegration,
  CreatePaymentInput,
  UpdatePaymentInput,
  CreateExpenseInput,
  ListPaymentsParams,
  ListPaymentsResponse,
  ListExpensesParams,
  ListExpensesResponse,
  ListBalancesParams,
  ListBalancesResponse,
  Refund,
  CreateRefundInput,
  InvoiceRefundSummary,
  ListRefundsParams,
  ListRefundsResponse,
} from "@/features/accounting/accounting.types"
import type { Payment as InvoicePayment } from "@/types/payment"
import { listPayments as listPaymentsFromStore } from "@/api/payments.api"
import { listInvoices } from "@/api/invoices.api"
import { mockData } from "@/data/mock/mock-data"

function getPatientName(patientId: string): string {
  const p = mockData.patients.find((x) => x.id === patientId)
  return p ? `${p.first_name} ${p.last_name}` : "Unknown Patient"
}

function mapToAccountingPayment(p: InvoicePayment): Payment {
  return {
    id: p.id,
    clinicId: p.clinicId,
    patientId: p.patientId,
    patientName: getPatientName(p.patientId),
    appointmentId: p.appointmentId ?? undefined,
    amount: p.amount,
    method: p.method as Payment["method"],
    status: "paid",
    reference: undefined,
    evidenceUrl: p.proofFileId ? `/uploads/${p.proofFileId}` : undefined,
    createdAt: p.createdAt,
    createdByUserId: p.createdByUserId,
  }
}

const expensesStore: Expense[] = [
  {
    id: "exp_001",
    clinicId: "clinic_1",
    category: "supplies",
    amount: 1500,
    vendor: "Medical Supplies Co.",
    description: "Medical supplies and consumables",
    paymentMethod: "bank_transfer",
    date: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    createdByUserId: "user_1",
  },
  {
    id: "exp_002",
    clinicId: "clinic_1",
    category: "rent",
    amount: 5000,
    vendor: "Building Management",
    description: "Monthly clinic rent",
    paymentMethod: "bank_transfer",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdByUserId: "user_1",
  },
  {
    id: "exp_003",
    clinicId: "clinic_1",
    category: "utilities",
    amount: 800,
    vendor: "Electricity Company",
    description: "Monthly electricity bill",
    paymentMethod: "cash",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdByUserId: "user_1",
  },
  {
    id: "exp_004",
    clinicId: "clinic_1",
    category: "marketing",
    amount: 1200,
    vendor: "Digital Marketing Agency",
    description: "Social media ads campaign",
    paymentMethod: "credit_card",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdByUserId: "user_1",
  },
]

const settingsStore: Record<string, ClinicAccountingSettings> = {}
const integrationStore: Record<string, AccountingIntegration> = {}

// Refunds store (invoice-scoped; mock-only)
const refundsStore: Refund[] = []

// Helper to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * PAYMENTS — read/write via single source (invoices.api + payments.api)
 */

export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  await delay(300)
  const { createPayment: createInvoicePayment } = await import("@/api/payments.api")
  const { getInvoiceByAppointmentId, createInvoiceWithAmount, markInvoicePaid } = await import("@/api/invoices.api")

  let invoiceId: string
  const appointmentId = input.appointmentId ?? ""

  if (appointmentId) {
    const existing = await getInvoiceByAppointmentId(appointmentId)
    if (existing && existing.status === "unpaid") {
      invoiceId = existing.id
    } else if (existing && existing.status === "paid") {
      throw new Error("This appointment is already paid.")
    } else {
      const apt = mockData.appointments.find((a) => a.id === appointmentId)
      const clinicId = apt?.clinic_id ?? input.clinicId
      const doctorId = apt?.doctor_id ?? "user-001"
      const inv = await createInvoiceWithAmount({
        clinicId,
        doctorId,
        patientId: input.patientId,
        appointmentId,
        appointmentType: apt?.type ?? "Consultation",
        amount: input.amount,
      })
      invoiceId = inv.id
    }
  } else {
    const inv = await createInvoiceWithAmount({
      clinicId: input.clinicId,
      doctorId: "user-001",
      patientId: input.patientId,
      appointmentId: "",
      appointmentType: "Consultation",
      amount: input.amount,
    })
    invoiceId = inv.id
  }

  const created = await createInvoicePayment({
    clinicId: input.clinicId,
    invoiceId,
    patientId: input.patientId,
    appointmentId,
    amount: input.amount,
    method: input.method as InvoicePayment["method"],
    proofFileId: input.evidenceUrl,
    createdByUserId: input.createdByUserId,
  })
  await markInvoicePaid(invoiceId)
  return mapToAccountingPayment(created)
}

export async function updatePayment(
  paymentId: string,
  _input: UpdatePaymentInput
): Promise<Payment> {
  await delay(200)
  const { getPaymentById } = await import("@/api/payments.api")
  const existing = await getPaymentById(paymentId)
  if (!existing) throw new Error("Payment not found")
  // payments.api has no status field; no-op for status/approve; UI refetch will show latest
  return mapToAccountingPayment(existing)
}

export async function getPayment(paymentId: string): Promise<Payment> {
  await delay(100)
  const { getPaymentById } = await import("@/api/payments.api")
  const p = await getPaymentById(paymentId)
  if (!p) throw new Error("Payment not found")
  return mapToAccountingPayment(p)
}

export async function deletePayment(paymentId: string): Promise<void> {
  await delay(200)
  const { getPaymentById, deletePaymentByInvoiceId } = await import("@/api/payments.api")
  const byId = await getPaymentById(paymentId)
  if (byId) await deletePaymentByInvoiceId(byId.invoiceId)
}

export async function listPayments(
  params: ListPaymentsParams
): Promise<ListPaymentsResponse> {
  await delay(200)

  const res = await listPaymentsFromStore({
    clinicId: params.clinicId,
    patientId: params.patientId,
    from: params.dateFrom,
    to: params.dateTo,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  })
  let list = res.payments
  if (params.appointmentId) {
    list = list.filter((p) => p.appointmentId === params.appointmentId)
  }
  if (params.status) {
    // payments.api has no status; all are paid
    if (params.status !== "paid") list = []
  }

  const payments = list.map(mapToAccountingPayment)
  return {
    payments,
    total: res.total,
    page: res.page,
    pageSize: res.pageSize,
    hasMore: res.hasMore,
  }
}

/**
 * REFUNDS — invoice-scoped; in-memory store
 */

export async function getInvoiceRefundSummary(invoiceId: string): Promise<InvoiceRefundSummary | null> {
  await delay(100)
  const { getInvoiceById } = await import("@/api/invoices.api")
  const { getPaymentByInvoiceId } = await import("@/api/payments.api")

  const inv = await getInvoiceById(invoiceId)
  if (!inv) return null

  const invoiceTotal =
    inv.lineItems && inv.lineItems.length > 0
      ? inv.lineItems.reduce((sum, i) => sum + i.amount, 0)
      : inv.amount

  const payment = await getPaymentByInvoiceId(invoiceId)
  const invoicePaid = payment ? payment.amount : 0

  const invoiceRefunded = refundsStore
    .filter((r) => r.invoiceId === invoiceId)
    .reduce((sum, r) => sum + r.amount, 0)

  const refundable = Math.max(0, invoicePaid - invoiceRefunded)

  return {
    invoiceId,
    invoiceTotal,
    invoicePaid,
    invoiceRefunded,
    refundable,
  }
}

export async function listRefundsByInvoice(invoiceId: string): Promise<Refund[]> {
  await delay(100)
  return refundsStore
    .filter((r) => r.invoiceId === invoiceId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function createRefund(input: CreateRefundInput): Promise<Refund> {
  await delay(300)

  const summary = await getInvoiceRefundSummary(input.invoiceId)
  if (!summary) throw new Error("Invoice not found")
  if (input.amount <= 0) throw new Error("Refund amount must be greater than zero.")
  if (input.amount > summary.refundable) {
    throw new Error(
      `Refund amount cannot exceed refundable amount (${summary.refundable.toFixed(2)} EGP).`
    )
  }

  const inv = await (await import("@/api/invoices.api")).getInvoiceById(input.invoiceId)
  if (!inv) throw new Error("Invoice not found")

  const refund: Refund = {
    id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clinicId: input.clinicId,
    invoiceId: input.invoiceId,
    patientId: inv.patientId,
    patientName: getPatientName(inv.patientId),
    amount: input.amount,
    method: input.method,
    reason: input.reason,
    proofFileId: input.proofFileId,
    createdAt: new Date().toISOString(),
    createdByUserId: input.createdByUserId,
  }
  refundsStore.push(refund)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/14d1a666-454e-4d19-a0b7-b746072205fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounting.api.ts:createRefund',message:'refund pushed to store',data:{refundId:refund.id,storeLength:refundsStore.length,createdAt:refund.createdAt},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion

  const { createInvoiceWithAmount } = await import("@/api/invoices.api")
  await createInvoiceWithAmount({
    clinicId: inv.clinicId,
    doctorId: inv.doctorId,
    patientId: inv.patientId,
    appointmentId: inv.appointmentId,
    appointmentType: inv.appointmentType,
    amount: input.amount,
  })

  return refund
}

export async function listRefunds(params: ListRefundsParams): Promise<ListRefundsResponse> {
  await delay(200)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/14d1a666-454e-4d19-a0b7-b746072205fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounting.api.ts:listRefunds',message:'listRefunds called',data:{storeLength:refundsStore.length,dateFrom:params.dateFrom,dateTo:params.dateTo,clinicId:params.clinicId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion

  let filtered = refundsStore.filter((r) => r.clinicId === params.clinicId)

  if (params.dateFrom) {
    const fromDate = params.dateFrom.split("T")[0]
    filtered = filtered.filter((r) => r.createdAt.split("T")[0] >= fromDate)
  }
  if (params.dateTo) {
    const toDate = params.dateTo.split("T")[0]
    filtered = filtered.filter((r) => r.createdAt.split("T")[0] <= toDate)
  }

  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const refunds = filtered.slice(start, end)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/14d1a666-454e-4d19-a0b7-b746072205fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'accounting.api.ts:listRefunds',message:'listRefunds returning',data:{filteredLength:filtered.length,refundsLength:refunds.length,total:filtered.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion

  return {
    refunds,
    total: filtered.length,
    page,
    pageSize,
    hasMore: end < filtered.length,
  }
}

/** Reset in-memory refunds store (for tests only). */
export function __testOnlyResetRefundsStore(): void {
  refundsStore.length = 0
}

/**
 * EXPENSES
 */

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  await delay(300)

  const expense: Expense = {
    id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clinicId: input.clinicId,
    category: input.category,
    amount: input.amount,
    vendor: input.vendor,
    description: input.description,
    paymentMethod: input.paymentMethod,
    receiptUrl: input.receiptUrl,
    date: input.date,
    createdAt: new Date().toISOString(),
    createdByUserId: input.createdByUserId,
  }

  expensesStore.push(expense)
  return expense
}

export async function listExpenses(
  params: ListExpensesParams
): Promise<ListExpensesResponse> {
  await delay(200)

  let filtered = expensesStore

  // Apply filters
  if (params.category) {
    filtered = filtered.filter((e) => e.category === params.category)
  }
  if (params.dateFrom) {
    filtered = filtered.filter((e) => e.date >= params.dateFrom!)
  }
  if (params.dateTo) {
    filtered = filtered.filter((e) => e.date <= params.dateTo!)
  }

  // Sort by date desc
  filtered.sort((a, b) => b.date.localeCompare(a.date))

  // Pagination
  const page = params.page || 1
  const pageSize = params.pageSize || 50
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedExpenses = filtered.slice(start, end)

  return {
    expenses: paginatedExpenses,
    total: filtered.length,
    page,
    pageSize,
  }
}

/**
 * CASHIER / TODAY VIEW — from payments.api + unpaid invoices
 */

export async function getTodayCashierRows(params: {
  clinicId: string
  date: string
}): Promise<CashierRow[]> {
  await delay(300)

  const [paymentsRes, unpaidRes] = await Promise.all([
    listPaymentsFromStore({
      clinicId: params.clinicId,
      from: params.date,
      to: params.date,
      page: 1,
      pageSize: 500,
    }),
    listInvoices({
      clinicId: params.clinicId,
      status: "unpaid",
      from: params.date,
      to: params.date,
      page: 1,
      pageSize: 500,
    }),
  ])

  const rows: CashierRow[] = paymentsRes.payments.map((p) => ({
    appointmentId: p.appointmentId || `apt_${p.id}`,
    patientId: p.patientId,
    patientName: getPatientName(p.patientId),
    appointmentStatus: "completed",
    time: p.createdAt,
    feeAmount: p.amount,
    paymentId: p.id,
    paymentStatus: "paid",
    paymentMethod: p.method as CashierRow["paymentMethod"],
    paymentAmount: p.amount,
    paymentReference: undefined,
    evidenceUrl: undefined,
  }))

  unpaidRes.invoices.forEach((inv) => {
    rows.push({
      appointmentId: inv.appointmentId || `apt_${inv.id}`,
      patientId: inv.patientId,
      patientName: getPatientName(inv.patientId),
      appointmentStatus: "completed",
      time: inv.createdAt,
      feeAmount: inv.amount,
      paymentStatus: "unpaid",
    })
  })

  rows.sort((a, b) => b.time.localeCompare(a.time))
  return rows
}

/**
 * BALANCES — from payments.api + unpaid invoices
 */

export async function getPatientBalances(
  params: ListBalancesParams
): Promise<ListBalancesResponse> {
  await delay(300)

  const [paymentsRes, unpaidRes] = await Promise.all([
    listPaymentsFromStore({ clinicId: params.clinicId, page: 1, pageSize: 10000 }),
    listInvoices({ clinicId: params.clinicId, status: "unpaid", page: 1, pageSize: 10000 }),
  ])

  const balanceMap: Record<string, PatientBalance> = {}

  for (const payment of paymentsRes.payments) {
    if (!balanceMap[payment.patientId]) {
      balanceMap[payment.patientId] = {
        patientId: payment.patientId,
        patientName: getPatientName(payment.patientId),
        phone: mockData.patients.find((p) => p.id === payment.patientId)?.phone ?? "0100-000-0000",
        totalDue: 0,
        lastVisit: payment.createdAt,
        lastPayment: "",
      }
    }
    const balance = balanceMap[payment.patientId]
    if (payment.createdAt > balance.lastPayment) balance.lastPayment = payment.createdAt
    if (payment.createdAt > balance.lastVisit) balance.lastVisit = payment.createdAt
  }

  for (const inv of unpaidRes.invoices) {
    if (!balanceMap[inv.patientId]) {
      balanceMap[inv.patientId] = {
        patientId: inv.patientId,
        patientName: getPatientName(inv.patientId),
        phone: mockData.patients.find((p) => p.id === inv.patientId)?.phone ?? "0100-000-0000",
        totalDue: 0,
        lastVisit: inv.createdAt,
        lastPayment: "",
      }
    }
    balanceMap[inv.patientId].totalDue += inv.amount
    if (inv.createdAt > balanceMap[inv.patientId].lastVisit) {
      balanceMap[inv.patientId].lastVisit = inv.createdAt
    }
  }

  let balances = Object.values(balanceMap)

  // Apply search filter
  if (params.query) {
    const query = params.query.toLowerCase()
    balances = balances.filter(
      (b) =>
        b.patientName.toLowerCase().includes(query) ||
        b.phone.includes(query)
    )
  }

  // Filter: only show patients with balance > 0 if requested
  if (params.onlyWithBalance) {
    balances = balances.filter((b) => b.totalDue > 0)
  }

  // Sort by last visit desc
  balances.sort((a, b) => b.lastVisit.localeCompare(a.lastVisit))

  // Pagination
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedBalances = balances.slice(start, end)

  return {
    balances: paginatedBalances,
    total: balances.length,
    page,
    pageSize,
  }
}

export async function getPatientPaymentHistory(params: {
  clinicId: string
  patientId: string
}): Promise<PatientPaymentHistory> {
  await delay(200)

  const [paymentsRes, unpaidRes] = await Promise.all([
    listPaymentsFromStore({
      clinicId: params.clinicId,
      patientId: params.patientId,
      page: 1,
      pageSize: 500,
    }),
    listInvoices({
      clinicId: params.clinicId,
      patientId: params.patientId,
      status: "unpaid",
      page: 1,
      pageSize: 500,
    }),
  ])

  const payments = paymentsRes.payments.map(mapToAccountingPayment).sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt)
  )

  const unpaidCharges = unpaidRes.invoices.map((inv) => ({
    id: inv.id,
    appointmentId: inv.appointmentId || undefined,
    date: inv.createdAt,
    amount: inv.amount,
    status: "unpaid" as const,
  }))

  return {
    payments,
    unpaidCharges,
  }
}

/**
 * SUMMARY / REPORTS
 */

export async function getMonthlySummary(params: {
  clinicId: string
  month: string // YYYY-MM
}): Promise<MonthlySummary> {
  await delay(300)

  const startDate = `${params.month}-01`
  const endDate = `${params.month}-31` // Simplified

  const [paymentsResponse, expensesResponse, unpaidRes] = await Promise.all([
    listPayments({
      clinicId: params.clinicId,
      dateFrom: startDate,
      dateTo: endDate,
      page: 1,
      pageSize: 10000,
    }),
    listExpenses({
      clinicId: params.clinicId,
      dateFrom: startDate,
      dateTo: endDate,
      page: 1,
      pageSize: 10000,
    }),
    listInvoices({
      clinicId: params.clinicId,
      status: "unpaid",
      from: startDate,
      to: endDate,
      page: 1,
      pageSize: 10000,
    }),
  ])

  const paidPayments = paymentsResponse.payments.filter((p) => p.status === "paid")
  const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalExpenses = expensesResponse.expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0)
  const totalOutstanding = unpaidRes.invoices.reduce((sum, inv) => sum + inv.amount, 0)

  // Payment methods breakdown
  const paymentMethodBreakdown: Record<string, number> = {}
  paidPayments.forEach((p) => {
    paymentMethodBreakdown[p.method] = (paymentMethodBreakdown[p.method] || 0) + p.amount
  })

  return {
    month: params.month,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    totalOutstanding,
    paymentMethodBreakdown,
  }
}

/**
 * SETTINGS
 */

export async function getAccountingSettings(params: {
  clinicId: string
}): Promise<ClinicAccountingSettings> {
  await delay(100)

  if (!settingsStore[params.clinicId]) {
    // Return defaults
    settingsStore[params.clinicId] = {
      clinicId: params.clinicId,
      defaultFees: {
        follow_up: 300,
        new: 500,
        urgent: 700,
        online: 400,
      },
      allowCustomPricing: true,
    }
  }

  return settingsStore[params.clinicId]
}

export async function updateAccountingSettings(params: {
  clinicId: string
  settings: Partial<Omit<ClinicAccountingSettings, "clinicId">>
}): Promise<ClinicAccountingSettings> {
  await delay(200)

  const current = await getAccountingSettings({ clinicId: params.clinicId })

  const updated: ClinicAccountingSettings = {
    ...current,
    ...params.settings,
  }

  settingsStore[params.clinicId] = updated
  return updated
}

/**
 * INTEGRATIONS
 */

export async function getAccountingIntegration(params: {
  clinicId: string
}): Promise<AccountingIntegration | null> {
  await delay(100)

  return integrationStore[params.clinicId] || null
}

export async function updateAccountingIntegration(
  params: {
    clinicId: string
  },
  integration: AccountingIntegration
): Promise<AccountingIntegration> {
  await delay(200)

  integrationStore[params.clinicId] = integration
  return integration
}
