"use client"

import { useClinicalNotes } from "./useClinicalNotes"
import { ClinicalNotesDesktop } from "./ClinicalNotesDesktop"
import { ClinicalNotesMobile } from "./ClinicalNotesMobile"

export interface MetricToRecord {
  id: string
  label: string
}

interface ClinicalNotesTabProps {
  metricsToRecord?: MetricToRecord[]
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
