"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Select } from "@/components/Select"
import { useToast } from "@/hooks/useToast"
import {
  getClinicAppointmentTypes,
  getDoctorPricing,
  getPriceForAppointmentType,
} from "@/api/pricing.api"
import {
  updateInvoiceLineItems,
  markInvoicePaid,
  recordPartialPaymentWithOptionalDue,
  voidInvoice,
  createInvoiceWithAmount,
} from "@/api/invoices.api"
import { getOrCreateDraftDue, addOrUpdateCharges, clearDraftDue } from "@/api/draft-due.api"
import { createPayment as createInvoiceLinkedPayment } from "@/api/payments.api"
import { uploadFile } from "@/api/files.api"
import type { PaymentMethod } from "@/types/payment"
import type { Invoice } from "@/types/invoice"
import { formatAptLabel, type PatientAppointment } from "./invoiceDrawer.utils"
import { RiAddLine, RiDeleteBinLine, RiFileLine } from "@remixicon/react"

interface ProcedureLine {
  id: string
  label: string
  amount: number
}

export interface CreateInvoiceFormReadyState {
  canSubmit: boolean
  submitLabel: string
  loading: boolean
  submit: () => Promise<void>
}

export interface CreateInvoiceFormProps {
  patientId: string
  patientAppointments: PatientAppointment[]
  defaultAppointmentId?: string
  invoice?: Invoice | null
  clinicId: string
  doctorId: string
  createdByUserId: string
  formMode: "create" | "update-due"
  allowUnlinked?: boolean
  submitLabel?: string
  onSuccess: () => void
  onCancel: () => void
  /** Called when form state changes so the parent can wire the drawer footer. */
  onReady?: (state: CreateInvoiceFormReadyState) => void
}

export function CreateInvoiceForm({
  patientId,
  patientAppointments,
  defaultAppointmentId,
  invoice: invoiceProp = null,
  clinicId,
  doctorId,
  createdByUserId,
  formMode,
  allowUnlinked = false,
  submitLabel: submitLabelProp,
  onSuccess,
  onCancel,
  onReady,
}: CreateInvoiceFormProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [appointmentId, setAppointmentId] = useState<"unlinked" | string>("unlinked")
  const [waiveConsultation, setWaiveConsultation] = useState(false)
  const [consultationAmount, setConsultationAmount] = useState(0)
  const [procedureLines, setProcedureLines] = useState<ProcedureLine[]>([])
  const [discountPercent, setDiscountPercent] = useState<0 | 10 | 20 | 30>(0)
  const [serviceTypes, setServiceTypes] = useState<string[]>([])
  const [pricing, setPricing] = useState<Record<string, number>>({})
  const [procedureInput, setProcedureInput] = useState("")
  const [procedureAmount, setProcedureAmount] = useState("")
  const [showProcedureSuggestions, setShowProcedureSuggestions] = useState(false)
  const procedureAutocompleteRef = useRef<HTMLDivElement>(null)
  const [markAsPaid, setMarkAsPaid] = useState(formMode === "create")
  const [amountToCollect, setAmountToCollect] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [createDueForRemainder, setCreateDueForRemainder] = useState(true)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofFileId, setProofFileId] = useState<string | undefined>(undefined)
  const [uploadingProof, setUploadingProof] = useState(false)

  const sortedAppointments = useMemo(
    () =>
      [...patientAppointments].sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
      ),
    [patientAppointments]
  )

  const selectedApt = useMemo(
    () => sortedAppointments.find((a) => a.id === appointmentId) ?? null,
    [sortedAppointments, appointmentId]
  )

  const procedureSuggestions = useMemo(() => {
    const q = procedureInput.trim().toLowerCase()
    const list = serviceTypes.filter((t) => t.toLowerCase() !== "consultation")
    if (!q) return list.map((t) => ({ label: t, amount: pricing[t] ?? 0 }))
    return list
      .filter((t) => t.toLowerCase().includes(q))
      .map((t) => ({ label: t, amount: pricing[t] ?? 0 }))
  }, [procedureInput, serviceTypes, pricing])

  const subTotal = useMemo(() => {
    const consult = waiveConsultation ? 0 : consultationAmount
    const procs = procedureLines.reduce((s, p) => s + p.amount, 0)
    return consult + procs
  }, [waiveConsultation, consultationAmount, procedureLines])

  const discountAmount = subTotal * (discountPercent / 100)
  const total = Math.max(0, subTotal - discountAmount)
  const parsedAmount = amountToCollect ? Number(amountToCollect) : NaN
  const hasAmountChanged =
    total > 0 && Number.isFinite(parsedAmount) && Math.abs(parsedAmount - total) > 0.0001

  // Load service types and pricing
  useEffect(() => {
    let cancelled = false
    Promise.all([
      getClinicAppointmentTypes(clinicId),
      getDoctorPricing({ clinicId, doctorId }),
    ]).then(([types, pr]) => {
      if (cancelled) return
      setServiceTypes(types)
      setPricing(pr)
    })
    return () => {
      cancelled = true
    }
  }, [clinicId, doctorId])

  // Reset / init form when props change
  useEffect(() => {
    let cancelled = false
    setProofFile(null)
    setProofFileId(undefined)
    setUploadingProof(false)

    if (invoiceProp && invoiceProp.lineItems && invoiceProp.lineItems.length > 0) {
      const consultation = invoiceProp.lineItems.find((i) => i.type === "consultation")
      const waived = consultation?.amount === 0
      setWaiveConsultation(waived)
      setConsultationAmount(waived ? 0 : (consultation?.amount ?? 500))
      setProcedureLines(
        invoiceProp.lineItems
          .filter((i) => i.type === "procedure")
          .map((i) => ({ id: i.id, label: i.label, amount: i.amount }))
      )
      const discountLine = invoiceProp.lineItems.find((i) => i.type === "discount")
      const discAmt = discountLine ? -discountLine.amount : 0
      const st =
        (invoiceProp.lineItems.find((i) => i.type === "consultation")?.amount ?? 0) +
        invoiceProp.lineItems
          .filter((i) => i.type === "procedure")
          .reduce((s, i) => s + i.amount, 0)
      const pct = st > 0 && discAmt > 0 ? Math.round((100 * discAmt) / st) : 0
      const snapped = (pct <= 5 ? 0 : pct <= 15 ? 10 : pct <= 25 ? 20 : 30) as 0 | 10 | 20 | 30
      setDiscountPercent(snapped)
      setAmountToCollect(String(invoiceProp.amount))
      setAppointmentId(invoiceProp.appointmentId || "unlinked")
      return
    }

    if (invoiceProp && (!invoiceProp.lineItems || invoiceProp.lineItems.length === 0)) {
      getPriceForAppointmentType({ clinicId, doctorId, appointmentType: "Consultation" }).then(
        (price) => {
          if (cancelled) return
          const p = price ?? 500
          setConsultationAmount(p)
          setAmountToCollect(String(p))
        }
      )
      return () => {
        cancelled = true
      }
    }

    const first = defaultAppointmentId ?? sortedAppointments[0]?.id ?? "unlinked"
    setAppointmentId(allowUnlinked && first === "unlinked" ? "unlinked" : first)
    setWaiveConsultation(false)
    setProcedureLines([])
    setDiscountPercent(0)
    setProcedureInput("")
    setProcedureAmount("")
    setMarkAsPaid(formMode === "create")
    setMethod("cash")
    setCreateDueForRemainder(true)

    const apt = sortedAppointments[0]
    const clinicIdFinal = apt?.clinic_id || clinicId
    const doctorIdFinal = apt?.doctor_id || doctorId
    getPriceForAppointmentType({
      clinicId: clinicIdFinal,
      doctorId: doctorIdFinal,
      appointmentType: apt?.type || "Consultation",
    }).then((price) => {
      if (cancelled) return
      const p = price ?? 500
      setConsultationAmount(p)
      if (formMode === "create") setAmountToCollect(String(p))
    })

    return () => {
      cancelled = true
    }
  }, [
    invoiceProp,
    defaultAppointmentId,
    sortedAppointments,
    allowUnlinked,
    formMode,
    clinicId,
    doctorId,
  ])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        procedureAutocompleteRef.current &&
        !procedureAutocompleteRef.current.contains(e.target as Node)
      ) {
        setShowProcedureSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const addFromService = (type: string) => {
    const amount = pricing[type] ?? 0
    if (amount <= 0) return
    setProcedureLines((prev) => [
      ...prev,
      { id: `proc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, label: type, amount },
    ])
    setProcedureInput("")
    setShowProcedureSuggestions(false)
  }

  const addCustom = () => {
    const n = Number(procedureAmount)
    if (!procedureInput.trim() || !Number.isFinite(n) || n <= 0) return
    setProcedureLines((prev) => [
      ...prev,
      {
        id: `proc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        label: procedureInput.trim(),
        amount: n,
      },
    ])
    setProcedureInput("")
    setProcedureAmount("")
    setShowProcedureSuggestions(false)
  }

  const removeProcedure = (id: string) => {
    setProcedureLines((prev) => prev.filter((p) => p.id !== id))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingProof(true)
    try {
      const uploaded = await uploadFile({
        clinicId,
        entityType: "payment",
        entityId: invoiceProp?.id ?? `temp_${Date.now()}`,
        file,
      })
      setProofFileId(uploaded.fileId)
      setProofFile(file)
      showToast("Proof uploaded", "success")
    } catch (error) {
      showToast("Failed to upload proof", "error")
    } finally {
      setUploadingProof(false)
    }
  }

  const handleSubmit = async () => {
    if (formMode === "update-due") {
      setLoading(true)
      try {
        const draft = await getOrCreateDraftDue({
          patientId,
          clinicId,
          doctorId,
          appointmentId: appointmentId === "unlinked" ? null : appointmentId,
        })
        const draftUpdated = await addOrUpdateCharges({
          draftDueId: draft.id,
          consultationWaived: waiveConsultation,
          consultationAmount: waiveConsultation ? 0 : consultationAmount,
          procedureLines: procedureLines.map((p) => ({ id: p.id, label: p.label, amount: p.amount })),
          discountAmount,
        })
        if (markAsPaid && total > 0) {
          const aptId = appointmentId === "unlinked" ? "" : appointmentId
          const inv = await createInvoiceWithAmount({
            clinicId,
            doctorId,
            patientId,
            appointmentId: aptId,
            appointmentType: selectedApt?.type || "Consultation",
            amount: total,
          })
          const updated = await updateInvoiceLineItems({
            invoiceId: inv.id,
            consultationWaived: waiveConsultation,
            consultationAmount: waiveConsultation ? 0 : consultationAmount,
            procedureLines: procedureLines.map((p) => ({ id: p.id, label: p.label, amount: p.amount })),
            discountAmount,
          })
          const isFullPayment = !hasAmountChanged
          const remainder = total - parsedAmount
          const shouldCreateDue = createDueForRemainder && remainder > 0.01
          if (isFullPayment) {
            await createInvoiceLinkedPayment({
              clinicId: updated.clinicId,
              invoiceId: updated.id,
              patientId: updated.patientId,
              appointmentId: updated.appointmentId,
              amount: parsedAmount,
              method,
              proofFileId: method !== "cash" ? proofFileId : undefined,
              createdByUserId,
            })
            await markInvoicePaid(updated.id)
            showToast("Payment recorded successfully", "success")
          } else {
            await voidInvoice(updated.id)
            const { dueInvoice } = await recordPartialPaymentWithOptionalDue({
              clinicId: updated.clinicId,
              doctorId: updated.doctorId,
              patientId: updated.patientId,
              appointmentId: updated.appointmentId ?? "",
              appointmentType: updated.appointmentType ?? "Consultation",
              amountPaid: parsedAmount,
              serviceAmount: total,
              createDueForRemainder: shouldCreateDue,
              createdByUserId,
            })
            if (dueInvoice) {
              showToast(
                `Payment recorded. Due created for ${dueInvoice.amount.toFixed(2)} EGP.`,
                "success"
              )
            } else {
              showToast("Payment recorded successfully", "success")
            }
          }
          await clearDraftDue(draftUpdated.id)
        } else {
          showToast(`Due updated: ${total.toFixed(2)} EGP`, "success")
        }
        onSuccess()
        onCancel()
      } catch (error) {
        showToast("Failed to update due", "error")
      } finally {
        setLoading(false)
      }
      return
    }

    // formMode === "create"
    if (invoiceProp) {
      setLoading(true)
      try {
        await updateInvoiceLineItems({
          invoiceId: invoiceProp.id,
          consultationWaived: waiveConsultation,
          consultationAmount: waiveConsultation ? 0 : consultationAmount,
          procedureLines: procedureLines.map((p) => ({ id: p.id, label: p.label, amount: p.amount })),
          discountAmount,
        })
        if (markAsPaid) {
          const isFullPayment = !hasAmountChanged
          const remainder = total - parsedAmount
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
              createdByUserId,
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
              serviceAmount: total,
              createDueForRemainder: shouldCreateDue,
              createdByUserId,
            })
            if (dueInvoice) {
              showToast(
                `Payment recorded. Due record created for ${dueInvoice.amount.toFixed(2)} EGP.`,
                "success"
              )
            } else {
              showToast("Payment recorded successfully", "success")
            }
          }
        } else {
          showToast(`Invoice updated: ${total.toFixed(2)} EGP`, "success")
        }
        onSuccess()
        onCancel()
      } catch (error) {
        showToast("Failed to update invoice", "error")
      } finally {
        setLoading(false)
      }
      return
    }

    if (!selectedApt) {
      showToast("Please select an appointment", "error")
      return
    }

    setLoading(true)
    try {
      const inv = await createInvoiceWithAmount({
        clinicId: selectedApt.clinic_id || clinicId,
        doctorId: selectedApt.doctor_id || doctorId,
        patientId,
        appointmentId: selectedApt.id,
        appointmentType: selectedApt.type || "Consultation",
        amount: total,
      })
      const updated = await updateInvoiceLineItems({
        invoiceId: inv.id,
        consultationWaived: waiveConsultation,
        consultationAmount: waiveConsultation ? 0 : consultationAmount,
        procedureLines: procedureLines.map((p) => ({ id: p.id, label: p.label, amount: p.amount })),
        discountAmount,
      })
      if (markAsPaid) {
        const isFullPayment = !hasAmountChanged
        const remainder = total - parsedAmount
        const shouldCreateDue = createDueForRemainder && remainder > 0.01
        if (isFullPayment) {
          await createInvoiceLinkedPayment({
            clinicId: updated.clinicId,
            invoiceId: updated.id,
            patientId: updated.patientId,
            appointmentId: updated.appointmentId,
            amount: parsedAmount,
            method,
            proofFileId: method !== "cash" ? proofFileId : undefined,
            createdByUserId,
          })
          await markInvoicePaid(updated.id)
          showToast("Payment recorded successfully", "success")
        } else {
          await voidInvoice(updated.id)
          const { dueInvoice } = await recordPartialPaymentWithOptionalDue({
            clinicId: updated.clinicId,
            doctorId: updated.doctorId,
            patientId: updated.patientId,
            appointmentId: updated.appointmentId ?? "",
            appointmentType: updated.appointmentType ?? "Consultation",
            amountPaid: parsedAmount,
            serviceAmount: total,
            createDueForRemainder: shouldCreateDue,
            createdByUserId,
          })
          if (dueInvoice) {
            showToast(
              `Payment recorded. Due record created for ${dueInvoice.amount.toFixed(2)} EGP.`,
              "success"
            )
          } else {
            showToast("Payment recorded successfully", "success")
          }
        }
      } else {
        showToast(`Invoice created: ${total.toFixed(2)} EGP`, "success")
      }
      onSuccess()
      onCancel()
    } catch (error) {
      showToast("Failed to create invoice", "error")
    } finally {
      setLoading(false)
    }
  }

  const canSubmit =
    (total > 0 || waiveConsultation) &&
    !(formMode === "create" && !invoiceProp && !selectedApt)

  const submitLabel =
    submitLabelProp ??
    (formMode === "update-due"
      ? markAsPaid
        ? "Save & Mark as Paid"
        : "Update due"
      : markAsPaid
        ? "Save & Mark as Paid"
        : "Create invoice")

  const handleSubmitRef = useRef(handleSubmit)
  handleSubmitRef.current = handleSubmit
  const submitStable = useCallback(() => handleSubmitRef.current(), [])

  const noAppointments = sortedAppointments.length === 0 && !allowUnlinked
  useEffect(() => {
    if (noAppointments) {
      onReady?.({
        canSubmit: false,
        submitLabel: submitLabelProp ?? "Save",
        loading: false,
        submit: async () => {},
      })
    } else {
      onReady?.({
        canSubmit,
        submitLabel,
        loading,
        submit: submitStable,
      })
    }
  }, [onReady, noAppointments, canSubmit, submitLabel, loading, submitStable, submitLabelProp])

  if (noAppointments) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No appointments found for this patient.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Appointment</Label>
        <Select value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)}>
          {allowUnlinked && <option value="unlinked">Unlinked</option>}
          {sortedAppointments.map((apt) => (
            <option key={apt.id} value={apt.id}>
              {formatAptLabel(apt)}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Procedures</Label>
        <ul className="space-y-2">
          <li className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {waiveConsultation ? "Consultation — Waived" : "Consultation"}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {waiveConsultation ? "0.00" : consultationAmount.toFixed(2)} EGP
              </span>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={waiveConsultation}
                  onChange={(e) => setWaiveConsultation(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-gray-700"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Waive</span>
              </label>
            </div>
          </li>
          {procedureLines.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-950"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {p.label}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {p.amount.toFixed(2)} EGP
                </span>
                <button
                  type="button"
                  onClick={() => removeProcedure(p.id)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800 dark:hover:text-red-400"
                  aria-label="Remove line"
                >
                  <RiDeleteBinLine className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div ref={procedureAutocompleteRef} className="flex flex-1 flex-wrap gap-2">
          <div className="relative min-w-0 flex-1">
            <Input
              placeholder="Search or add procedure"
              value={procedureInput}
              onChange={(e) => {
                setProcedureInput(e.target.value)
                setShowProcedureSuggestions(true)
              }}
              onFocus={() => setShowProcedureSuggestions(true)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  procedureSuggestions.length > 0 &&
                  procedureInput.trim()
                ) {
                  const match = procedureSuggestions.find(
                    (s) => s.label.toLowerCase() === procedureInput.trim().toLowerCase()
                  )
                  if (match && match.amount > 0) {
                    e.preventDefault()
                    addFromService(match.label)
                    return
                  }
                }
                if (e.key === "Enter" && procedureInput.trim() && Number(procedureAmount) > 0) {
                  e.preventDefault()
                  addCustom()
                }
              }}
              className="min-w-0"
              autoComplete="off"
            />
            {showProcedureSuggestions && (
              <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                {procedureSuggestions.length > 0 ? (
                  procedureSuggestions.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => addFromService(s.label)}
                      className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-50 dark:text-gray-50 dark:hover:bg-gray-800"
                    >
                      <span className="font-medium">{s.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {(s.amount ?? 0).toFixed(0)} EGP
                      </span>
                    </button>
                  ))
                ) : procedureInput.trim() ? (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    No saved services match. Type amount and tap Add for custom.
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    Type to search saved services, or enter a custom label.
                  </div>
                )}
              </div>
            )}
          </div>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Amount"
            value={procedureAmount}
            onChange={(e) => setProcedureAmount(e.target.value)}
            className="w-24"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addCustom}
            disabled={
              !procedureInput.trim() ||
              !Number(procedureAmount) ||
              Number(procedureAmount) <= 0
            }
          >
            <RiAddLine className="size-4" />
          </Button>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          id="mark-as-paid"
          checked={markAsPaid}
          onChange={(e) => {
            setMarkAsPaid(e.target.checked)
            if (e.target.checked && total > 0) setAmountToCollect(String(total))
          }}
          className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-gray-700"
        />
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Mark as paid</span>
      </label>

      {markAsPaid && (
        <>
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount collected (EGP) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amountToCollect}
              onChange={(e) => setAmountToCollect(e.target.value)}
              placeholder="0.00"
              required
            />
            {hasAmountChanged && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Collecting {parsedAmount.toFixed(2)} of {total.toFixed(2)} EGP (partial payment)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">
              Payment method <span className="text-red-500">*</span>
            </Label>
            <Select id="method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              <option value="cash">Cash</option>
              <option value="visa">Visa</option>
              <option value="instapay">InstaPay</option>
            </Select>
          </div>

          {(method === "visa" || method === "instapay") && (
            <div className="space-y-2">
              <Label htmlFor="proof">
                Payment proof <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="proof"
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

          {hasAmountChanged && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
              <input
                type="checkbox"
                id="create-due"
                checked={createDueForRemainder}
                onChange={(e) => setCreateDueForRemainder(e.target.checked)}
                className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-gray-700"
              />
              <Label htmlFor="create-due" className="flex-1 cursor-pointer text-sm">
                Create due for remainder ({(total - parsedAmount).toFixed(2)} EGP)
              </Label>
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/30">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total</span>
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {total.toFixed(2)} EGP
        </span>
      </div>

      <div className="space-y-2">
        <Label>Discount</Label>
        <div className="flex flex-wrap gap-2">
          {([10, 20, 30] as const).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setDiscountPercent(discountPercent === val ? 0 : val)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                discountPercent === val
                  ? "bg-primary-600 text-white dark:bg-primary-500"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {val}%
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
