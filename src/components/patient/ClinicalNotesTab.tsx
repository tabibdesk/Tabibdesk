"use client"

import { useClinicalNotes } from "./useClinicalNotes"
import { ClinicalNotesDesktop } from "./ClinicalNotesDesktop"
import { ClinicalNotesMobile } from "./ClinicalNotesMobile"

interface DoctorNote {
  id: string
  patient_id: string
  note: string
  created_at: string
}

interface Transcription {
  id: string
  patient_id: string
  audio_url: string | null
  transcription_text: string
  duration_seconds: number
  created_at: string
  status: "processing" | "completed" | "failed"
}

interface ClinicalNotesTabProps {
  notes: DoctorNote[]
  transcriptions: Transcription[]
  patient?: any
  onSaveNote?: (note: string) => void
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
