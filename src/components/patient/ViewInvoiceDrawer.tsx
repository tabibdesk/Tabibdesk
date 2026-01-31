"use client"

import { useEffect, useState } from "react"
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
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useToast } from "@/hooks/useToast"
import { getInvoiceById, updateInvoiceLineItems } from "@/api/invoices.api"
import { logActivity } from "@/api/activity.api"
import type { Invoice, ChargeLineItem } from "@/types/invoice"
import { format } from "date-fns"
import { RiFileLine, RiPencilLine } from "@remixicon/react"
import { ListSkeleton } from "@/components/skeletons"

interface ViewInvoiceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string | null
  onSuccess?: () => void
}

export function ViewInvoiceDrawer({
  open,
  onOpenChange,
  invoiceId,
  onSuccess,
}: ViewInvoiceDrawerProps) {
  const { currentClinic, currentUser } = useUserClinic()
  const { showToast } = useToast()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [editLineItems, setEditLineItems] = useState<ChargeLineItem[]>([])

  useEffect(() => {
    if (!open || !invoiceId) {
      setInvoice(null)
      setIsEditing(false)
      setShowEditConfirm(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getInvoiceById(invoiceId)
      .then((inv) => {
        if (!cancelled && inv) {
          setInvoice(inv)
          const items = inv.lineItems?.length
            ? inv.lineItems
            : [{ id: `line_${inv.id}`, type: "consultation" as const, label: "Consultation", amount: inv.amount }]
          setEditLineItems(items)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, invoiceId])

  const handleStartEdit = () => {
    setShowEditConfirm(true)
  }

  const handleConfirmEdit = () => {
    setShowEditConfirm(false)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setShowEditConfirm(false)
    if (invoice) setEditLineItems(invoice.lineItems ?? [])
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!invoice || !currentUser) return
    const consultation = editLineItems.find((i) => i.type === "consultation")
    const waived = consultation?.amount === 0
    const consultationAmount = waived ? 0 : (consultation?.amount ?? 0)
    const procedureLines = editLineItems
      .filter((i) => i.type === "procedure")
      .map((i) => ({ id: i.id, label: i.label, amount: i.amount }))
    const discountLine = editLineItems.find((i) => i.type === "discount")
    const discountAmount = discountLine ? -discountLine.amount : 0

    setSaving(true)
    try {
      await updateInvoiceLineItems({
        invoiceId: invoice.id,
        consultationWaived: waived,
        consultationAmount,
        procedureLines,
        discountAmount,
      })
      await logActivity({
        clinicId: currentClinic?.id ?? invoice.clinicId,
        actorUserId: currentUser.id,
        actorName: currentUser.full_name ?? currentUser.email ?? "User",
        action: "update",
        entityType: "invoice",
        entityId: invoice.id,
        entityLabel: `${invoice.amount.toFixed(2)} EGP`,
        message: `Edited invoice ${invoice.id} (${invoice.appointmentType})`,
        meta: { patientId: invoice.patientId },
      })
      showToast("Invoice updated. Change recorded in activity log.", "success")
      const updated = await getInvoiceById(invoice.id)
      if (updated) {
        setInvoice(updated)
        setEditLineItems(updated.lineItems ?? [])
      }
      setIsEditing(false)
      onSuccess?.()
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to update invoice", "error")
    } finally {
      setSaving(false)
    }
  }

  const total = editLineItems.reduce((sum, i) => sum + i.amount, 0)
  const displayItems = invoice?.lineItems?.length ? invoice.lineItems : editLineItems

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <RiFileLine className="size-5 text-primary-600" />
            Invoice details
          </DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          {loading ? (
            <div className="space-y-3 py-4">
              <ListSkeleton rows={5} showHeader />
            </div>
          ) : !invoice ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Invoice not found.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/30">
                <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {format(new Date(invoice.createdAt), "MMM d, yyyy · h:mm a")}
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/30">
                <div className="text-xs text-gray-500 dark:text-gray-400">Appointment type</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {invoice.appointmentType}
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Breakdown
                  </span>
                  {!isEditing && invoice.status === "unpaid" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleStartEdit}
                      className="gap-1.5"
                    >
                      <RiPencilLine className="size-4" />
                      Edit
                    </Button>
                  )}
                </div>
                <ul className="space-y-2">
                  {(isEditing ? editLineItems : displayItems).map((line, idx) => (
                    <li
                      key={line.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-gray-100 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                        {line.label}
                      </span>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          min={line.type === "discount" ? 0 : 0}
                          className="w-24 text-sm"
                          value={line.type === "discount" ? Math.abs(line.amount) : line.amount}
                          onChange={(e) => {
                            const v = Number(e.target.value) || 0
                            setEditLineItems((prev) => {
                              const next = [...prev]
                              next[idx] = {
                                ...next[idx],
                                amount: line.type === "discount" ? -v : v,
                              }
                              return next
                            })
                          }}
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
                          {line.amount >= 0 ? "" : "−"}
                          {Math.abs(line.amount).toFixed(2)} EGP
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {(isEditing ? total : invoice.amount).toFixed(2)} EGP
                </span>
              </div>
              {showEditConfirm && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Are you sure you want to edit this invoice? Your change will be recorded in the
                    activity log.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleConfirmEdit}>
                      Yes, edit
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DrawerBody>
        {invoice && isEditing && (
          <DrawerFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Saving…" : "Save and log activity"}
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
