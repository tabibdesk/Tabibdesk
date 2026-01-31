"use client"

import { Card } from "@/components/Card"
import { Badge } from "@/components/Badge"
import type { Expense } from "../accounting.types"
import { formatCurrency, formatDate, getExpenseCategoryLabel } from "../accounting.utils"

interface ExpenseListProps {
  expenses: Expense[]
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No expenses recorded</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card key={expense.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge color="gray" size="xs">{getExpenseCategoryLabel(expense.category)}</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(expense.date)}
                </span>
              </div>
              <p className="mt-1 font-medium text-gray-900 dark:text-gray-50">
                {expense.vendor}
              </p>
              {expense.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {expense.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-gray-50">
                {formatCurrency(expense.amount)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {expense.paymentMethod}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
