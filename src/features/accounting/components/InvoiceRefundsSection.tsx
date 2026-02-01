"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { Button } from "@/components/Button"
import { Skeleton } from "@/components/Skeleton"
import type { Invoice } from "@/types/invoice"
import type { Refund, InvoiceRefundSummary } from "@/features/accounting/accounting.types"
import { RiFileLine, RiMoneyDollarCircleLine } from "@remixicon/react"
import { ProofViewerModal } from "./ProofViewerModal"
import { useState } from "react"

interface InvoiceRefundsSectionProps {
  invoice: Invoice
  summary: InvoiceRefundSummary | null
  refunds: Refund[]
  loading: boolean
  error: string | null
  canRefund: boolean
  onRefund: () => void
  /** When false, the "Refund this invoice" button is hidden (e.g. when the action is in the drawer footer). Default true. */
  showRefundButton?: boolean
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getRefundMethodLabel(method: string, t: ReturnType<typeof useAppTranslations>) {
  switch (method) {
    case "cash":
      return t.invoice.cash
    case "visa":
      return t.invoice.visa
    case "instapay":
      return t.invoice.instapay
    default:
      return method
  }
}

export function InvoiceRefundsSection({
  invoice,
  summary,
  refunds,
  loading,
  error,
  canRefund,
  onRefund,
  showRefundButton = true,
}: InvoiceRefundsSectionProps) {
  const t = useAppTranslations()
  const [selectedProofFileId, setSelectedProofFileId] = useState<string | undefined>(undefined)
  const [showProofModal, setShowProofModal] = useState(false)

  const handleProofClick = (fileId: string) => {
    setSelectedProofFileId(fileId)
    setShowProofModal(true)
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
          {t.invoice.refundSectionTitle}
        </h3>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
        <h3 className="mb-2 text-sm font-semibold text-red-800 dark:text-red-200">
          {t.invoice.refundSectionTitle}
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (!summary) return null

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
          {t.invoice.refundSectionTitle}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t.invoice.paidAmount}</span>
            <span className="font-medium">{summary.invoicePaid.toFixed(2)} EGP</span>
          </div>
          {refunds.length > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.invoice.refundedAmount}</span>
                <span className="font-medium">{summary.invoiceRefunded.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t.invoice.refundable}</span>
                <span className="font-medium">{summary.refundable.toFixed(2)} EGP</span>
              </div>
            </>
          )}
        </div>

        {refunds.length > 0 && (
          <ul className="mt-3 space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
            {refunds.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="font-medium">-{r.amount.toFixed(2)} EGP</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {getRefundMethodLabel(r.method, t)}
                </span>
                <span className="text-gray-500 dark:text-gray-500">{formatDate(r.createdAt)}</span>
                {r.proofFileId && (
                  <button
                    type="button"
                    onClick={() => handleProofClick(r.proofFileId!)}
                    className="shrink-0 text-primary-600 hover:opacity-80 dark:text-primary-400"
                    title="View proof"
                  >
                    <RiFileLine className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {showRefundButton && canRefund && summary.refundable > 0 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3 w-full sm:w-auto"
            onClick={onRefund}
          >
            <RiMoneyDollarCircleLine className="size-4 me-2" />
            {t.invoice.refundThisInvoice}
          </Button>
        )}
      </div>

      <ProofViewerModal
        open={showProofModal}
        onOpenChange={setShowProofModal}
        fileId={selectedProofFileId}
        title="Proof of refund"
      />
    </>
  )
}
