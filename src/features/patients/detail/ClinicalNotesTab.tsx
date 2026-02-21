"use client"

import { useClinicalNotes } from "./useClinicalNotes"
import { ClinicalNotesDesktop } from "./ClinicalNotesDesktop"
import { ClinicalNotesMobile } from "./ClinicalNotesMobile"
import type { VisitProgressChecklistItem } from "@/types/visit-progress"

export interface MetricToRecord {
  id: string
  label: string
}

interface PatientWithConditions {
  id: string
  is_diabetic?: boolean | null
  is_hypertensive?: boolean | null
  has_pancreatitis?: boolean | null
  is_pregnant?: boolean | null
  is_breastfeeding?: boolean | null
  glp1a_previous_exposure?: boolean | null
  has_rheumatoid?: boolean | null
  has_ihd?: boolean | null
  has_heart_failure?: boolean | null
  has_gerd?: boolean | null
  has_gastritis?: boolean | null
  has_hepatic?: boolean | null
  has_anaemia?: boolean | null
  has_bronchial_asthma?: boolean | null
  [key: string]: unknown
}

interface MedicalConditionItem {
  id: string
  label: string
}

interface ClinicalNotesTabProps {
  checklistItems?: VisitProgressChecklistItem[]
  metricsToRecord?: MetricToRecord[]
  onSaveNote?: (note: string) => void
  patient?: PatientWithConditions | null
  onUpdatePatient?: (updates: Partial<PatientWithConditions>) => Promise<void>
  enabledMedicalConditions?: MedicalConditionItem[]
}

export function ClinicalNotesTab(props: ClinicalNotesTabProps) {
  const logic = useClinicalNotes(props)

  return (
    <>
      {/* Desktop View - Hidden on mobile */}
      <div className="hidden lg:block h-full">
        <ClinicalNotesDesktop {...logic} />
      </div>

      {/* Mobile View - Hidden on desktop */}
      <div className="block lg:hidden h-full">
        <ClinicalNotesMobile {...logic} />
      </div>
    </>
  )
}
