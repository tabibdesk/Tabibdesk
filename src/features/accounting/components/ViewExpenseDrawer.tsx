"use client"

import { useState } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useLocale } from "@/contexts/locale-context"
import { ProofViewerModal } from "./ProofViewerModal"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"
import { Button } from "@/components/Button"
import type { Expense, ExpenseCategory, ExpenseMethod } from "@/types/expense"
import type { AppTranslations } from "@/lib/app-translations"
import { RiFileLine } from "@remixicon/react"

const EXPENSE_CATEGORY_KEYS: Record<ExpenseCategory, keyof AppTranslations["expense"]> = {
  supplies: "categorySupplies",
  rent: "categoryRent",
  salaries: "categorySalaries",
  utilities: "categoryUtilities",
  marketing: "categoryMarketing",
  other: "categoryOther",
}
const EXPENSE_METHOD_KEYS: Record<ExpenseMethod, keyof AppTranslations["expense"]> = {
  cash: "methodCash",
  instapay: "methodInstapay",
  transfer: "methodTransfer",
}

interface ViewExpenseDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ViewExpenseDrawer({
  open,
  onOpenChange,
  expense,
}: ViewExpenseDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const [showProofModal, setShowProofModal] = useState(false)

  if (!expense) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>{t.expense.expenseDetails}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-600 dark:text-gray-400">{t.table.date}</dt>
                  <dd className="font-medium">{formatDate(expense.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-600 dark:text-gray-400">{t.table.category}</dt>
                  <dd className="font-medium">{t.expense[EXPENSE_CATEGORY_KEYS[expense.category]]}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-600 dark:text-gray-400">{t.table.amount}</dt>
                  <dd className="font-medium">{expense.amount.toFixed(2)} EGP</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-600 dark:text-gray-400">{t.table.method}</dt>
                  <dd className="font-medium">{t.expense[EXPENSE_METHOD_KEYS[expense.method]]}</dd>
                </div>
                {expense.vendorName && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-600 dark:text-gray-400">{t.table.vendor}</dt>
                    <dd className="font-medium">{expense.vendorName}</dd>
                  </div>
                )}
                {expense.note && (
                  <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                    <dt className="text-gray-600 dark:text-gray-400 mb-1">{t.expense.description}</dt>
                    <dd className="text-gray-900 dark:text-gray-50">{expense.note}</dd>
                  </div>
                )}
                {expense.receiptFileId && (
                  <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                    <dt className="text-gray-600 dark:text-gray-400 mb-1">{t.expense.receipt}</dt>
                    <dd>
                      <button
                        type="button"
                        onClick={() => setShowProofModal(true)}
                        className="flex items-center gap-2 text-primary-600 hover:opacity-80 dark:text-primary-400"
                      >
                        <RiFileLine className="size-4" />
                        {t.expense.viewReceipt}
                      </button>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.close}
          </Button>
        </DrawerFooter>
      </DrawerContent>

      <ProofViewerModal
        open={showProofModal}
        onOpenChange={setShowProofModal}
        fileId={expense.receiptFileId}
        title={t.expense.receipt}
      />
    </Drawer>
  )
}
