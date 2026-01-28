"use client"

import { BasicInfoCompact } from "./BasicInfoCompact"
import type { PastMedication } from "@/features/prescriptions/prescriptions.types"

interface Patient {
  id: string
  first_name: string
  last_name: string
  age: number | null
  gender: string
  phone: string
  email: string | null
  address: string | null
  height: number | null
  job: string | null
  date_of_birth: string | null
  created_at: string
  updated_at: string
  complaint: string | null
  // Medical conditions
  is_diabetic: boolean | null
  is_hypertensive: boolean | null
  has_pancreatitis: boolean | null
  is_pregnant: boolean | null
  is_breastfeeding: boolean | null
  glp1a_previous_exposure: boolean | null
  has_rheumatoid: boolean | null
  has_ihd: boolean | null
  has_heart_failure: boolean | null
  has_gerd: boolean | null
  has_gastritis: boolean | null
  has_hepatic: boolean | null
  has_anaemia: boolean | null
  has_bronchial_asthma: boolean | null
  thyroid_status: string | null
  history_of_operation: any | null
  ai_diagnosis?: string | null
  ai_diagnosis_updated_at?: string | null
}

interface WeightLog {
  id: string
  patient_id: string
  weight: number
  recorded_date: string
  notes: string | null
}

interface GeneralTabProps {
  patient: Patient
  weightLogs?: WeightLog[]
  pastMedications?: PastMedication[]
  onAddPastMedication?: () => void
  onUpdatePatient?: (updates: Partial<Patient>) => Promise<void>
}

export function GeneralTab({ patient, weightLogs = [], pastMedications = [], onAddPastMedication, onUpdatePatient }: GeneralTabProps) {
  // Keeping this tab intentionally minimal: only the first widget (BasicInfoCompact).
  // Everything else that used to be here moved to the Doctor tab.
  void weightLogs
  void pastMedications
  void onAddPastMedication

  return (
    <div className="space-y-6">
      {/* Basic Patient Information - Compact */}
      <BasicInfoCompact patient={patient} onUpdate={onUpdatePatient} />
    </div>
  )
}

