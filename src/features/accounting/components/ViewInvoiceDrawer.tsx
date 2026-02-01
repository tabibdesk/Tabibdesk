"use client"

import { useEffect, useState } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useLocale } from "@/contexts/locale-context"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"
import { Button } from "@/components/Button"
import { useUserClinic } from "@/contexts/user-clinic-context"
import type { Invoice } from "@/types/invoice"
import type { Refund } from "@/features/accounting/accounting.types"
import type { InvoiceRefundSummary } from "@/features/accounting/accounting.types"
import { getInvoiceRefundSummary, listRefundsByInvoice } from "@/api/accounting.api"
import { canRefundAccounting } from "@/lib/permissions"
import { InvoiceSummarySection } from "./InvoiceSummarySection"
import { InvoiceRefundsSection } from "./InvoiceRefundsSection"
import { RefundForm } from "./RefundForm"

interface ViewInvoiceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
  onSuccess?: () => void
}

export function ViewInvoiceDrawer({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: ViewInvoiceDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const { currentUser } = useUserClinic()
  const [refundSummary, setRefundSummary] = useState<InvoiceRefundSummary | null>(null)
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRefundForm, setShowRefundForm] = useState(false)

  const canRefund = canRefundAccounting(currentUser)

  useEffect(() => {
    if (!open || !invoice) {
      setRefundSummary(null)
      setRefunds([])
      setError(null)
      setShowRefundForm(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([
      getInvoiceRefundSummary(invoice.id),
      listRefundsByInvoice(invoice.id),
    ])
      .then(([summary, list]) => {
        if (!cancelled) {
          setRefundSummary(summary ?? null)
          setRefunds(list ?? [])
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load refunds")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, invoice?.id])

  const handleRefundSuccess = async () => {
    if (!invoice) return
    setShowRefundForm(false)
    const [summary, list] = await Promise.all([
      getInvoiceRefundSummary(invoice.id),
      listRefundsByInvoice(invoice.id),
    ])
    setRefundSummary(summary ?? null)
    setRefunds(list ?? [])
    await onSuccess?.()
  }

  if (!invoice) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>{t.invoice.invoiceDetails}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-5">
            <InvoiceSummarySection invoice={invoice} />
            {showRefundForm ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {t.invoice.refundThisInvoice}
                </h3>
                <RefundForm
                  invoice={invoice}
                  invoiceRefundSummary={refundSummary}
                  onSuccess={handleRefundSuccess}
                  onCancel={() => setShowRefundForm(false)}
                  showHeader={false}
                />
              </div>
            ) : (
              <InvoiceRefundsSection
                invoice={invoice}
                summary={refundSummary}
                refunds={refunds}
                loading={loading}
                error={error}
                canRefund={canRefund}
                onRefund={() => setShowRefundForm(true)}
                showRefundButton={true}
              />
            )}
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.close}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
