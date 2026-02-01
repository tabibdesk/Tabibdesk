export type PaymentMethod = 'cash' | 'instapay' | 'credit_card' | 'bank_transfer'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'pending_approval' | 'refunded' | 'cancelled'
export type ExpenseCategory = 'supplies' | 'equipment' | 'rent' | 'utilities' | 'salaries' | 'marketing' | 'other'

export interface Payment {
  id: string
  clinicId: string
  appointmentId?: string | null
  patientId: string
  patientName?: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  reference?: string
  evidenceUrl?: string
  notes?: string
  createdAt: string
  updatedAt?: string
  createdByUserId: string
  approvedAt?: string | null
  approvedByUserId?: string | null
}

export interface AppointmentCharge {
  id: string
  appointmentId: string
  baseAmount: number
  discountAmount: number
  finalAmount: number
  currency: 'EGP'
  notes?: string | null
}

export interface ClinicAccountingSettings {
  clinicId: string
  defaultFees: Record<string, number>
  allowCustomPricing: boolean
}

export interface Expense {
  id: string
  clinicId: string
  category: ExpenseCategory
  amount: number
  vendor?: string
  description?: string
  paymentMethod: PaymentMethod
  date: string
  receiptUrl?: string
  createdAt: string
  createdByUserId: string
}

export interface CashierRow {
  appointmentId: string
  time: string
  patientId: string
  patientName: string
  appointmentStatus: string
  feeAmount: number
  paymentStatus: "paid" | "unpaid" | "pending_approval"
  paymentMethod?: PaymentMethod
  paymentAmount?: number
  paymentReference?: string
  paymentId?: string
  evidenceUrl?: string
}

export interface PatientBalance {
  patientId: string
  patientName: string
  phone: string
  totalDue: number
  lastVisit: string
  lastPayment: string
}

export interface PatientPaymentHistory {
  payments: Payment[]
  unpaidCharges: Array<{
    id: string
    appointmentId?: string
    date: string
    amount: number
    status: PaymentStatus
  }>
}

export interface MonthlySummary {
  month: string
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  totalOutstanding: number
  paymentMethodBreakdown: Record<string, number>
}

export type AccountingProvider = 'none' | 'akaunting' | 'frappe'

export interface AccountingIntegration {
  clinicId: string
  provider: AccountingProvider
  enabled: boolean
  apiBaseUrl?: string
  apiKey?: string
  syncMode: 'manual' | 'auto'
  lastSyncAt?: string | null
}

export interface CreatePaymentInput {
  clinicId: string
  appointmentId?: string
  patientId: string
  patientName?: string
  amount: number
  method: PaymentMethod
  status?: PaymentStatus
  reference?: string
  evidenceUrl?: string
  notes?: string
  createdByUserId: string
}

export interface UpdatePaymentInput {
  status?: PaymentStatus
  amount?: number
  method?: PaymentMethod
  reference?: string
  notes?: string
}

export interface CreateExpenseInput {
  clinicId: string
  category: ExpenseCategory
  amount: number
  vendor?: string
  description?: string
  paymentMethod: PaymentMethod
  date: string
  receiptUrl?: string
  createdByUserId: string
}

export interface ListPaymentsParams {
  clinicId: string
  patientId?: string
  appointmentId?: string
  status?: PaymentStatus
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface ListPaymentsResponse {
  payments: Payment[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ListExpensesParams {
  clinicId: string
  category?: ExpenseCategory
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface ListExpensesResponse {
  expenses: Expense[]
  total: number
  page: number
  pageSize: number
}

export interface ListBalancesParams {
  clinicId: string
  query?: string
  onlyWithBalance?: boolean
  page?: number
  pageSize?: number
}

export interface ListBalancesResponse {
  balances: PatientBalance[]
  total: number
  page: number
  pageSize: number
}

export interface GetTodayCashierRowsParams {
  clinicId: string
  date: string
}

// Refunds (invoice-scoped); method shared with payments (PaymentMethod from types/payment)
export type RefundPaymentMethod = import("@/types/payment").PaymentMethod

export interface Refund {
  id: string
  clinicId: string
  invoiceId: string
  patientId: string
  patientName?: string
  amount: number
  method: RefundPaymentMethod
  reason?: string
  proofFileId?: string
  createdAt: string
  createdByUserId: string
}

export interface CreateRefundInput {
  clinicId: string
  invoiceId: string
  amount: number
  method: RefundPaymentMethod
  reason?: string
  proofFileId?: string
  createdByUserId: string
}

export interface InvoiceRefundSummary {
  invoiceId: string
  invoiceTotal: number
  invoicePaid: number
  invoiceRefunded: number
  refundable: number
}

export interface ListRefundsParams {
  clinicId: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface ListRefundsResponse {
  refunds: Refund[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
