"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import type { Invoice } from "@/types/invoice"
import { getAppointmentData, getDoctorName, getPatientName } from "./invoiceDrawer.utils"
import { getAppointmentTypeLabel } from "@/features/appointments/appointmentTypes"
import { RiFileLine, RiUserLine, RiStethoscopeLine, RiCalendarLine } from "@remixicon/react"

interface InvoiceSummarySectionProps {
  invoice: Invoice
}

export function InvoiceSummarySection({ invoice }: InvoiceSummarySectionProps) {
  const t = useAppTranslations()
  const appointmentData = getAppointmentData(invoice.appointmentId)

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-50">
        {t.invoice.appointmentSummary}
      </h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <RiUserLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400">{t.invoice.patient}</div>
            <div className="font-medium text-gray-900 dark:text-gray-50">
              {getPatientName(invoice.patientId)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RiStethoscopeLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400">{t.invoice.doctor}</div>
            <div className="font-medium text-gray-900 dark:text-gray-50">
              {getDoctorName(invoice.doctorId)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RiStethoscopeLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400">{t.invoice.appointmentType}</div>
            <div className="font-medium text-gray-900 dark:text-gray-50">
              {getAppointmentTypeLabel(invoice.appointmentType, t.appointments)}
            </div>
          </div>
        </div>
        {appointmentData && (
          <div className="flex items-center gap-3">
            <RiCalendarLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
            <div className="flex-1">
              <div className="text-xs text-gray-600 dark:text-gray-400">{t.invoice.dateTime}</div>
              <div className="font-medium text-gray-900 dark:text-gray-50">
                {appointmentData.date} at {appointmentData.time}
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <RiFileLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400">{t.invoice.invoiceAmount}</div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-50">
              {invoice.amount.toFixed(2)} EGP
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
