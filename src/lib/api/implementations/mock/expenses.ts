import type { IExpensesRepository, CreateExpensePayload, ListExpensesParams } from "../../interfaces/expenses.interface"
import type { Expense } from "@/types/expense"

let expensesStore: Expense[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    expensesStore = []
    initialized = true
  }
}

function generateId(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockExpensesRepository implements IExpensesRepository {
  async list(params: ListExpensesParams): Promise<Expense[]> {
    initStore()
    let filtered = expensesStore.filter((e) => e.clinicId === params.clinic_id)

    if (params.from) {
      const fromDate = new Date(params.from)
      filtered = filtered.filter((e) => new Date(e.createdAt) >= fromDate)
    }

    if (params.to) {
      const toDate = new Date(params.to)
      filtered = filtered.filter((e) => new Date(e.createdAt) <= toDate)
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getById(id: string): Promise<Expense | null> {
    initStore()
    return expensesStore.find((e) => e.id === id) || null
  }

  async create(payload: CreateExpensePayload): Promise<Expense> {
    initStore()
    const now = new Date().toISOString()
    const expense: Expense = {
      id: generateId(),
      clinicId: payload.clinic_id,
      amount: payload.amount,
      category: (payload.category ?? "other") as Expense["category"],
      method: "cash",
      vendorName: payload.vendor_id || undefined,
      note: payload.description || undefined,
      createdByUserId: "",
      createdAt: now,
    }
    expensesStore.push(expense)
    return expense
  }

  async update(id: string, updates: Partial<Expense>): Promise<Expense> {
    initStore()
    const index = expensesStore.findIndex((e) => e.id === id)
    if (index === -1) throw new Error("Expense not found")
    expensesStore[index] = { ...expensesStore[index], ...updates }
    return expensesStore[index]
  }

  async delete(id: string): Promise<void> {
    initStore()
    expensesStore = expensesStore.filter((e) => e.id !== id)
  }
}
