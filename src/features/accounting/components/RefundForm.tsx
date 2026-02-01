"use client"

import { useEffect, useState } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Select } from "@/components/Select"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useToast } from "@/hooks/useToast"
import { createRefund } from "@/api/accounting.api"
import { uploadFile } from "@/api/files.api"
import type { Invoice } from "@/types/invoice"
import type { InvoiceRefundSummary } from "@/features/accounting/accounting.types"
import type { PaymentMethod } from "@/types/payment"
import { getPatientName } from "./invoiceDrawer.utils"
import { RiFileLine } from "@remixicon/react"

interface RefundFormProps {
  invoice: Invoice | null
  invoiceRefundSummary: InvoiceRefundSummary | null
  onSuccess: () => void
  onCancel?: () => void
  /** When true, show a compact header (invoice id + patient). When false, no header (e.g. drawer already shows context). Default true for modal use. */
  showHeader?: boolean
}

export function RefundForm({
  invoice,
  invoiceRefundSummary,
  onSuccess,
  onCancel,
  showHeader = true,
}: RefundFormProps) {
  const t = useAppTranslations()
  const { currentClinic, currentUser } = useUserClinic()
  const { showToast } = useToast()
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [proofFileId, setProofFileId] = useState<string | undefined>(undefined)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const refundable = invoiceRefundSummary?.refundable ?? 0

  useEffect(() => {
    if (invoiceRefundSummary) {
      setAmount(String(refundable))
      setMethod("cash")
      setProofFileId(undefined)
      setProofFile(null)
    }
  }, [invoiceRefundSummary, refundable])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentClinic || !invoice) return
    setUploadingProof(true)
    try {
      const uploaded = await uploadFile({
        clinicId: currentClinic.id,
        entityType: "payment",
        entityId: `refund_${invoice.id}`,
        file,
      })
      setProofFileId(uploaded.fileId)
      setProofFile(file)
      showToast(t.invoice.proofUploaded, "success")
    } catch {
      showToast(t.invoice.proofUploadFailed, "error")
    } finally {
      setUploadingProof(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoice || !currentClinic || !currentUser) return
    const numAmount = Number(amount)
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      showToast(t.invoice.refundEnterValidAmount, "error")
      return
    }
    if (numAmount > refundable) {
      showToast(
        t.invoice.refundAmountCannotExceed.replace("{max}", refundable.toFixed(2)),
        "error"
      )
      return
    }
    setSubmitting(true)
    try {
      await createRefund({
        clinicId: currentClinic.id,
        invoiceId: invoice.id,
        amount: numAmount,
        method,
        proofFileId,
        createdByUserId: currentUser.id,
      })
      showToast(t.invoice.refundRecorded, "success")
      await onSuccess()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t.invoice.refundFailed,
        "error"
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!invoice) return null

  const patientName = getPatientName(invoice.patientId)
  const parsedAmount = Number(amount)
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 && parsedAmount <= refundable

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showHeader && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="font-medium text-gray-900 dark:text-gray-50">{invoice.id}</p>
          <p className="text-gray-600 dark:text-gray-400">{patientName}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="refund-amount">
          {t.invoice.amount} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="refund-amount"
          type="number"
          step="0.01"
          min="0"
          max={refundable}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t.invoice.refundable}: {refundable.toFixed(2)} EGP
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="refund-method">
          {t.invoice.paymentMethod} <span className="text-red-500">*</span>
        </Label>
        <Select
          id="refund-method"
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
        >
          <option value="cash">{t.invoice.cash}</option>
          <option value="visa">{t.invoice.visa}</option>
          <option value="instapay">{t.invoice.instapay}</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="refund-proof">{t.invoice.attachProof}</Label>
        <div className="flex items-center gap-2">
          <Input
            id="refund-proof"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploadingProof}
            className="flex-1"
          />
          {proofFile && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <RiFileLine className="size-4" />
              {proofFile.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t.common.cancel}
          </Button>
        )}
        <Button type="submit" disabled={!isValidAmount || submitting}>
          {submitting ? t.common.processing : t.invoice.refundThisInvoice}
        </Button>
      </div>
    </form>
  )
}
