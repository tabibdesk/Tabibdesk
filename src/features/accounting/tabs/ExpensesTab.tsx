"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Skeleton } from "@/components/Skeleton"
import { useExpenses } from "../hooks/useExpenses"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { AccountingToolbar, type DateRangePreset } from "../components/AccountingToolbar"
import { startOfMonth, startOfToday } from "date-fns"
import { RiAddLine, RiFileLine, RiShoppingBagLine } from "@remixicon/react"
import { AddExpenseDrawer } from "../components/AddExpenseDrawer"
import { ProofViewerModal } from "../components/ProofViewerModal"
import type { Expense } from "@/types/expense"

interface ExpensesTabProps {
  dateRangePreset: DateRangePreset
}

export function ExpensesTab({ dateRangePreset }: ExpensesTabProps) {
  const { currentClinic } = useUserClinic()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedReceiptFileId, setSelectedReceiptFileId] = useState<string | undefined>(undefined)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const getDateRange = () => {
    if (dateRangePreset === "all") {
      return { from: undefined, to: undefined }
    }

    const today = startOfToday()
    const todayStr = today.toISOString().split("T")[0]

    switch (dateRangePreset) {
      case "today":
        return { from: todayStr, to: todayStr }
      case "7days":
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return { from: sevenDaysAgo.toISOString().split("T")[0], to: todayStr }
      case "30days":
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return { from: thirtyDaysAgo.toISOString().split("T")[0], to: todayStr }
      case "90days":
        const ninetyDaysAgo = new Date(today)
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        return { from: ninetyDaysAgo.toISOString().split("T")[0], to: todayStr }
      case "thismonth":
        const monthStart = startOfMonth(today)
        return { from: monthStart.toISOString().split("T")[0], to: todayStr }
      default:
        return { from: undefined, to: undefined }
    }
  }

  const dateRange = getDateRange()
  const { data, loading, error, refetch } = useExpenses({
    clinicId: currentClinic?.id || "clinic-001",
    from: dateRange.from,
    to: dateRange.to,
    query: debouncedSearch || undefined,
    page: 1,
    pageSize: 20,
  })

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const expenses = data?.expenses || []
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const suppliesTotal = expenses.filter((e) => e.category === "supplies").reduce((sum, e) => sum + e.amount, 0)
  const rentTotal = expenses.filter((e) => e.category === "rent").reduce((sum, e) => sum + e.amount, 0)
  const salariesTotal = expenses.filter((e) => e.category === "salaries").reduce((sum, e) => sum + e.amount, 0)
  const otherTotal = expenses.filter((e) => !["supplies", "rent", "salaries"].includes(e.category)).reduce((sum, e) => sum + e.amount, 0)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600 dark:text-red-400">Error loading expenses: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-semibold">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-xl sm:text-2xl font-bold break-words">{totalExpenses.toFixed(2)} EGP</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-semibold">Supplies</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-xl sm:text-2xl font-bold break-words">{suppliesTotal.toFixed(2)} EGP</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-semibold">Rent</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-xl sm:text-2xl font-bold break-words">{rentTotal.toFixed(2)} EGP</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-semibold">Salaries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-xl sm:text-2xl font-bold break-words">{salariesTotal.toFixed(2)} EGP</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-semibold">Other</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-xl sm:text-2xl font-bold break-words">{otherTotal.toFixed(2)} EGP</p>}
          </CardContent>
        </Card>
      </div>

      {/* Search Bar and Add Button - Always visible */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <AccountingToolbar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </div>
        <Button variant="secondary" onClick={() => setShowAddModal(true)} className="w-full sm:w-auto shrink-0 md:h-9 md:py-1.5 md:text-sm">
          <RiAddLine className="mr-2 size-4" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Expenses List */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RiShoppingBagLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {searchQuery ? "No expenses found matching your search." : "No expenses found"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Vendor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(expense.createdAt)}</td>
                      <td className="px-4 py-4">
                        <span className="text-sm capitalize">{expense.category}</span>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">{expense.amount.toFixed(2)} EGP</td>
                      <td className="px-4 py-4">
                        <span className="text-sm capitalize">{expense.method}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{expense.vendorName || "—"}</td>
                      <td className="px-4 py-4">
                        {expense.receiptFileId && (
                          <button
                            onClick={() => {
                              setSelectedReceiptFileId(expense.receiptFileId)
                              setShowReceiptModal(true)
                            }}
                            className="cursor-pointer hover:opacity-70 transition-opacity"
                            title="View receipt"
                          >
                            <RiFileLine className="size-5 text-primary-600 dark:text-primary-400" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {expenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium capitalize break-words">{expense.category}</p>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(expense.createdAt)}
                      </div>
                      {expense.vendorName && (
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 break-words">{expense.vendorName}</div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold whitespace-nowrap">{expense.amount.toFixed(2)} EGP</p>
                      <p className="text-xs capitalize text-gray-600 dark:text-gray-400">{expense.method}</p>
                    </div>
                  </div>
                  {expense.receiptFileId && (
                    <button
                      onClick={() => {
                        setSelectedReceiptFileId(expense.receiptFileId)
                        setShowReceiptModal(true)
                      }}
                      className="mt-2 flex items-center gap-2 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 cursor-pointer"
                    >
                      <RiFileLine className="size-4 shrink-0" />
                      <span>View receipt</span>
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <AddExpenseDrawer
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => {
          refetch()
          setShowAddModal(false)
        }}
      />

      <ProofViewerModal
        open={showReceiptModal}
        onOpenChange={setShowReceiptModal}
        fileId={selectedReceiptFileId}
        title="Receipt"
      />
    </div>
  )
}
