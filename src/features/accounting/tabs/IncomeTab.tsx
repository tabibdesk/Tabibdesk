"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Skeleton } from "@/components/Skeleton"
import { Badge } from "@/components/Badge"
import { usePayments } from "../hooks/usePayments"
import { useRefunds } from "../hooks/useRefunds"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { AccountingToolbar, type DateRangePreset } from "../components/AccountingToolbar"
import { startOfToday } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/Button"
import { RiAddLine, RiFileLine, RiMoneyDollarCircleLine, RiEyeLine } from "@remixicon/react"
import { mockData } from "@/data/mock/mock-data"
import { ProofViewerModal } from "../components/ProofViewerModal"
import type { Payment } from "@/types/payment"
import type { Refund } from "@/features/accounting/accounting.types"
import type { Invoice } from "@/types/invoice"
import { InvoiceDrawer } from "../components/InvoiceDrawer"
import { ViewInvoiceDrawer } from "../components/ViewInvoiceDrawer"
import { getInvoiceById } from "@/api/invoices.api"

type IncomeEntry =
  | { type: "payment"; id: string; date: string; payment: Payment }
  | { type: "refund"; id: string; date: string; refund: Refund }

interface IncomeTabProps {
  dateRangePreset: DateRangePreset
}

export function IncomeTab({ dateRangePreset }: IncomeTabProps) {
  const t = useAppTranslations()
  const { currentClinic, currentUser } = useUserClinic()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedProofFileId, setSelectedProofFileId] = useState<string | undefined>(undefined)
  const [showProofModal, setShowProofModal] = useState(false)
  const [showCaptureDrawer, setShowCaptureDrawer] = useState(false)
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null)
  const [showViewInvoiceDrawer, setShowViewInvoiceDrawer] = useState(false)

  // Calculate date range
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
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        return { from: monthStart.toISOString().split("T")[0], to: todayStr }
      default:
        return { from: undefined, to: undefined }
    }
  }

  const dateRange = getDateRange()
  const { data, loading, error, refetch } = usePayments({
    clinicId: currentClinic?.id || "clinic-001",
    from: dateRange.from,
    to: dateRange.to,
    query: debouncedSearch || undefined,
    page: 1,
    pageSize: 50,
  })
  const {
    data: refundsData,
    loading: refundsLoading,
    error: refundsError,
    refetch: refetchRefunds,
  } = useRefunds({
    clinicId: currentClinic?.id || "clinic-001",
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
    page: 1,
    pageSize: 50,
  })

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const payments = data?.payments || []
  const refunds: Refund[] = refundsData?.refunds || []
  const loadingAny = loading || refundsLoading
  const errorAny = error || refundsError

  const entries: IncomeEntry[] = [
    ...payments.map((p) => ({
      type: "payment" as const,
      id: p.id,
      date: p.createdAt,
      payment: p,
    })),
    ...refunds.map((r: Refund) => ({
      type: "refund" as const,
      id: r.id,
      date: r.createdAt,
      refund: r,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalRefunded = refunds.reduce((sum: number, r: Refund) => sum + r.amount, 0)
  const netIncome = totalCollected - totalRefunded
  const cashTotal = payments.filter((p) => p.method === "cash").reduce((sum, p) => sum + p.amount, 0)
  const visaTotal = payments.filter((p) => p.method === "visa").reduce((sum, p) => sum + p.amount, 0)
  const instapayTotal = payments.filter((p) => p.method === "instapay").reduce((sum, p) => sum + p.amount, 0)

  const handleViewInvoice = async (invoiceId: string) => {
    const inv = await getInvoiceById(invoiceId)
    if (inv) {
      setSelectedInvoiceForView(inv)
      setShowViewInvoiceDrawer(true)
    }
  }

  // Get patient names
  const getPatientName = (patientId: string) => {
    const patient = mockData.patients.find((p) => p.id === patientId)
    return patient ? `${patient.first_name} ${patient.last_name}` : "Unknown"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (errorAny) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600 dark:text-red-400">
            Error loading income: {(errorAny as Error).message}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-semibold">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAny ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold break-words">{netIncome.toFixed(2)} EGP</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-semibold">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAny ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold break-words">{totalCollected.toFixed(2)} EGP</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-semibold">{t.invoice.refundBadge}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAny ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold break-words text-red-600 dark:text-red-400">
                -{totalRefunded.toFixed(2)} EGP
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-semibold">Cash</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAny ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold break-words">{cashTotal.toFixed(2)} EGP</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search Bar and Capture Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0 w-full">
          <AccountingToolbar searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} searchPlaceholder={t.accounting.searchIncome} />
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowCaptureDrawer(true)}
          className="w-full sm:w-auto shrink-0 md:h-9 md:py-1.5 md:text-sm inline-flex items-center gap-2 rtl:flex-row-reverse"
        >
          <RiAddLine className="size-4" />
          <span>{t.accounting.capture}</span>
        </Button>
      </div>

      {/* Income List (payments + refunds) */}
      {loadingAny ? (
        <Card>
          <CardContent className="py-12">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RiMoneyDollarCircleLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {searchQuery ? "No income entries found matching your search." : "No income entries found"}
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
                    <th className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-gray-50">{t.table.date}</th>
                    <th className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-gray-50">{t.table.patient}</th>
                    <th className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-gray-50">{t.table.amount}</th>
                    <th className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-gray-50">{t.table.method}</th>
                    <th className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-gray-50">{t.table.proof}</th>
                    <th className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-gray-50">{t.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                  {entries.map((entry) =>
                    entry.type === "payment" ? (
                      <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(entry.payment.createdAt)}</td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/patients/${entry.payment.patientId}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            {getPatientName(entry.payment.patientId)}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium">{entry.payment.amount.toFixed(2)} EGP</td>
                        <td className="px-4 py-4">
                          <span className="text-sm capitalize">{entry.payment.method}</span>
                        </td>
                        <td className="px-4 py-4">
                          {entry.payment.proofFileId && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProofFileId(entry.payment.proofFileId)
                                setShowProofModal(true)
                              }}
                              className="cursor-pointer hover:opacity-70 transition-opacity"
                              title={t.invoice.viewProof}
                            >
                              <RiFileLine className="size-5 text-primary-600 dark:text-primary-400" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewInvoice(entry.payment.invoiceId)}
                              className="text-xs p-1.5"
                              title={t.invoice.viewInvoice}
                              aria-label={t.invoice.viewInvoice}
                            >
                              <RiEyeLine className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(entry.refund.createdAt)}</td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/patients/${entry.refund.patientId}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            {entry.refund.patientName ?? getPatientName(entry.refund.patientId)}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">-{entry.refund.amount.toFixed(2)} EGP</span>
                          <Badge color="neutral" size="xs" className="ms-2">{t.invoice.refundBadge}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm capitalize">{entry.refund.method}</span>
                        </td>
                        <td className="px-4 py-4">
                          {entry.refund.proofFileId && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProofFileId(entry.refund.proofFileId)
                                setShowProofModal(true)
                              }}
                              className="cursor-pointer hover:opacity-70 transition-opacity"
                              title={t.invoice.viewProof}
                            >
                              <RiFileLine className="size-5 text-primary-600 dark:text-primary-400" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(entry.refund.invoiceId)}
                            className="text-xs p-1.5"
                            title={t.invoice.viewInvoice}
                            aria-label={t.invoice.viewInvoice}
                          >
                            <RiEyeLine className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {entries.map((entry) =>
              entry.type === "payment" ? (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/patients/${entry.payment.patientId}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 break-words"
                        >
                          {getPatientName(entry.payment.patientId)}
                        </Link>
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(entry.payment.createdAt)}
                        </div>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="text-sm font-semibold whitespace-nowrap">{entry.payment.amount.toFixed(2)} EGP</p>
                        <p className="text-xs capitalize text-gray-600 dark:text-gray-400">{entry.payment.method}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInvoice(entry.payment.invoiceId)}
                        className="text-xs p-1.5"
                        title={t.invoice.viewInvoice}
                        aria-label={t.invoice.viewInvoice}
                      >
                        <RiEyeLine className="size-4" />
                      </Button>
                      {entry.payment.proofFileId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProofFileId(entry.payment.proofFileId)
                            setShowProofModal(true)
                          }}
                          className="flex items-center gap-2 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 cursor-pointer"
                        >
                          <RiFileLine className="size-4 shrink-0" />
                          <span>{t.invoice.viewProof}</span>
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/patients/${entry.refund.patientId}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 break-words"
                        >
                          {entry.refund.patientName ?? getPatientName(entry.refund.patientId)}
                        </Link>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge color="neutral" size="xs">{t.invoice.refundBadge}</Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(entry.refund.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400 whitespace-nowrap shrink-0">-{entry.refund.amount.toFixed(2)} EGP</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInvoice(entry.refund.invoiceId)}
                        className="text-xs p-1.5"
                        title={t.invoice.viewInvoice}
                        aria-label={t.invoice.viewInvoice}
                      >
                        <RiEyeLine className="size-4" />
                      </Button>
                      {entry.refund.proofFileId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProofFileId(entry.refund.proofFileId)
                            setShowProofModal(true)
                          }}
                          className="flex items-center gap-2 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 cursor-pointer"
                        >
                          <RiFileLine className="size-4 shrink-0" />
                          <span>{t.invoice.viewProof}</span>
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </>
      )}

      <ProofViewerModal
        open={showProofModal}
        onOpenChange={setShowProofModal}
        fileId={selectedProofFileId}
        title={t.invoice.proofOfPayment}
      />

      <InvoiceDrawer
        open={showCaptureDrawer}
        onOpenChange={setShowCaptureDrawer}
        onSuccess={() => {
          refetch()
          refetchRefunds()
          setShowCaptureDrawer(false)
        }}
        mode="capture-only"
      />

      <ViewInvoiceDrawer
        open={showViewInvoiceDrawer}
        onOpenChange={(open) => {
          setShowViewInvoiceDrawer(open)
          if (!open) setSelectedInvoiceForView(null)
        }}
        invoice={selectedInvoiceForView}
        onSuccess={async () => {
          await Promise.all([refetch(), refetchRefunds()])
          setShowViewInvoiceDrawer(false)
          setSelectedInvoiceForView(null)
        }}
      />

    </div>
  )
}
