import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IExpensesRepository, CreateExpensePayload, ListExpensesParams } from "../../interfaces/expenses.interface"
import type { Expense } from "@/types/expense"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToExpense(row: Record<string, unknown>): Expense {
  return {
    id: String(row.id),
    clinicId: String(row.clinic_id),
    amount: Number(row.amount),
    category: String(row.category) as Expense["category"],
    method: "cash",
    vendorName: row.vendor_id != null ? String(row.vendor_id) : undefined,
    note: row.description != null ? String(row.description) : undefined,
    createdByUserId: "",
    createdAt: String(row.created_at ?? row.date),
  }
}

export class SupabaseExpensesRepository implements IExpensesRepository {
  async list(params: ListExpensesParams): Promise<Expense[]> {
    let query = supabase.from("expenses").select("*").eq("clinic_id", params.clinic_id)

    if (params.from) {
      query = query.gte("date", params.from)
    }

    if (params.to) {
      query = query.lte("date", params.to)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) throw new Error(`Failed to list expenses: ${error.message}`)
    return (data || []).map(mapRowToExpense)
  }

  async getById(id: string): Promise<Expense | null> {
    const { data, error } = await supabase.from("expenses").select("*").eq("id", id).single()

    if (error && error.code !== "PGRST116") throw error
    return data ? mapRowToExpense(data) : null
  }

  async create(payload: CreateExpensePayload): Promise<Expense> {
    const insertPayload = {
      clinic_id: payload.clinic_id,
      vendor_id: payload.vendor_id,
      amount: payload.amount,
      description: payload.description,
      category: payload.category,
      date: payload.date,
    }
    const { data, error } = await (supabase as any)
      .from("expenses")
      .insert(insertPayload)
      .select()
      .single()

    if (error) throw new Error(`Failed to create expense: ${error.message}`)
    return mapRowToExpense(data)
  }

  async update(id: string, updates: Partial<Expense>): Promise<Expense> {
    const { data, error } = await (supabase as any).from("expenses").update(updates).eq("id", id).select().single()

    if (error) throw new Error(`Failed to update expense: ${error.message}`)
    return mapRowToExpense(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("expenses").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete expense: ${error.message}`)
  }
}
