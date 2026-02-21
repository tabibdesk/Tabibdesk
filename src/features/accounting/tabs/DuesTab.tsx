"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/Card"
import { Button } from "@/components/Button"
import { Skeleton } from "@/components/Skeleton"
import { useInvoices } from "../hooks/useInvoices"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { AccountingToolbar, type DateRangePreset } from "../components/AccountingToolbar"
import { InvoiceDrawer } from "../components/InvoiceDrawer"
import { mockData } from "@/data/mock/mock-data"
import { RiWhatsappLine, RiMoneyDollarCircleLine, RiCheckLine } from "@remixicon/react"
import { getAppointmentTypeLabel } from "@/features/appointments/appointmentTypes"
import { EmptyState } from "@/components/EmptyState"
import { startOfToday, startOfMonth } from "date-fns"
import Link from "next/link"
import type { Invoice } from "@/types/invoice"

interface DuesTabProps {
  dateRangePreset: DateRangePreset
}

export function DuesTab({ dateRangePreset }: DuesTabProps) {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false)
  const [page, setPage] = useState(1)
  const [accumulatedInvoices, setAccumulatedInvoices] = useState<Invoice[]>([])

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
  const { data, loading, error, refetch } = useInvoices({
    clinicId: currentClinic?.id || "clinic-001",
    status: "unpaid",
    from: dateRange.from,
    to: dateRange.to,
    query: debouncedSearch || undefined,
    page,
    pageSize: 20,
  })

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1)
    setAccumulatedInvoices([])
  }, [dateRange.from, dateRange.to, debouncedSearch])

  // Accumulate invoices for pagination
  useEffect(() => {
    if (data?.invoices) {
      setAccumulatedInvoices((prev) => (page === 1 ? data.invoices : [...prev, ...data.invoices]))
    }
  }, [data?.invoices, page])

  const invoices = page === 1 && loading ? [] : accumulatedInvoices

  // Get patient and appointment data
  const getPatientName = (patientId: string) => {
    const patient = mockData.patients.find((p) => p.id === patientId)
    return patient ? `${patient.first_name} ${patient.last_name}` : "Unknown"
  }

  const getPatientPhone = (patientId: string) => {
    const patient = mockData.patients.find((p) => p.id === patientId)
    return patient?.phone || ""
  }

  const getAppointmentData = (appointmentId: string) => {
    const appointment = mockData.appointments.find((a) => a.id === appointmentId)
    if (!appointment) return null
    const date = new Date(appointment.scheduled_at)
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      type: appointment.type,
    }
  }

  const getDoctorName = (doctorId: string) => {
    // Mock doctor lookup - in real app, fetch from API
    return "Dr. Ahmed Hassan"
  }

  const formatWhatsAppLink = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, "")
    return `https://wa.me/${digitsOnly}`
  }

  const handleMarkPaid = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowMarkPaidModal(true)
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600 dark:text-red-400">Error loading invoices: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Bar - Always visible */}
      <AccountingToolbar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchPlaceholder={t.accounting.searchDues}
      />

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
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={RiMoneyDollarCircleLine}
          title={searchQuery ? t.accounting.noDuesMatch : t.accounting.noDuesYet}
          description={!searchQuery ? t.accounting.duesDescription : undefined}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-gray-50">{t.table.appointment}</th>
                    <th className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-gray-50">{t.table.patient}</th>
                    <th className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-gray-50">{t.table.amountDue}</th>
                    <th className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-gray-50">{t.table.type}</th>
                    <th className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-gray-50">{t.table.doctor}</th>
                    <th className="px-4 py-3 text-start text-sm font-semibold text-gray-900 dark:text-gray-50">{t.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                  {invoices.map((invoice) => {
                    const appointmentData = getAppointmentData(invoice.appointmentId)
                    const patientPhone = getPatientPhone(invoice.patientId)
                    const whatsappLink = formatWhatsAppLink(patientPhone)

                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {appointmentData ? `${appointmentData.date} at ${appointmentData.time}` : "—"}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/patients/${invoice.patientId}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            {getPatientName(invoice.patientId)}
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium">
                          {invoice.amount.toFixed(2)} EGP
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {getAppointmentTypeLabel(appointmentData?.type || invoice.appointmentType, t.appointments)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {getDoctorName(invoice.doctorId)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 rtl:flex-row-reverse">
                            {patientPhone ? (
                              <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-md p-1.5 text-[#128C7E] hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: "#b8f5e0" }}
                                title="WhatsApp"
                                aria-label="WhatsApp"
                              >
                                <RiWhatsappLine className="size-4" />
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(invoice)}
                              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all active:scale-95 border-0 shadow-sm rtl:flex-row-reverse"
                            >
                              <RiCheckLine className="size-3.5 shrink-0" />
                              {t.invoice.markAsPaid}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {invoices.map((invoice) => {
              const appointmentData = getAppointmentData(invoice.appointmentId)
              const patientPhone = getPatientPhone(invoice.patientId)
              const whatsappLink = formatWhatsAppLink(patientPhone)

              return (
                <Card key={invoice.id}>
                  <CardContent className="p-4">
                    {appointmentData && (
                      <div className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {appointmentData.date} at {appointmentData.time}
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/patients/${invoice.patientId}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 break-words"
                        >
                          {getPatientName(invoice.patientId)}
                        </Link>
                      </div>
                      <p className="text-sm font-semibold whitespace-nowrap shrink-0">{invoice.amount.toFixed(2)} EGP</p>
                    </div>
                    {appointmentData && (
                      <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div>{getAppointmentTypeLabel(appointmentData?.type, t.appointments)}</div>
                        <div>{getDoctorName(invoice.doctorId)}</div>
                      </div>
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-1.5">
                      {patientPhone ? (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md p-1.5 text-[#128C7E] hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: "#b8f5e0" }}
                          title="WhatsApp"
                          aria-label="WhatsApp"
                        >
                          <RiWhatsappLine className="size-4" />
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(invoice)}
                        className="shrink-0 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold w-full sm:w-auto bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all active:scale-95 border-0 shadow-sm rtl:flex-row-reverse"
                      >
                        <RiCheckLine className="size-3.5 shrink-0" />
                        {t.invoice.markAsPaid}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {(data?.hasMore ?? false) && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page > 1 && loading}
                className="min-w-[140px]"
              >
                {page > 1 && loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t.accounting.loadMore}
                  </span>
                ) : (
                  t.accounting.loadMore
                )}
              </Button>
            </div>
          )}
        </>
      )}

      <InvoiceDrawer
        open={showMarkPaidModal}
        onOpenChange={setShowMarkPaidModal}
        mode="pay-only"
        invoice={selectedInvoice}
        onSuccess={() => {
          refetch()
          setShowMarkPaidModal(false)
          setSelectedInvoice(null)
        }}
      />
    </div>
  )
}
