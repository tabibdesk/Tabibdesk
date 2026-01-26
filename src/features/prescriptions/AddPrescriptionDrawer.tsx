"use client"

import { useState, useEffect } from "react"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"
import { Button } from "@/components/Button"
import { Label } from "@/components/Label"
import { Textarea } from "@/components/Textarea"
import { RiAddLine, RiCloseLine } from "@remixicon/react"
import type { CreatePrescriptionPayload, PrescriptionItem } from "./prescriptions.types"
import { MedicationFormFields } from "./MedicationFormFields"

interface AddPrescriptionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CreatePrescriptionPayload) => Promise<void>
  patientId: string
  clinicId: string
  doctorId?: string
}

export function AddPrescriptionDrawer({
  open,
  onOpenChange,
  onSubmit,
  patientId,
  clinicId,
  doctorId,
}: AddPrescriptionDrawerProps) {
  const [notesToPatient, setNotesToPatient] = useState("")
  const [items, setItems] = useState<PrescriptionItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      // Reset form when drawer opens
      setNotesToPatient("")
      setItems([])
    }
  }, [open])

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `temp-${Date.now()}-${items.length}`,
        name: "",
        sig: "",
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, updates: Partial<PrescriptionItem>) => {
    setItems(
      items.map((item, i) => (i === index ? { ...item, ...updates } : item))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Require at least one medication item
    const validItems = items.map(({ id, ...rest }) => rest).filter((item) => item.name.trim() && item.sig.trim())
    if (validItems.length === 0) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        clinicId,
        patientId,
        doctorId,
        diagnosisText: "", // Empty since field is removed
        notesToPatient: notesToPatient.trim() || undefined,
        items: validItems,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create prescription:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>New Prescription</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Medications Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Medications</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addItem}
                    className="gap-2"
                  >
                    <RiAddLine className="size-4" />
                    Add Medication
                  </Button>
                </div>

                {items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-8 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No medications added yet
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addItem}
                      className="mt-3"
                    >
                      Add First Medication
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 space-y-4"
                      >
                        {/* Medication Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                            Medication {index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                          >
                            <RiCloseLine className="size-4" />
                          </Button>
                        </div>

                        {/* Medication Details */}
                        <MedicationFormFields
                          data={item}
                          onChange={(updates) => updateItem(index, updates)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes to Patient */}
              <div className="space-y-2">
                <Label htmlFor="notesToPatient">Notes to Patient</Label>
                <Textarea
                  id="notesToPatient"
                  value={notesToPatient}
                  onChange={(e) => setNotesToPatient(e.target.value)}
                  placeholder="Additional instructions or notes for the patient"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={items.filter((item) => item.name.trim() && item.sig.trim()).length === 0}
                className="flex-[2]"
              >
                Save Prescription
              </Button>
            </div>
          </form>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
