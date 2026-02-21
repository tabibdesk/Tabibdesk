export type ExpenseCategory =
  | "supplies"
  | "rent"
  | "salaries"
  | "utilities"
  | "marketing"
  | "other";

export type ExpenseMethod = "cash" | "instapay" | "transfer";

export interface Expense {
  id: string
  clinicId: string
  amount: number
  category: ExpenseCategory
  method: ExpenseMethod
  vendorName?: string
  note?: string
  receiptFileId?: string
  createdByUserId: string
  createdAt: string
  /** For marketing/ad spend: campaign period start (YYYY-MM-DD). Used for cost-per-lead. */
  dateFrom?: string
  /** For marketing/ad spend: campaign period end (YYYY-MM-DD). Used for cost-per-lead. */
  dateTo?: string
}
