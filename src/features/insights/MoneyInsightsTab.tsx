"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { BarChart } from "@tremor/react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { getBadgeColor } from "@/lib/badgeColors"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { listPayments } from "@/api/payments.api"
import { listExpenses } from "@/api/expenses.api"
import { listInvoices } from "@/api/invoices.api"
import { listRefunds } from "@/api/accounting.api"
import { calculatePercentageChange } from "./insights.utils"
import type { DateRangePreset } from "@/features/accounting/components/AccountingToolbar"
import { startOfMonth, startOfToday } from "date-fns"
import type { PaymentMethod } from "@/types/payment"
import type { ExpenseCategory } from "@/types/expense"

export function getMoneyDateRange(preset: DateRangePreset) {
  if (preset === "all") return { from: undefined as string | undefined, to: undefined as string | undefined }

  const today = startOfToday()
  const todayStr = today.toISOString().split("T")[0]

  switch (preset) {
    case "today":
      return { from: todayStr, to: todayStr }
    case "7days": {
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return { from: sevenDaysAgo.toISOString().split("T")[0], to: todayStr }
    }
    case "30days": {
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return { from: thirtyDaysAgo.toISOString().split("T")[0], to: todayStr }
    }
    case "90days": {
      const ninetyDaysAgo = new Date(today)
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      return { from: ninetyDaysAgo.toISOString().split("T")[0], to: todayStr }
    }
    case "thismonth": {
      const monthStart = startOfMonth(today)
      return { from: monthStart.toISOString().split("T")[0], to: todayStr }
    }
    default:
      return { from: undefined, to: undefined }
  }
}

interface MoneyInsightsTabProps {
  dateRangePreset: DateRangePreset
}

type IncomeByChannel = Record<PaymentMethod | "refund", number>
type ExpenseByCategory = Record<ExpenseCategory, number>

function useMoneyInsights(clinicId: string, dateRangePreset: DateRangePreset, dateRange: { from?: string; to?: string }) {
  const [revenue, setRevenue] = useState<{ current: number; previous: number }>({ current: 0, previous: 0 })
  const [expenses, setExpenses] = useState<{ current: number; previous: number }>({ current: 0, previous: 0 })
  const [dues, setDues] = useState<{ current: number; previous: number }>({ current: 0, previous: 0 })
  const [incomeDistribution, setIncomeDistribution] = useState<IncomeByChannel>({
    cash: 0,
    visa: 0,
    instapay: 0,
    refund: 0,
  })
  const [expenseDistribution, setExpenseDistribution] = useState<ExpenseByCategory>({
    supplies: 0,
    rent: 0,
    salaries: 0,
    utilities: 0,
    marketing: 0,
    other: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      try {
        if (dateRangePreset === "all") {
          const [paymentsRes, expensesRes, invoicesRes, refundsRes] = await Promise.all([
            listPayments({ clinicId, pageSize: 10000 }),
            listExpenses({ clinicId, pageSize: 10000 }),
            listInvoices({ clinicId, status: "unpaid", pageSize: 10000 }),
            listRefunds({ clinicId, pageSize: 10000 }),
          ])
          const rev = paymentsRes.payments.reduce((s, p) => s + p.amount, 0)
          const exp = expensesRes.expenses.reduce((s, e) => s + e.amount, 0)
          const due = invoicesRes.invoices.reduce((s, i) => s + i.amount, 0)
          setRevenue({ current: rev, previous: 0 })
          setExpenses({ current: exp, previous: 0 })
          setDues({ current: due, previous: 0 })

          const incomeByChannel: IncomeByChannel = { cash: 0, visa: 0, instapay: 0, refund: 0 }
          paymentsRes.payments.forEach((p) => {
            incomeByChannel[p.method] = (incomeByChannel[p.method] ?? 0) + p.amount
          })
          const refundTotal = refundsRes.refunds.reduce((s, r) => s + r.amount, 0)
          incomeByChannel.refund = refundTotal
          setIncomeDistribution(incomeByChannel)

          const expByCat: ExpenseByCategory = {
            supplies: 0, rent: 0, salaries: 0, utilities: 0, marketing: 0, other: 0,
          }
          expensesRes.expenses.forEach((e) => {
            expByCat[e.category] = (expByCat[e.category] ?? 0) + e.amount
          })
          setExpenseDistribution(expByCat)
          return
        }
        if (!dateRange.from || !dateRange.to) {
          setRevenue({ current: 0, previous: 0 })
          setExpenses({ current: 0, previous: 0 })
          setDues({ current: 0, previous: 0 })
          setIncomeDistribution({ cash: 0, visa: 0, instapay: 0, refund: 0 })
          setExpenseDistribution({ supplies: 0, rent: 0, salaries: 0, utilities: 0, marketing: 0, other: 0 })
          return
        }

        const fromDate = new Date(dateRange.from)
        const toDate = new Date(dateRange.to)
        toDate.setHours(23, 59, 59, 999)
        const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
        const prevTo = new Date(fromDate)
        prevTo.setMilliseconds(-1)
        const prevFrom = new Date(prevTo)
        prevFrom.setDate(prevFrom.getDate() - daysDiff)

        const fromStr = fromDate.toISOString()
        const toStr = toDate.toISOString()
        const prevFromStr = prevFrom.toISOString()
        const prevToStr = prevTo.toISOString()

        const [
          currPayments,
          prevPayments,
          currExpenses,
          prevExpenses,
          currInvoices,
          prevInvoices,
          currRefunds,
        ] = await Promise.all([
          listPayments({ clinicId, from: fromStr, to: toStr, pageSize: 1000 }),
          listPayments({ clinicId, from: prevFromStr, to: prevToStr, pageSize: 1000 }),
          listExpenses({ clinicId, from: dateRange.from, to: dateRange.to, pageSize: 1000 }),
          listExpenses({ clinicId, from: prevFromStr.split("T")[0], to: prevToStr.split("T")[0], pageSize: 1000 }),
          listInvoices({ clinicId, status: "unpaid", from: dateRange.from, to: dateRange.to, pageSize: 1000 }),
          listInvoices({ clinicId, status: "unpaid", from: prevFromStr.split("T")[0], to: prevToStr.split("T")[0], pageSize: 1000 }),
          listRefunds({ clinicId, dateFrom: dateRange.from, dateTo: dateRange.to, pageSize: 1000 }),
        ])

        setRevenue({
          current: currPayments.payments.reduce((s, p) => s + p.amount, 0),
          previous: prevPayments.payments.reduce((s, p) => s + p.amount, 0),
        })
        setExpenses({
          current: currExpenses.expenses.reduce((s, e) => s + e.amount, 0),
          previous: prevExpenses.expenses.reduce((s, e) => s + e.amount, 0),
        })
        setDues({
          current: currInvoices.invoices.reduce((s, i) => s + i.amount, 0),
          previous: prevInvoices.invoices.reduce((s, i) => s + i.amount, 0),
        })

        const incomeByChannel: IncomeByChannel = { cash: 0, visa: 0, instapay: 0, refund: 0 }
        currPayments.payments.forEach((p) => {
          incomeByChannel[p.method] = (incomeByChannel[p.method] ?? 0) + p.amount
        })
        incomeByChannel.refund = currRefunds.refunds.reduce((s, r) => s + r.amount, 0)
        setIncomeDistribution(incomeByChannel)

        const expByCat: ExpenseByCategory = {
          supplies: 0, rent: 0, salaries: 0, utilities: 0, marketing: 0, other: 0,
        }
        currExpenses.expenses.forEach((e) => {
          expByCat[e.category] = (expByCat[e.category] ?? 0) + e.amount
        })
        setExpenseDistribution(expByCat)
      } catch (error) {
        console.error("Failed to fetch money insights:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [clinicId, dateRange.from, dateRange.to, dateRangePreset])

  return { revenue, expenses, dues, incomeDistribution, expenseDistribution, loading }
}

export function MoneyInsightsTab({ dateRangePreset }: MoneyInsightsTabProps) {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const clinicId = currentClinic?.id ?? "clinic-001"
  const dateRange = getMoneyDateRange(dateRangePreset)
  const { revenue, expenses, dues, incomeDistribution, expenseDistribution, loading } = useMoneyInsights(
    clinicId,
    dateRangePreset,
    dateRange
  )

  const revenueChange = calculatePercentageChange(revenue.current, revenue.previous)
  const expensesChange = calculatePercentageChange(expenses.current, expenses.previous)
  const duesChange = calculatePercentageChange(dues.current, dues.previous)

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="insight-card p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      label: t.insights.revenueCollected,
      value: revenue.current,
      change: revenueChange,
      positiveIsGood: true,
    },
    {
      label: t.accounting.out,
      value: expenses.current,
      change: expensesChange,
      positiveIsGood: false,
    },
    {
      label: t.accounting.dues,
      value: dues.current,
      change: duesChange,
      positiveIsGood: false,
    },
  ]

  const incomeChartLabels: Record<PaymentMethod | "refund", keyof typeof t.invoice> = {
    cash: "cash",
    visa: "visa",
    instapay: "instapay",
    refund: "refundBadge",
  }
  const incomeColors: Record<PaymentMethod | "refund", "emerald" | "blue" | "violet" | "red"> = {
    cash: "emerald",
    visa: "blue",
    instapay: "violet",
    refund: "red",
  }
  const incomeChartData = (["cash", "visa", "instapay", "refund"] as const)
    .filter((k) => incomeDistribution[k] > 0)
    .map((k) => ({
      name: t.invoice[incomeChartLabels[k]],
      value: incomeDistribution[k],
      color: incomeColors[k],
    }))

  const expenseChartLabels: Record<ExpenseCategory, keyof typeof t.expense> = {
    supplies: "categorySupplies",
    rent: "categoryRent",
    salaries: "categorySalaries",
    utilities: "categoryUtilities",
    marketing: "categoryMarketing",
    other: "categoryOther",
  }
  const expenseColors: Record<ExpenseCategory, "blue" | "cyan" | "indigo" | "violet" | "fuchsia" | "amber"> = {
    supplies: "blue",
    rent: "cyan",
    salaries: "indigo",
    utilities: "violet",
    marketing: "fuchsia",
    other: "amber",
  }
  const expenseChartData = (
    ["supplies", "rent", "salaries", "utilities", "marketing", "other"] as ExpenseCategory[]
  )
    .filter((k) => expenseDistribution[k] > 0)
    .map((k) => ({
      name: t.expense[expenseChartLabels[k]],
      value: expenseDistribution[k],
      color: expenseColors[k],
    }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const showBadge = card.change.value !== "0%"
          const badgeType = card.positiveIsGood
            ? (card.change.type === "positive" ? "success" : card.change.type === "negative" ? "error" : "neutral")
            : (card.change.type === "positive" ? "error" : card.change.type === "negative" ? "success" : "neutral")

          return (
            <Card key={card.label} className="insight-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    EGP {card.value.toLocaleString()}
                  </p>
                </div>
                {showBadge && (
                  <Badge color={getBadgeColor(badgeType)} size="xs">
                    {card.change.value}
                  </Badge>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="insight-card p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t.insights.incomeChannelDistribution}
          </h3>
          {incomeChartData.length > 0 ? (
            <BarChart
              data={incomeChartData}
              index="name"
              categories={["value"]}
              colors={["emerald"]}
              layout="horizontal"
              valueFormatter={(v) => `EGP ${Number(v).toLocaleString()}`}
              yAxisWidth={100}
              showLegend={false}
              showGridLines={true}
              barCategoryGap="40%"
              className="h-64 mt-2"
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              {t.insights.noDistributionData}
            </p>
          )}
        </Card>

        <Card className="insight-card p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t.insights.expensesDistribution}
          </h3>
          {expenseChartData.length > 0 ? (
            <BarChart
              data={expenseChartData}
              index="name"
              categories={["value"]}
              colors={["blue"]}
              layout="horizontal"
              valueFormatter={(v) => `EGP ${Number(v).toLocaleString()}`}
              yAxisWidth={100}
              showLegend={false}
              showGridLines={true}
              barCategoryGap="40%"
              className="h-64 mt-2"
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              {t.insights.noDistributionData}
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
