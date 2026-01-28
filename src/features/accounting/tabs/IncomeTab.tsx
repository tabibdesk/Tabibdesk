"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Skeleton } from "@/components/Skeleton"
import { usePayments } from "../hooks/usePayments"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { AccountingToolbar, type DateRangePreset } from "../components/AccountingToolbar"
import { startOfToday } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/Button"
import { RiAddLine, RiFileLine, RiMoneyDollarCircleLine } from "@remixicon/react"
import { mockData } from "@/data/mock/mock-data"
import { ProofViewerModal } from "../components/ProofViewerModal"
import type { Payment } from "@/types/payment"
import { CapturePaymentDrawer } from "../components/CapturePaymentDrawer"

interface IncomeTabProps {
  dateRangePreset: DateRangePreset
}

export function IncomeTab({ dateRangePreset }: IncomeTabProps) {
  const { currentClinic } = useUserClinic()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedProofFileId, setSelectedProofFileId] = useState<string | undefined>(undefined)
  const [showProofModal, setShowProofModal] = useState(false)
  const [showCaptureDrawer, setShowCaptureDrawer] = useState(false)

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
    clinicId: currentClinic?.id || "",
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

  // Calculate summary
  const payments = data?.payments || []
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
  const cashTotal = payments.filter((p) => p.method === "cash").reduce((sum, p) => sum + p.amount, 0)
  const visaTotal = payments.filter((p) => p.method === "visa").reduce((sum, p) => sum + p.amount, 0)
  const instapayTotal = payments.filter((p) => p.method === "instapay").reduce((sum, p) => sum + p.amount, 0)

  // Get patient names
  const getPatientName = (patientId: string) => {
    const patient = mockData.patients.find((p) => p.id === patientId)
    return patient ? `${patient.first_name} ${patient.last_name}` : "Unknown"
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600 dark:text-red-400">Error loading payments: {error.message}</p>
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
            <CardTitle className="text-xs sm:text-sm font-semibold">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold break-words">{totalCollected.toFixed(2)} EGP</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-semibold">Cash</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold break-words">{cashTotal.toFixed(2)} EGP</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-semibold">Visa</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold break-words">{visaTotal.toFixed(2)} EGP</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-semibold">InstaPay</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold break-words">{instapayTotal.toFixed(2)} EGP</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
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
      ) : payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RiMoneyDollarCircleLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">No payments found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search Bar and Capture Button - Above List */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <AccountingToolbar searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
            </div>
            <Button
              onClick={() => setShowCaptureDrawer(true)}
              className="w-full sm:w-auto shrink-0 md:h-9 md:py-1.5 md:text-sm"
            >
              <RiAddLine className="mr-2 size-4" />
              <span className="hidden sm:inline">Capture</span>
              <span className="sm:hidden">Capture</span>
            </Button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatTime(payment.createdAt)}
                        <div className="text-xs text-gray-500">{formatDate(payment.createdAt)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/patients/${payment.patientId}`}
                          className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        >
                          {getPatientName(payment.patientId)}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">{payment.amount.toFixed(2)} EGP</td>
                      <td className="px-4 py-4">
                        <span className="text-sm capitalize">{payment.method}</span>
                      </td>
                      <td className="px-4 py-4">
                        {payment.proofFileId && (
                          <button
                            onClick={() => {
                              setSelectedProofFileId(payment.proofFileId)
                              setShowProofModal(true)
                            }}
                            className="cursor-pointer hover:opacity-70 transition-opacity"
                            title="View proof"
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
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/patients/${payment.patientId}`}
                        className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 break-words"
                      >
                        {getPatientName(payment.patientId)}
                      </Link>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {formatTime(payment.createdAt)} • {formatDate(payment.createdAt)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold whitespace-nowrap">{payment.amount.toFixed(2)} EGP</p>
                      <p className="text-xs capitalize text-gray-600 dark:text-gray-400">{payment.method}</p>
                    </div>
                  </div>
                  {payment.proofFileId && (
                    <button
                      onClick={() => {
                        setSelectedProofFileId(payment.proofFileId)
                        setShowProofModal(true)
                      }}
                      className="mt-2 flex items-center gap-2 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 cursor-pointer"
                    >
                      <RiFileLine className="size-4 shrink-0" />
                      <span>View proof</span>
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <ProofViewerModal
        open={showProofModal}
        onOpenChange={setShowProofModal}
        fileId={selectedProofFileId}
        title="Proof of Payment"
      />

      <CapturePaymentDrawer
        open={showCaptureDrawer}
        onOpenChange={setShowCaptureDrawer}
        onSuccess={() => {
          refetch()
          setShowCaptureDrawer(false)
        }}
      />
    </div>
  )
}
