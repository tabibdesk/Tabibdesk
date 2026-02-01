"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Select } from "@/components/Select"
import { Textarea } from "@/components/Textarea"

interface MedicationFormFieldsProps {
  data: {
    name: string
    strength?: string
    form?: string
    sig?: string
    duration?: string
    notes?: string
  }
  onChange: (updates: Partial<MedicationFormFieldsProps["data"]>) => void
  showInstructions?: boolean
}

export const MEDICATION_FORMS = ["Tablets", "Capsules", "Syrup", "Cream", "Ointment", "Injection", "Drops", "Inhaler", "Other"]
export const COMMON_MEDICATIONS = [
  "Paracetamol 500mg",
  "Ibuprofen 400mg",
  "Amoxicillin 500mg",
  "Metformin 500mg",
  "Amlodipine 5mg",
  "Omeprazole 20mg",
  "Levothyroxine 50mcg",
  "Aspirin 81mg",
]

export function MedicationFormFields({
  data,
  onChange,
  showInstructions = true,
}: MedicationFormFieldsProps) {
  const t = useAppTranslations()
  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="medication-name">
          {t.profile.medicationName} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="medication-name"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g., Paracetamol 500mg"
          list="medications-list"
          required
        />
        <datalist id="medications-list">
          {COMMON_MEDICATIONS.map((med) => (
            <option key={med} value={med} />
          ))}
        </datalist>
      </div>

      {/* Strength and Form */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="medication-strength">{t.profile.strength}</Label>
          <Input
            id="medication-strength"
            value={data.strength || ""}
            onChange={(e) => onChange({ strength: e.target.value })}
            placeholder="e.g., 500mg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="medication-form">{t.profile.form}</Label>
          <Select
            id="medication-form"
            value={data.form || ""}
            onChange={(e) => onChange({ form: e.target.value })}
          >
            <option value="">{t.profile.selectForm}</option>
            {MEDICATION_FORMS.map((form) => (
              <option key={form} value={form}>
                {form}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="space-y-2">
          <Label htmlFor="medication-sig">
            {t.profile.instructionsSig} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="medication-sig"
            value={data.sig || ""}
            onChange={(e) => onChange({ sig: e.target.value })}
            placeholder="e.g., Take 1 tablet twice daily after meals"
            rows={2}
            required
          />
        </div>
      )}

      {/* Duration */}
      <div className="space-y-2">
        <Label htmlFor="medication-duration">{t.profile.duration}</Label>
        <Input
          id="medication-duration"
          value={data.duration || ""}
          onChange={(e) => onChange({ duration: e.target.value })}
          placeholder="e.g., 5 days"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="medication-notes">{t.profile.notesOptional}</Label>
        <Input
          id="medication-notes"
          value={data.notes || ""}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Additional notes"
        />
      </div>
    </div>
  )
}
