"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Select } from "@/components/Select"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useToast } from "@/hooks/useToast"
import {
  markInvoicePaid,
  recordPartialPaymentWithOptionalDue,
  voidInvoice,
} from "@/api/invoices.api"
import { createPayment as createInvoiceLinkedPayment } from "@/api/payments.api"
import { uploadFile } from "@/api/files.api"
import type { PaymentMethod } from "@/types/payment"
import type { Invoice } from "@/types/invoice"
import { PatientSelector, type Patient } from "@/components/shared/PatientSelector"
import {
  getAppointmentData,
  getDoctorName,
  getPatientName,
  getPatientAppointmentsForInvoice,
  type PatientAppointment,
} from "./invoiceDrawer.utils"
import { CreateInvoiceForm, type CreateInvoiceFormReadyState } from "./CreateInvoiceForm"
import { getAppointmentTypeLabel } from "@/features/appointments/appointmentTypes"
import { RiFileLine } from "@remixicon/react"
import { InvoiceSummarySection } from "./InvoiceSummarySection"
import { canRefundAccounting } from "@/lib/permissions"
import {
  getInvoiceRefundSummary,
  listRefundsByInvoice,
} from "@/api/accounting.api"
import type { InvoiceRefundSummary as InvoiceRefundSummaryType } from "@/features/accounting/accounting.types"
import type { Refund } from "@/features/accounting/accounting.types"
import { InvoiceRefundsSection } from "./InvoiceRefundsSection"

export type { PatientAppointment }

type DrawerMode = "pay-only" | "invoice-and-pay" | "update-due-only" | "capture-only"

interface InvoiceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  mode: DrawerMode
  /** For pay-only and invoice-and-pay modes */
  invoice?: Invoice | null
  /** For update-due-only and invoice-and-pay (when no invoice) */
  patientId?: string
  patientAppointments?: PatientAppointment[]
  /** Pre-select this appointment when creating (dashboard create-invoice flow) */
  defaultAppointmentId?: string
}

export function InvoiceDrawer({
  open,
  onOpenChange,
  onSuccess,
  mode,
  invoice: invoiceProp = null,
  patientId,
  patientAppointments = [],
  defaultAppointmentId,
}: InvoiceDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const { currentClinic, currentUser } = useUserClinic()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [amountToCollect, setAmountToCollect] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [createDueForRemainder, setCreateDueForRemainder] = useState(true)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofFileId, setProofFileId] = useState<string | undefined>(undefined)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [capturePatient, setCapturePatient] = useState<Patient | null>(null)
  const [formState, setFormState] = useState<CreateInvoiceFormReadyState>({
    canSubmit: false,
    submitLabel: t.common.save,
    loading: false,
    submit: async () => {},
  })
  const formSubmitRef = useRef<() => Promise<void>>(async () => {})

  const [refundSummary, setRefundSummary] = useState<InvoiceRefundSummaryType | null>(null)
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [refundSectionLoading, setRefundSectionLoading] = useState(false)
  const [refundSectionError, setRefundSectionError] = useState<string | null>(null)

  const payOnlyMode = mode === "pay-only"
  const canRefund = canRefundAccounting(currentUser)
  const captureOnlyMode = mode === "capture-only"

  const handleFormReady = useCallback((state: CreateInvoiceFormReadyState) => {
    setFormState(state)
    formSubmitRef.current = state.submit
  }, [])

  const parsedAmount = amountToCollect ? Number(amountToCollect) : NaN
  const hasAmountChanged =
    invoiceProp != null &&
    Number.isFinite(parsedAmount) &&
    Math.abs(parsedAmount - invoiceProp.amount) > 0.0001

  useEffect(() => {
    if (!open) return
    setLoading(false)
    setProofFile(null)
    setProofFileId(undefined)
    setUploadingProof(false)
    setRefundSummary(null)
    setRefunds([])
    setRefundSectionError(null)
    if (mode === "pay-only" && invoiceProp) {
      setAmountToCollect(String(invoiceProp.amount))
      setMethod("cash")
      setCreateDueForRemainder(true)
    }
    if (mode === "capture-only") {
      setCapturePatient(null)
    }
  }, [open, mode, invoiceProp])

  useEffect(() => {
    if (!open || !payOnlyMode || !invoiceProp || invoiceProp.status !== "paid") return
    let cancelled = false
    setRefundSectionLoading(true)
    setRefundSectionError(null)
    Promise.all([
      getInvoiceRefundSummary(invoiceProp.id),
      listRefundsByInvoice(invoiceProp.id),
    ])
      .then(([summary, refundList]) => {
        if (cancelled) return
        setRefundSummary(summary ?? null)
        setRefunds(refundList ?? [])
      })
      .catch((err) => {
        if (!cancelled) {
          setRefundSectionError(err instanceof Error ? err.message : "Failed to load refunds")
        }
      })
      .finally(() => {
        if (!cancelled) setRefundSectionLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, payOnlyMode, invoiceProp?.id, invoiceProp?.status])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentClinic) return
    setUploadingProof(true)
    try {
      const uploaded = await uploadFile({
        clinicId: currentClinic.id,
        entityType: "payment",
        entityId: invoiceProp?.id ?? `temp_${Date.now()}`,
        file,
      })
      setProofFileId(uploaded.fileId)
      setProofFile(file)
      showToast(t.invoice.proofUploaded, "success")
    } catch (error) {
      showToast(t.invoice.proofUploadFailed, "error")
    } finally {
      setUploadingProof(false)
    }
  }

  const handleSubmit = async () => {
    if (payOnlyMode && invoiceProp) {
      // Dues: pay-only mode
      setLoading(true)
      try {
        const isFullPayment = !hasAmountChanged
        const remainder = invoiceProp.amount - parsedAmount
        const shouldCreateDue = createDueForRemainder && remainder > 0.01

        if (isFullPayment) {
          await createInvoiceLinkedPayment({
            clinicId: invoiceProp.clinicId,
            invoiceId: invoiceProp.id,
            patientId: invoiceProp.patientId,
            appointmentId: invoiceProp.appointmentId,
            amount: parsedAmount,
            method,
            proofFileId: method !== "cash" ? proofFileId : undefined,
            createdByUserId: currentUser?.id ?? "user-001",
          })
          await markInvoicePaid(invoiceProp.id)
          showToast(t.invoice.paymentRecorded, "success")
        } else {
          await voidInvoice(invoiceProp.id)
          const { dueInvoice } = await recordPartialPaymentWithOptionalDue({
            clinicId: invoiceProp.clinicId,
            doctorId: invoiceProp.doctorId,
            patientId: invoiceProp.patientId,
            appointmentId: invoiceProp.appointmentId,
            appointmentType: invoiceProp.appointmentType,
            amountPaid: parsedAmount,
            serviceAmount: invoiceProp.amount,
            createDueForRemainder: shouldCreateDue,
            createdByUserId: currentUser?.id ?? "user-001",
          })
          if (dueInvoice) {
            showToast(t.invoice.dueCreatedFor.replace("{amount}", dueInvoice.amount.toFixed(2)), "success")
          } else {
            showToast(t.invoice.paymentRecorded, "success")
          }
        }
        onSuccess()
        onOpenChange(false)
      } catch (error) {
        showToast(t.invoice.paymentRecordFailed, "error")
      } finally {
        setLoading(false)
      }
      return
    }
  }

  const canSubmitPayOnly = payOnlyMode && Number.isFinite(parsedAmount) && parsedAmount > 0

  const title = t.invoice.createInvoice
  const submitLabelPayOnly = t.invoice.markAsPaid

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-5">
            {/* Pay-only: invoice summary */}
            {payOnlyMode && invoiceProp && (
              <InvoiceSummarySection invoice={invoiceProp} />
            )}

            {/* Pay-only: payment form (amount, method, proof) */}
            {payOnlyMode && invoiceProp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amount-payonly">
                    {t.invoice.amountToCollect} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount-payonly"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountToCollect}
                    onChange={(e) => setAmountToCollect(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  {(() => {
                    const partial = Number.isFinite(parsedAmount) && Math.abs(parsedAmount - invoiceProp.amount) > 0.0001
                    return partial ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {t.invoice.partialPayment.replace("{collected}", parsedAmount.toFixed(2)).replace("{total}", invoiceProp.amount.toFixed(2))}
                      </p>
                    ) : null
                  })()}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method-payonly">
                    {t.invoice.paymentMethod} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="method-payonly"
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="cash">{t.invoice.cash}</option>
                    <option value="visa">{t.invoice.visa}</option>
                    <option value="instapay">{t.invoice.instapay}</option>
                  </Select>
                </div>
                {(method === "visa" || method === "instapay") && (
                  <div className="space-y-2">
                    <Label htmlFor="proof-payonly">
                      {t.invoice.paymentProof} <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="proof-payonly"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploadingProof}
                        className="flex-1"
                      />
                      {proofFile && (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <RiFileLine className="size-4" />
                          {proofFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {Number.isFinite(parsedAmount) &&
                  Math.abs(parsedAmount - invoiceProp.amount) > 0.0001 &&
                  parsedAmount < invoiceProp.amount && (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                      <input
                        type="checkbox"
                        id="create-due-payonly"
                        checked={createDueForRemainder}
                        onChange={(e) => setCreateDueForRemainder(e.target.checked)}
                        className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-gray-700"
                      />
                      <Label htmlFor="create-due-payonly" className="flex-1 cursor-pointer text-sm">
                        {t.invoice.createDueForRemainder.replace("{amount}", (invoiceProp.amount - parsedAmount).toFixed(2))}
                      </Label>
                    </div>
                  )}
              </>
            )}

            {/* Pay-only + paid invoice: Refunds section */}
            {payOnlyMode && invoiceProp && invoiceProp.status === "paid" && (
              <InvoiceRefundsSection
                invoice={invoiceProp}
                summary={refundSummary}
                refunds={refunds}
                loading={refundSectionLoading}
                error={refundSectionError}
                canRefund={canRefund}
                onRefund={() => {}}
                showRefundButton={false}
              />
            )}

            {/* Capture-only: patient selection then same form as dashboard */}
            {captureOnlyMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="capture-patient">
                    {t.invoice.patient} <span className="text-red-500">*</span>
                  </Label>
                  <PatientSelector
                    initialPatient={capturePatient}
                    onPatientSelect={setCapturePatient}
                    searchOnly
                    required
                  />
                </div>
                {capturePatient && currentClinic?.id && (
                  <CreateInvoiceForm
                    key={capturePatient.id}
                    patientId={capturePatient.id}
                    patientAppointments={getPatientAppointmentsForInvoice(
                      capturePatient.id,
                      currentClinic.id
                    )}
                    clinicId={currentClinic.id}
                    doctorId={currentUser?.id ?? "user-001"}
                    createdByUserId={currentUser?.id ?? "user-001"}
                    formMode="create"
                    allowUnlinked={false}
                    submitLabel={t.invoice.saveAndMarkAsPaid}
                    onSuccess={onSuccess}
                    onCancel={() => onOpenChange(false)}
                    onReady={handleFormReady}
                  />
                )}
              </>
            )}

            {/* Invoice-and-pay (dashboard): same form */}
            {mode === "invoice-and-pay" && (patientId || invoiceProp?.patientId) && (
              <CreateInvoiceForm
                key={`invoice-and-pay-${patientId ?? invoiceProp?.patientId}-${defaultAppointmentId ?? invoiceProp?.appointmentId ?? ""}`}
                patientId={patientId ?? invoiceProp!.patientId}
                patientAppointments={
                  invoiceProp
                    ? [
                        {
                          id: invoiceProp.appointmentId,
                          patient_id: invoiceProp.patientId,
                          scheduled_at: "",
                          type: invoiceProp.appointmentType,
                          status: "",
                          doctor_id: invoiceProp.doctorId,
                          clinic_id: invoiceProp.clinicId,
                        },
                      ]
                    : patientAppointments
                }
                defaultAppointmentId={defaultAppointmentId ?? invoiceProp?.appointmentId}
                invoice={invoiceProp}
                clinicId={currentClinic?.id ?? invoiceProp?.clinicId ?? "clinic-001"}
                doctorId={currentUser?.id ?? invoiceProp?.doctorId ?? "user-001"}
                createdByUserId={currentUser?.id ?? "user-001"}
                formMode="create"
                allowUnlinked={false}
                submitLabel={invoiceProp ? undefined : t.invoice.saveAndMarkAsPaid}
                onSuccess={onSuccess}
                onCancel={() => onOpenChange(false)}
                onReady={handleFormReady}
              />
            )}

            {/* Update-due-only (patient profile): same form */}
            {mode === "update-due-only" && patientId && (
              <CreateInvoiceForm
                key={`update-due-${patientId}`}
                patientId={patientId}
                patientAppointments={patientAppointments}
                clinicId={currentClinic?.id ?? "clinic-001"}
                doctorId={currentUser?.id ?? "user-001"}
                createdByUserId={currentUser?.id ?? "user-001"}
                formMode="update-due"
                allowUnlinked
                onSuccess={onSuccess}
                onCancel={() => onOpenChange(false)}
                onReady={handleFormReady}
              />
            )}
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          {payOnlyMode ? (
            <Button onClick={handleSubmit} disabled={!canSubmitPayOnly || loading}>
              {loading ? t.common.processing : submitLabelPayOnly}
            </Button>
          ) : (
            <Button
              onClick={() => formSubmitRef.current()}
              disabled={!formState.canSubmit || formState.loading}
            >
              {formState.loading ? t.common.processing : formState.submitLabel}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
