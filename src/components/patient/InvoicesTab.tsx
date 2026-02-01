"use client"

import { useEffect, useMemo, useState } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Badge } from "@/components/Badge"
import { getBadgeColor } from "@/lib/badgeColors"
import { getDraftDueForPatient } from "@/api/draft-due.api"
import { listInvoices } from "@/api/invoices.api"
import { ViewInvoiceDrawer } from "@/components/patient/ViewInvoiceDrawer"
import { PatientEmptyState } from "@/components/patient/PatientEmptyState"
import { ListSkeleton } from "@/components/skeletons"
import type { DraftDue } from "@/types/draft-due"
import type { Invoice, InvoiceStatus } from "@/types/invoice"
import { format } from "date-fns"
import { RiMoneyDollarCircleLine, RiFileTextLine } from "@remixicon/react"
import { getAppointmentTypeLabel } from "@/features/appointments/appointmentTypes"

interface InvoicesTabProps {
  patientId: string
  clinicId: string
  /** Increment to trigger refetch (e.g. after Add invoice / Create invoice succeeds) */
  refreshTrigger?: number
}

type BillingItemType = "draft" | "invoice"

interface BillingItem {
  type: BillingItemType
  id: string
  date: string
  label: string
  amount: number
  /** Only for type "invoice": status for badge/label */
  status?: InvoiceStatus
}

function getInvoiceStatusLabel(status: InvoiceStatus, t: ReturnType<typeof useAppTranslations>): string {
  switch (status) {
    case "paid":
      return t.invoice.paid
    case "partial":
      return t.invoice.partiallyPaid
    case "unpaid":
      return t.invoice.due
    case "void":
      return t.invoice.void
    default:
      return t.invoice.due
  }
}

function getInvoiceBadgeVariant(status: InvoiceStatus): "success" | "warning" | "neutral" | "default" {
  switch (status) {
    case "paid":
      return "success"
    case "partial":
      return "warning"
    case "unpaid":
      return "warning"
    case "void":
      return "neutral"
    default:
      return "default"
  }
}

export function InvoicesTab({ patientId, clinicId, refreshTrigger = 0 }: InvoicesTabProps) {
  const t = useAppTranslations()
  const [draft, setDraft] = useState<DraftDue | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      getDraftDueForPatient(patientId),
      listInvoices({ clinicId, patientId, page: 1, pageSize: 100 }),
    ])
      .then(([d, inv]) => {
        if (cancelled) return
        setDraft(d)
        setInvoices(inv.invoices)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [patientId, clinicId, refreshTrigger])

  const items = useMemo((): BillingItem[] => {
    const list: BillingItem[] = []

    if (draft && draft.lineItems.length > 0) {
      const date = draft.updatedAt
      for (const item of draft.lineItems) {
        list.push({
          type: "draft",
          id: item.id,
          date,
          label: item.label,
          amount: item.amount,
        })
      }
    }

    for (const inv of invoices) {
      list.push({
        type: "invoice",
        id: inv.id,
        date: inv.createdAt,
        label: getAppointmentTypeLabel(inv.appointmentType, t.appointments),
        amount: inv.amount,
        status: inv.status,
      })
    }

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return list
  }, [draft, invoices, t.appointments])

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        <ListSkeleton rows={4} showHeader />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <PatientEmptyState
          icon={RiMoneyDollarCircleLine}
          title={t.invoice.noInvoices}
          description={t.invoice.noInvoicesDesc}
        />
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const isInvoice = it.type === "invoice"
            const canOpen = isInvoice && it.status !== "void"
            const statusLabel = it.type === "draft" ? t.invoice.draft : it.status ? getInvoiceStatusLabel(it.status, t) : ""
            return (
              <div
                key={`${it.type}-${it.id}`}
                role={canOpen ? "button" : undefined}
                onClick={canOpen ? () => setViewInvoiceId(it.id) : undefined}
                onKeyDown={canOpen ? (e) => e.key === "Enter" && setViewInvoiceId(it.id) : undefined}
                className={`group flex items-start gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all ${
                  canOpen
                    ? "cursor-pointer hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm"
                    : "opacity-60"
                }`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
                  <RiFileTextLine className="size-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-50">
                      {it.label}
                    </p>
                    <span
                      className={`whitespace-nowrap text-sm font-bold ${
                        it.amount < 0 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {it.amount >= 0 ? "" : "−"}{Math.abs(it.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {format(new Date(it.date), "MMM d, yyyy · h:mm a")}
                    </span>
                    {statusLabel && (
                      <Badge
                        color={getBadgeColor(it.type === "draft" ? "neutral" : getInvoiceBadgeVariant(it.status!))}
                        size="xs"
                      >
                        {statusLabel}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <ViewInvoiceDrawer
        open={viewInvoiceId !== null}
        onOpenChange={(open) => !open && setViewInvoiceId(null)}
        invoiceId={viewInvoiceId}
        onSuccess={() => setViewInvoiceId(null)}
      />
    </div>
  )
}
