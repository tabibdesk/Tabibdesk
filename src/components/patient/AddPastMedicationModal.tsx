"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/Dialog"
import { Button } from "@/components/Button"
import { Label } from "@/components/Label"
import { DatePicker } from "@/components/DatePicker"
import { MedicationFormFields } from "@/features/prescriptions/MedicationFormFields"
import type { CreatePastMedicationPayload } from "@/features/prescriptions/prescriptions.types"

interface AddPastMedicationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CreatePastMedicationPayload) => Promise<void>
  patientId: string
}

export function AddPastMedicationModal({
  open,
  onOpenChange,
  onSubmit,
  patientId,
}: AddPastMedicationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    strength: "",
    form: "",
    duration: "",
    notes: "",
    takenFrom: new Date(),
    takenTo: undefined as Date | undefined,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    try {
      // Concatenate strength and form into the name or handle as needed
      // For PastMedication, we only have 'name', 'duration', 'takenFrom', 'takenTo', 'notes'
      const nameWithDetails = formData.name + 
        (formData.strength ? ` ${formData.strength}` : "") + 
        (formData.form ? ` (${formData.form})` : "")

      await onSubmit({
        patientId,
        name: nameWithDetails,
        duration: formData.duration,
        takenFrom: formData.takenFrom.toISOString(),
        takenTo: formData.takenTo?.toISOString() || null,
        notes: formData.notes,
      })
      onOpenChange(false)
      // Reset form
      setFormData({
        name: "",
        strength: "",
        form: "",
        duration: "",
        notes: "",
        takenFrom: new Date(),
        takenTo: undefined,
      })
    } catch (error) {
      console.error("Failed to add past medication:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Past Medication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <MedicationFormFields
            data={formData}
            onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
            showInstructions={false}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Started Taking</Label>
              <DatePicker
                value={formData.takenFrom}
                onChange={(date) => date && setFormData((prev) => ({ ...prev, takenFrom: date }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Stopped Taking (Optional)</Label>
              <DatePicker
                value={formData.takenTo}
                onChange={(date) => setFormData((prev) => ({ ...prev, takenTo: date }))}
                placeholder="Still taking (Ongoing)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!formData.name.trim()}
            >
              Add Medication
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
