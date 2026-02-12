import type { Expense } from "@/types/expense"

export interface CreateExpensePayload {
  clinic_id: string
  vendor_id: string
  amount: number
  description: string
  category?: string
  date?: string
}

export interface ListExpensesParams {
  clinic_id: string
  from?: string
  to?: string
}

export interface IExpensesRepository {
  list(params: ListExpensesParams): Promise<Expense[]>
  getById(id: string): Promise<Expense | null>
  create(payload: CreateExpensePayload): Promise<Expense>
  update(id: string, updates: Partial<Expense>): Promise<Expense>
  delete(id: string): Promise<void>
}
