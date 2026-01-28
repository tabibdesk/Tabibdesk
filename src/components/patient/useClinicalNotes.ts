import { useState, useMemo, useEffect } from "react"

export const checklistItems = [
  { id: "vitals", label: "Vitals Recorded", regex: /vital|bp|blood pressure|temperature|pulse|heart rate/i },
  { id: "complaint", label: "Chief Complaint", regex: /complaint|complain|present|symptom/i },
  { id: "examination", label: "Physical Examination", regex: /exam|examin|inspect|palpat|auscult/i },
  { id: "diagnosis", label: "Diagnosis", regex: /diagnos|condition|disease/i },
  { id: "treatment", label: "Treatment Plan", regex: /treat|prescri|medicat|therapy|plan/i },
  { id: "labs", label: "Lab Orders", regex: /lab|test|blood|urine|x-ray|scan/i },
  { id: "followup", label: "Follow-up Scheduled", regex: /follow.?up|return|revisit|next visit/i },
]

interface UseClinicalNotesProps {
  onSaveNote?: (note: string) => void
}

export function useClinicalNotes({
  onSaveNote,
}: UseClinicalNotesProps) {
  const [newNote, setNewNote] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [lastDetectedItem, setLastDetectedItem] = useState<string | null>(null)
  
  // Checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})

  // Auto-detect checklist items as user types
  useEffect(() => {
    const lowerNote = newNote.toLowerCase()
    if (!lowerNote) {
      if (Object.keys(checklist).length > 0) {
        setChecklist({})
      }
      return
    }

    const newChecklist: Record<string, boolean> = { ...checklist }
    let detectedNew = false

    checklistItems.forEach((item) => {
      const isDetected = item.regex.test(lowerNote)
      if (isDetected && !checklist[item.id]) {
        newChecklist[item.id] = true
        setLastDetectedItem(item.label)
        detectedNew = true
      } else if (!isDetected && checklist[item.id]) {
        // Optional: remove check if text is deleted? 
        // For now let's keep it checked once detected to avoid flickering
      }
    })

    if (detectedNew) {
      setChecklist(newChecklist)
      setShowReminder(true)
      const timer = setTimeout(() => setShowReminder(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [newNote, checklist])

  const completedCount = Object.values(checklist).filter(Boolean).length
  const totalCount = checklistItems.length
  const completenessPercentage = Math.round((completedCount / totalCount) * 100)

  const handleSendNote = () => {
    if (newNote.trim()) {
      onSaveNote?.(newNote)
      setNewNote("")
      setChecklist({})
    }
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    setIsPaused(false)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setIsPaused(false)
  }

  const handlePauseResume = () => {
    setIsPaused(!isPaused)
  }

  return {
    // State
    newNote,
    setNewNote,
    isRecording,
    isPaused,
    showReminder,
    lastDetectedItem,
    checklist,
    
    // Computed
    completedCount,
    totalCount,
    completenessPercentage,
    checklistItems,
    
    // Handlers
    handleSendNote,
    handleStartRecording,
    handleStopRecording,
    handlePauseResume,
  }
}

