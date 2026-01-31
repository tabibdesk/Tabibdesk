/**
 * Expenses API - Expense management
 * Mock implementation, backend-replaceable
 */

import type { Expense, ExpenseCategory, ExpenseMethod } from "@/types/expense"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory store
const expensesStore: Expense[] = []

/**
 * Initialize mock expenses
 * Creates sample expenses for the current month
 */
function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function initializeMockExpenses() {
  if (expensesStore.length > 0) return // Already initialized

  const mockExpenses: Expense[] = [
    {
      id: "exp_mock_001",
      clinicId: "clinic-001",
      amount: 1500,
      category: "supplies",
      method: "cash",
      vendorName: "Memphis Medical Supplies",
      note: "Medical supplies and consumables",
      receiptFileId: "receipt_001",
      createdByUserId: "user-001",
      createdAt: daysAgo(2),
    },
    {
      id: "exp_mock_002",
      clinicId: "clinic-001",
      amount: 5000,
      category: "rent",
      method: "transfer",
      vendorName: "Mokattam Properties",
      note: "Monthly clinic rent",
      createdByUserId: "user-001",
      createdAt: daysAgo(1),
    },
    {
      id: "exp_mock_003",
      clinicId: "clinic-001",
      amount: 800,
      category: "utilities",
      method: "cash",
      vendorName: "Cairo Electricity Company",
      note: "Monthly electricity bill",
      createdByUserId: "user-001",
      createdAt: daysAgo(5),
    },
    {
      id: "exp_mock_004",
      clinicId: "clinic-001",
      amount: 1200,
      category: "marketing",
      method: "instapay",
      vendorName: "Cairo Digital Marketing",
      note: "Social media ads campaign",
      receiptFileId: "receipt_004",
      createdByUserId: "user-001",
      createdAt: daysAgo(7),
    },
    {
      id: "exp_mock_005",
      clinicId: "clinic-001",
      amount: 3500,
      category: "salaries",
      method: "transfer",
      vendorName: "Staff Salaries",
      note: "Monthly staff salaries",
      createdByUserId: "user-001",
      createdAt: daysAgo(1),
    },
    {
      id: "exp_mock_006",
      clinicId: "clinic-001",
      amount: 450,
      category: "supplies",
      method: "cash",
      vendorName: "Delta Pharma",
      note: "Pharmaceutical supplies",
      createdByUserId: "user-001",
      createdAt: daysAgo(10),
    },
  ]

  expensesStore.push(...mockExpenses)
}

// Initialize on module load
initializeMockExpenses()

export interface CreateExpenseParams {
  clinicId: string
  amount: number
  category: ExpenseCategory
  method: ExpenseMethod
  vendorName?: string
  note?: string
  receiptFileId?: string
  createdByUserId: string
}

export interface ListExpensesParams {
  clinicId: string
  from?: string
  to?: string
  query?: string
  category?: ExpenseCategory
  method?: ExpenseMethod
  vendorName?: string
  page?: number
  pageSize?: number
}

export interface ListExpensesResponse {
  expenses: Expense[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Create an expense
 */
export async function createExpense(params: CreateExpenseParams): Promise<Expense> {
  await delay(300)
  
  const expense: Expense = {
    id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clinicId: params.clinicId,
    amount: params.amount,
    category: params.category,
    method: params.method,
    vendorName: params.vendorName,
    note: params.note,
    receiptFileId: params.receiptFileId,
    createdByUserId: params.createdByUserId,
    createdAt: new Date().toISOString(),
  }
  
  expensesStore.push(expense)
  return expense
}

/**
 * List expenses with filtering and pagination
 */
export async function listExpenses(params: ListExpensesParams): Promise<ListExpensesResponse> {
  await delay(200)

  const clinicId = params.clinicId?.trim() || "clinic-001"

  // Ensure initialization has run
  if (expensesStore.length === 0) {
    initializeMockExpenses()
  }

  let filtered = expensesStore.filter((e) => e.clinicId === clinicId)
  
  // Filter by category
  if (params.category) {
    filtered = filtered.filter((e) => e.category === params.category)
  }
  
  // Filter by method
  if (params.method) {
    filtered = filtered.filter((e) => e.method === params.method)
  }
  
  // Filter by vendor name
  if (params.vendorName) {
    const vendorLower = params.vendorName.toLowerCase()
    filtered = filtered.filter((e) =>
      e.vendorName?.toLowerCase().includes(vendorLower)
    )
  }
  
  // Filter by date range (compare date strings, not full timestamps)
  if (params.from) {
    const fromDate = params.from.split("T")[0] // Get YYYY-MM-DD part
    filtered = filtered.filter((e) => {
      const expDate = e.createdAt.split("T")[0]
      return expDate >= fromDate
    })
  }
  if (params.to) {
    const toDate = params.to.split("T")[0] // Get YYYY-MM-DD part
    filtered = filtered.filter((e) => {
      const expDate = e.createdAt.split("T")[0]
      return expDate <= toDate
    })
  }
  
  // Filter by query (search in vendor name or note)
  if (params.query) {
    const queryLower = params.query.toLowerCase()
    filtered = filtered.filter((e) =>
      e.vendorName?.toLowerCase().includes(queryLower) ||
      e.note?.toLowerCase().includes(queryLower)
    )
  }
  
  // Sort by date desc
  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  
  // Pagination
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedExpenses = filtered.slice(start, end)
  
  return {
    expenses: paginatedExpenses,
    total: filtered.length,
    page,
    pageSize,
    hasMore: end < filtered.length,
  }
}

/**
 * Get expense by ID
 */
export async function getExpenseById(expenseId: string): Promise<Expense | null> {
  await delay(100)
  
  const expense = expensesStore.find((e) => e.id === expenseId)
  return expense || null
}
