"use client"

import { useEffect, useMemo, useState } from "react"
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
import { mockData, mockDoctor } from "@/data/mock/mock-data"
import { getPriceForAppointmentType } from "@/api/pricing.api"
import {
  createInvoiceForArrivedAppointment,
  createInvoiceWithAmount,
  markInvoicePaid,
  recordPartialPaymentWithOptionalDue,
  voidInvoice,
} from "@/api/invoices.api"
import { createPayment as createInvoiceLinkedPayment } from "@/api/payments.api"
import { uploadFile } from "@/api/files.api"
import type { PaymentMethod } from "@/types/payment"
import type { Invoice } from "@/types/invoice"
import { PatientAutocomplete, type PatientOption } from "./PatientAutocomplete"
import {
  RiUploadLine,
  RiFileLine,
  RiUserLine,
  RiStethoscopeLine,
  RiCalendarLine,
} from "@remixicon/react"

type AmountChangeReason = "payment_later" | "discount_applied"

interface CapturePaymentDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  /** When provided (e.g. from Dues tab), drawer runs in "Mark Invoice as Paid" mode: summary from invoice, no patient/appointment picker. */
  invoice?: Invoice | null
}

function formatAppointmentLabel(apt: { scheduled_at: string; type: string }) {
  const date = new Date(apt.scheduled_at)
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  return `${dateStr} ${timeStr} • ${apt.type}`
}

function getPatientName(patientId: string) {
  const patient = mockData.patients.find((p) => p.id === patientId)
  return patient ? `${patient.first_name} ${patient.last_name}` : "Unknown Patient"
}

function getDoctorName(doctorId: string) {
  return mockDoctor?.full_name ?? "Dr. Unknown"
}

function getAppointmentData(appointmentId: string) {
  const appointment = mockData.appointments.find((a) => a.id === appointmentId)
  if (!appointment) return null
  const date = new Date(appointment.scheduled_at)
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  }
}

export function CapturePaymentDrawer({
  open,
  onOpenChange,
  onSuccess,
  invoice: invoiceProp = null,
}: CapturePaymentDrawerProps) {
  const { currentClinic, currentUser } = useUserClinic()
  const { showToast } = useToast()

  const isMarkPaidMode = invoiceProp != null

  const [loading, setLoading] = useState(false)
  const [patientDisplayValue, setPatientDisplayValue] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null)
  const [appointmentId, setAppointmentId] = useState<string>("")
  const [serviceAmount, setServiceAmount] = useState<number | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [reason, setReason] = useState<AmountChangeReason | "">("")
  const [createDueForRemainder, setCreateDueForRemainder] = useState(true)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofFileId, setProofFileId] = useState<string | undefined>(undefined)
  const [uploadingProof, setUploadingProof] = useState(false)

  const appointments = useMemo(() => {
    const clinicId = currentClinic?.id
    const patientId = selectedPatient?.id
    if (!clinicId || !patientId) return []
    return mockData.appointments
      .filter((a) => (a.clinic_id || "") === clinicId && a.patient_id === patientId)
      .slice()
      .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))
  }, [currentClinic?.id, selectedPatient?.id])

  const selectedAppointment = useMemo(
    () => appointments.find((a) => a.id === appointmentId) || null,
    [appointments, appointmentId]
  )

  const parsedAmount = amount ? Number(amount) : NaN
  const effectiveServiceAmount = isMarkPaidMode ? (invoiceProp?.amount ?? 0) : (serviceAmount ?? 0)
  const hasAmountChanged =
    effectiveServiceAmount > 0 &&
    Number.isFinite(parsedAmount) &&
    Math.abs(parsedAmount - effectiveServiceAmount) > 0.0001

  // Reset form when opening
  useEffect(() => {
    if (!open) return
    setLoading(false)
    setProofFile(null)
    setProofFileId(undefined)
    setUploadingProof(false)
    if (isMarkPaidMode && invoiceProp) {
      setServiceAmount(invoiceProp.amount)
      setAmount(String(invoiceProp.amount))
      setMethod("cash")
      setReason("")
      setCreateDueForRemainder(true)
    } else {
      setPatientDisplayValue("")
      setSelectedPatient(null)
      setAppointmentId("")
      setServiceAmount(null)
      setAmount("")
      setMethod("cash")
      setReason("")
      setCreateDueForRemainder(true)
    }
  }, [open, isMarkPaidMode, invoiceProp])

  // Clear appointment when patient changes (Capture mode only)
  useEffect(() => {
    if (isMarkPaidMode) return
    setAppointmentId("")
    setServiceAmount(null)
    setAmount("")
    setReason("")
  }, [selectedPatient?.id, isMarkPaidMode])

  // Prefill service value on appointment selection (Capture mode only)
  useEffect(() => {
    let cancelled = false
    async function prefill() {
      if (!open || !selectedAppointment || !currentClinic?.id || isMarkPaidMode) return
      try {
        const price = await getPriceForAppointmentType({
          clinicId: currentClinic.id,
          doctorId: selectedAppointment.doctor_id || "user-001",
          appointmentType: selectedAppointment.type,
        })
        if (cancelled) return
        const nextServiceAmount = price ?? 0
        setServiceAmount(nextServiceAmount)
        setAmount(nextServiceAmount ? String(nextServiceAmount) : "")
        setReason("")
      } catch (e) {
        console.error("Failed to load service value:", e)
        if (!cancelled) {
          setServiceAmount(null)
          setAmount("")
          showToast("Failed to load service value for this appointment type", "error")
        }
      }
    }
    prefill()
    return () => {
      cancelled = true
    }
  }, [open, selectedAppointment, currentClinic?.id, showToast, isMarkPaidMode])

  useEffect(() => {
    if (!hasAmountChanged) setReason("")
  }, [hasAmountChanged])

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProofFile(file)
    setUploadingProof(true)
    try {
      const result = await uploadFile({
        clinicId: currentClinic.id,
        entityType: "payment",
        entityId: invoiceProp?.id ?? `temp_${Date.now()}`,
        file,
      })
      setProofFileId(result.fileId)
    } catch (error) {
      console.error("Failed to upload proof:", error)
      showToast("Failed to upload proof", "error")
      setProofFile(null)
    } finally {
      setUploadingProof(false)
    }
  }

  const canSubmit = () => {
    if (isMarkPaidMode) {
      if (!invoiceProp) return false
      if (!amount || !Number.isFinite(parsedAmount) || parsedAmount < 0) return false
      if (hasAmountChanged && !reason) return false
      if (loading) return false
      const proofOk = method === "cash" || proofFileId !== undefined
      return proofOk
    }
    if (!selectedAppointment) return false
    if (!amount || !Number.isFinite(parsedAmount) || parsedAmount < 0) return false
    if (hasAmountChanged && !reason) return false
    if (loading) return false
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
      showToast("Please enter a valid amount", "error")
      return
    }
    if (hasAmountChanged && !reason) {
      showToast("Please select a reason for changing the amount", "error")
      return
    }
    if ((method === "visa" || method === "instapay") && !proofFileId) {
      showToast("Proof upload is required for Visa and InstaPay payments", "error")
      return
    }

    setLoading(true)

    if (isMarkPaidMode && invoiceProp) {
      try {
        const isFullPayment = !hasAmountChanged
        const isPaymentLater = reason === "payment_later"
        const remainder = invoiceProp.amount - parsedAmount
        const shouldCreateDue = isPaymentLater && createDueForRemainder && remainder > 0.01

        if (isFullPayment) {
          await createInvoiceLinkedPayment({
            clinicId: invoiceProp.clinicId,
            invoiceId: invoiceProp.id,
            patientId: invoiceProp.patientId,
            appointmentId: invoiceProp.appointmentId,
            amount: parsedAmount,
            method,
            proofFileId: method !== "cash" ? proofFileId : undefined,
            createdByUserId: currentUser.id,
          })
          await markInvoicePaid(invoiceProp.id)
          showToast("Payment recorded successfully", "success")
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
            createdByUserId: currentUser.id,
          })
          if (dueInvoice) {
            showToast(`Payment recorded. Due record created for ${dueInvoice.amount.toFixed(2)} EGP.`, "success")
          } else {
            showToast("Payment recorded successfully", "success")
          }
        }
        onSuccess()
        onOpenChange(false)
      } catch (error) {
        console.error("Failed to record payment:", error)
        showToast(error instanceof Error ? error.message : "Failed to record payment", "error")
      } finally {
        setLoading(false)
      }
      return
    }

    if (!selectedAppointment || !currentClinic?.id) return

    const clinicId = selectedAppointment.clinic_id || currentClinic.id
    const doctorId = selectedAppointment.doctor_id || "user-001"
    const patientId = selectedAppointment.patient_id
    const aptId = selectedAppointment.id
    const appointmentType = selectedAppointment.type

    try {
      const isFullPayment = !hasAmountChanged
      const isPaymentLater = reason === "payment_later"
      const remainder = serviceAmount !== null ? serviceAmount - parsedAmount : 0
      const shouldCreateDue = isPaymentLater && createDueForRemainder && remainder > 0.01

      if (isFullPayment) {
        const invoice = await createInvoiceForArrivedAppointment({
          id: aptId,
          clinic_id: clinicId,
          doctor_id: doctorId,
          patient_id: patientId,
          type: appointmentType,
        })
        await createInvoiceLinkedPayment({
          clinicId: invoice.clinicId,
          invoiceId: invoice.id,
          patientId: invoice.patientId,
          appointmentId: invoice.appointmentId,
          amount: parsedAmount,
          method: "cash",
          createdByUserId: currentUser.id,
        })
        await markInvoicePaid(invoice.id)
        showToast("Payment captured successfully", "success")
      } else if (isPaymentLater) {
        const { dueInvoice } = await recordPartialPaymentWithOptionalDue({
          clinicId,
          doctorId,
          patientId,
          appointmentId: aptId,
          appointmentType,
          amountPaid: parsedAmount,
          serviceAmount: serviceAmount ?? 0,
          createDueForRemainder: shouldCreateDue,
          createdByUserId: currentUser.id,
        })
        if (dueInvoice) {
          showToast(`Payment captured. Due record created for ${dueInvoice.amount.toFixed(2)} EGP.`, "success")
        } else {
          showToast("Payment captured successfully", "success")
        }
      } else {
        const invoice = await createInvoiceWithAmount({
          clinicId,
          doctorId,
          patientId,
          appointmentId: aptId,
          appointmentType,
          amount: parsedAmount,
        })
        await createInvoiceLinkedPayment({
          clinicId: invoice.clinicId,
          invoiceId: invoice.id,
          patientId: invoice.patientId,
          appointmentId: invoice.appointmentId,
          amount: parsedAmount,
          method: "cash",
          createdByUserId: currentUser.id,
        })
        await markInvoicePaid(invoice.id)
        showToast("Payment captured successfully", "success")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to capture payment:", error)
      showToast(error instanceof Error ? error.message : "Failed to capture payment", "error")
    } finally {
      setLoading(false)
    }
  }

  const title = isMarkPaidMode ? "Mark Invoice as Paid" : "Capture Payment"
  const submitLabel = isMarkPaidMode ? "Mark as Paid" : "Capture"
  const showSummaryBlock = isMarkPaidMode && invoiceProp
  const appointmentData = showSummaryBlock && invoiceProp ? getAppointmentData(invoiceProp.appointmentId) : null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {showSummaryBlock && invoiceProp && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-50">Appointment Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <RiUserLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Patient</div>
                        <div className="font-medium text-gray-900 dark:text-gray-50">
                          {getPatientName(invoiceProp.patientId)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <RiStethoscopeLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Doctor</div>
                        <div className="font-medium text-gray-900 dark:text-gray-50">
                          {getDoctorName(invoiceProp.doctorId)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <RiStethoscopeLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Appointment Type</div>
                        <div className="font-medium text-gray-900 dark:text-gray-50 capitalize">
                          {invoiceProp.appointmentType}
                        </div>
                      </div>
                    </div>
                    {appointmentData && (
                      <div className="flex items-center gap-3">
                        <RiCalendarLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 dark:text-gray-400">Date & Time</div>
                          <div className="font-medium text-gray-900 dark:text-gray-50">
                            {appointmentData.date} at {appointmentData.time}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <RiFileLine className="size-5 shrink-0 text-gray-600 dark:text-gray-400" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Invoice Amount</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-50">
                          {invoiceProp.amount.toFixed(2)} EGP
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isMarkPaidMode && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="patient">
                      Patient <span className="text-red-500">*</span>
                    </Label>
                    <PatientAutocomplete
                      value={patientDisplayValue}
                      onChange={(v) => {
                        setPatientDisplayValue(v)
                        if (!v.trim()) setSelectedPatient(null)
                      }}
                      onSelect={(p) => {
                        setSelectedPatient(p)
                        setPatientDisplayValue(p.displayName)
                      }}
                      placeholder="Search by name or phone"
                    />
                  </div>

                  {selectedPatient && (
                    <div className="space-y-2">
                      <Label htmlFor="appointment">
                        Appointment <span className="text-red-500">*</span>
                      </Label>
                      {appointments.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No appointments found for this patient.
                        </p>
                      ) : (
                        <Select
                          id="appointment"
                          value={appointmentId}
                          onChange={(e) => setAppointmentId(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Select an appointment
                          </option>
                          {appointments.map((apt) => (
                            <option key={apt.id} value={apt.id}>
                              {formatAppointmentLabel(apt)}
                            </option>
                          ))}
                        </Select>
                      )}
                    </div>
                  )}

                  {selectedAppointment && serviceAmount !== null && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Service ({selectedAppointment.type})
                      </p>
                      <p className="mt-0.5 text-lg font-semibold text-gray-900 dark:text-gray-50">
                        {serviceAmount.toFixed(2)} EGP
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount to collect (EGP) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  disabled={!isMarkPaidMode && !selectedAppointment}
                />
                {effectiveServiceAmount > 0 && hasAmountChanged && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Collecting {parsedAmount.toFixed(2)} of {effectiveServiceAmount.toFixed(2)} EGP — select a reason
                    below.
                  </p>
                )}
              </div>

              {hasAmountChanged && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="reason">
                      Reason for change <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value as AmountChangeReason)}
                      required
                    >
                      <option value="" disabled>
                        Select reason
                      </option>
                      <option value="payment_later">Pay the rest later</option>
                      <option value="discount_applied">Discount applied</option>
                    </Select>
                  </div>
                  {reason === "payment_later" &&
                    effectiveServiceAmount > 0 &&
                    parsedAmount < effectiveServiceAmount && (
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={createDueForRemainder}
                          onChange={(e) => setCreateDueForRemainder(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Create due record for remaining {(effectiveServiceAmount - parsedAmount).toFixed(2)} EGP
                        </span>
                      </label>
                    )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="method">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  disabled={!isMarkPaidMode}
                >
                  <option value="cash">Cash</option>
                  <option value="visa">Visa</option>
                  <option value="instapay">InstaPay</option>
                </Select>
                {!isMarkPaidMode && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Capturing from this drawer currently supports cash only.
                  </p>
                )}
              </div>

              {isMarkPaidMode && (
                <>
                  {(method === "visa" || method === "instapay") && (
                    <div className="space-y-2">
                      <Label htmlFor="proof">
                        Proof of Payment <span className="text-red-500">*</span>
                      </Label>
                      <div className="space-y-2">
                        <label
                          htmlFor="proof"
                          className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm ${
                            !proofFileId
                              ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                          }`}
                        >
                          <RiUploadLine className="size-4" />
                          {proofFile ? proofFile.name : "Upload proof"}
                        </label>
                        <input
                          id="proof"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleProofUpload}
                          className="hidden"
                          disabled={uploadingProof}
                          required={method === "visa" || method === "instapay"}
                        />
                        {uploadingProof && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">Uploading...</p>
                        )}
                        {proofFileId && (
                          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                            <RiFileLine className="size-4" />
                            Proof uploaded successfully
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {method === "cash" && (
                    <div className="space-y-2">
                      <Label htmlFor="proof-cash">Proof of Payment (Optional)</Label>
                      <div className="space-y-2">
                        <label
                          htmlFor="proof-cash"
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <RiUploadLine className="size-4" />
                          {proofFile ? proofFile.name : "Upload proof"}
                        </label>
                        <input
                          id="proof-cash"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleProofUpload}
                          className="hidden"
                          disabled={uploadingProof}
                        />
                        {proofFileId && (
                          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                            <RiFileLine className="size-4" />
                            Proof uploaded successfully
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <DrawerFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!canSubmit()}
                isLoading={loading}
                className="flex-1 sm:flex-initial"
              >
                {submitLabel}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
