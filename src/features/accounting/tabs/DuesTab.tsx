"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/Card"
import { Button } from "@/components/Button"
import { Skeleton } from "@/components/Skeleton"
import { useInvoices } from "../hooks/useInvoices"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { AccountingToolbar, type DateRangePreset } from "../components/AccountingToolbar"
import { InvoiceDrawer } from "../components/InvoiceDrawer"
import { mockData } from "@/data/mock/mock-data"
import { RiPhoneLine, RiWhatsappLine, RiMoneyDollarCircleLine } from "@remixicon/react"
import { startOfToday, startOfMonth } from "date-fns"
import Link from "next/link"
import type { Invoice } from "@/types/invoice"

interface DuesTabProps {
  dateRangePreset: DateRangePreset
}

export function DuesTab({ dateRangePreset }: DuesTabProps) {
  const { currentClinic } = useUserClinic()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false)

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
    page: 1,
    pageSize: 20,
  })

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

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

  const invoices = data?.invoices || []

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
        <Card>
          <CardContent className="py-12 text-center">
            <RiMoneyDollarCircleLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {searchQuery ? "No unpaid invoices found matching your search." : "No unpaid invoices"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Amount Due</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Appointment</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Doctor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
                  {invoices.map((invoice) => {
                    const appointmentData = getAppointmentData(invoice.appointmentId)
                    const patientPhone = getPatientPhone(invoice.patientId)
                    const whatsappLink = formatWhatsAppLink(patientPhone)

                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-4 py-4">
                          <Link
                            href={`/patients/${invoice.patientId}`}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            {getPatientName(invoice.patientId)}
                          </Link>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <RiPhoneLine className="size-4" />
                            <span>{patientPhone}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium">
                          {invoice.amount.toFixed(2)} EGP
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {appointmentData ? (
                            <>
                              <span>{appointmentData.date}</span>
                              <div className="text-xs text-gray-500">{appointmentData.time}</div>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {appointmentData?.type || invoice.appointmentType}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {getDoctorName(invoice.doctorId)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                              title="WhatsApp"
                            >
                              <RiWhatsappLine className="size-4" />
                            </a>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleMarkPaid(invoice)}
                              className="whitespace-nowrap"
                            >
                              Mark Paid
                            </Button>
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/patients/${invoice.patientId}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 break-words"
                        >
                          {getPatientName(invoice.patientId)}
                        </Link>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <RiPhoneLine className="size-4 shrink-0" />
                          <span className="break-all">{patientPhone}</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold whitespace-nowrap shrink-0">{invoice.amount.toFixed(2)} EGP</p>
                    </div>
                    {appointmentData && (
                      <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          {appointmentData.date} at {appointmentData.time}
                        </div>
                        <div>{appointmentData.type}</div>
                        <div>{getDoctorName(invoice.doctorId)}</div>
                      </div>
                    )}
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-md border border-green-300 px-3 py-2 text-center text-sm text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
                      >
                        <RiWhatsappLine className="mx-auto size-4" />
                        <span className="mt-1 block text-xs">WhatsApp</span>
                      </a>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleMarkPaid(invoice)}
                        className="flex-1"
                      >
                        Mark Paid
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
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
