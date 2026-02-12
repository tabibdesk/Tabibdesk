import { mockData } from "@/data/mock/mock-data"
import type { IExpensesRepository, CreateExpensePayload, ListExpensesParams } from "../../interfaces/expenses.interface"
import type { Expense } from "@/types/expense"

let expensesStore: Expense[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    expensesStore = mockData.expenses.map((e) => ({
      id: e.id,
      clinic_id: e.clinic_id,
      vendor_id: e.vendor_id,
      amount: e.amount,
      description: e.description,
      category: e.category,
      date: e.date,
      created_at: e.created_at,
    }))
    initialized = true
  }
}

function generateId(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockExpensesRepository implements IExpensesRepository {
  async list(params: ListExpensesParams): Promise<Expense[]> {
    initStore()
    let filtered = expensesStore.filter((e) => e.clinic_id === params.clinic_id)

    if (params.from) {
      const fromDate = new Date(params.from)
      filtered = filtered.filter((e) => new Date(e.date || e.created_at) >= fromDate)
    }

    if (params.to) {
      const toDate = new Date(params.to)
      filtered = filtered.filter((e) => new Date(e.date || e.created_at) <= toDate)
    }

    return filtered.sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime())
  }

  async getById(id: string): Promise<Expense | null> {
    initStore()
    return expensesStore.find((e) => e.id === id) || null
  }

  async create(payload: CreateExpensePayload): Promise<Expense> {
    initStore()
    const expense: Expense = {
      id: generateId(),
      clinic_id: payload.clinic_id,
      vendor_id: payload.vendor_id,
      amount: payload.amount,
      description: payload.description,
      category: payload.category,
      date: payload.date || new Date().toISOString(),
      created_at: new Date().toISOString(),
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
