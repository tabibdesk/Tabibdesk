"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/Dialog"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Badge } from "@/components/Badge"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useToast } from "@/hooks/useToast"
import { createPayment } from "@/api/accounting.api"
import { parsePaymentProof } from "@/api/accountingAi.api"
import { mockUploadFile } from "../accounting.utils"
import type { PaymentMethod } from "../accounting.types"
import {
  RiImageLine,
  RiSparklingLine,
  RiAlertLine,
} from "@remixicon/react"

interface PaymentProofModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prefilledData?: {
    patientId: string
    patientName: string
    appointmentId: string
    feeAmount: number
  } | null
  onSuccess: () => void
}

export function PaymentProofModal({
  open,
  onOpenChange,
  prefilledData,
  onSuccess,
}: PaymentProofModalProps) {
  const { currentClinic, currentUser } = useUserClinic()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [evidenceUrl, setEvidenceUrl] = useState("")
  const [messageText, setMessageText] = useState("")
  const [parsed, setParsed] = useState<any>(null)

  // Editable fields after AI parsing
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("instapay")
  const [reference, setReference] = useState("")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setEvidenceFile(file)
    
    // Mock upload
    try {
      const url = await mockUploadFile(file)
      setEvidenceUrl(url)
      showToast("Evidence uploaded", "success")
    } catch (error) {
      showToast("Failed to upload evidence", "error")
    }
  }

  const handleParseProof = async () => {
    if (!evidenceUrl && !messageText) {
      showToast("Please upload evidence or enter message text", "error")
      return
    }

    setParsing(true)
    try {
      const result = await parsePaymentProof({
        clinicId: currentClinic.id,
        patientId: prefilledData?.patientId,
        appointmentId: prefilledData?.appointmentId,
        evidenceFileUrl: evidenceUrl,
        messageText,
      })

      setParsed(result)
      setAmount(result.suggestedAmount.toString())
      setMethod(result.suggestedMethod)
      setReference(result.suggestedReference || "")

      showToast("AI extracted payment details", "success")
    } catch (error) {
      console.error("Failed to parse proof:", error)
      showToast("Failed to parse payment proof", "error")
    } finally {
      setParsing(false)
    }
  }

  const handleCreatePendingPayment = async () => {
    if (!evidenceUrl) {
      showToast("Please upload evidence first", "error")
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      showToast("Please enter a valid amount", "error")
      return
    }

    setLoading(true)
    try {
      await createPayment({
        clinicId: currentClinic.id,
        patientId: prefilledData!.patientId,
        patientName: prefilledData!.patientName,
        appointmentId: prefilledData!.appointmentId,
        amount: parseFloat(amount),
        method,
        status: "pending_approval",
        reference: reference || undefined,
        evidenceUrl,
        createdByUserId: currentUser.id,
      })

      showToast("Payment proof submitted for approval", "success")
      onSuccess()
      onOpenChange(false)
      
      // Reset form
      setEvidenceFile(null)
      setEvidenceUrl("")
      setMessageText("")
      setParsed(null)
      setAmount("")
      setReference("")
    } catch (error) {
      console.error("Failed to create payment:", error)
      showToast("Failed to submit payment proof", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Payment Proof</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {prefilledData && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Patient: <span className="font-medium text-gray-900 dark:text-gray-50">{prefilledData.patientName}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expected: <span className="font-medium text-gray-900 dark:text-gray-50">{prefilledData.feeAmount} EGP</span>
              </p>
            </div>
          )}

          {/* Upload Evidence */}
          <div className="space-y-2">
            <Label>Upload Payment Screenshot</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => document.getElementById("evidence-file")?.click()}
              >
                <RiImageLine className="size-4" />
                Choose File
              </Button>
              <input
                id="evidence-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {evidenceFile && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {evidenceFile.name}
                </span>
              )}
            </div>
          </div>

          {/* Message Text (optional, simulating WhatsApp) */}
          <div className="space-y-2">
            <Label htmlFor="messageText">Message Text (optional)</Label>
            <Input
              id="messageText"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder='e.g., "Paid 500 EGP via Instapay, ref: 12345"'
            />
          </div>

          {/* Parse Button */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleParseProof}
            disabled={parsing || (!evidenceUrl && !messageText)}
            className="w-full"
          >
            {parsing ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
                AI Parsing...
              </>
            ) : (
              <>
                <RiSparklingLine className="size-4" />
                Parse with AI
              </>
            )}
          </Button>

          {/* AI Extracted Preview */}
          {parsed && (
            <div className="space-y-3 rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
              <div className="flex items-center gap-2">
                <RiSparklingLine className="size-4 text-primary-600 dark:text-primary-400" />
                <span className="font-semibold text-primary-900 dark:text-primary-100">
                  AI Extracted Details
                </span>
                <Badge color={parsed.confidence > 0.8 ? "emerald" : "amber"} size="xs">
                  {Math.round(parsed.confidence * 100)}% confidence
                </Badge>
              </div>

              {parsed.warnings && parsed.warnings.length > 0 && (
                <div className="space-y-1">
                  {parsed.warnings.map((warning: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                      <RiAlertLine className="mt-0.5 size-4 shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-700 dark:text-gray-300">
                Please review and edit if needed:
              </p>
            </div>
          )}

          {/* Editable Fields */}
          {parsed && (
            <>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (EGP)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Transaction reference"
                />
              </div>

              <Button
                type="button"
                variant="primary"
                onClick={handleCreatePendingPayment}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Submitting..." : "Create Pending Payment"}
              </Button>
            </>
          )}

          {/* Cancel */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={loading || parsing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
