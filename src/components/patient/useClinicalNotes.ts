import { useState, useEffect } from "react"

/** Regex patterns to auto-detect progress metrics in note text. */
const METRIC_REGEX: Record<string, RegExp> = {
  pulse: /\d+\s*bpm|pulse\s*[:=]?\s*\d+|heart rate\s*[:=]?\s*\d+/i,
  oxygen: /spo2\s*[:=]?\s*\d+|\d+\s*%\s*oxygen|oxygen\s*[:=]?\s*\d+|saturation\s*[:=]?\s*\d+/i,
  temp: /\d+(\.\d+)?\s*°?c|temp\s*[:=]?\s*\d+|temperature\s*[:=]?\s*\d+/i,
  bp: /\d+\s*\/\s*\d+|bp\s*[:=]?\s*\d+|blood pressure\s*[:=]?\s*\d+|\d+\s*\/\s*\d+\s*mmhg/i,
  blood_sugar: /\d+\s*mg\/dl|glucose\s*[:=]?\s*\d+|blood sugar\s*[:=]?\s*\d+|fasting\s*[:=]?\s*\d+/i,
  weight: /\d+(\.\d+)?\s*kg|weight\s*[:=]?\s*\d+/i,
  bmi: /bmi\s*[:=]?\s*[\d.]+|[\d.]+\s*kg\/m/i,
  pregnancy: /pregnan|gravid|gestati|trimester|lmp|last menstrual/i,
  smoking: /smok|tobacco|cigarette|nicotine|non.?smoker|ex.?smoker/i,
  hba1c: /hba1c\s*[:=]?\s*[\d.]+|a1c\s*[:=]?\s*[\d.]+|[\d.]+\s*%/i,
  ldl: /ldl\s*[:=]?\s*\d+|\d+\s*ldl/i,
  cholesterol_total: /cholesterol\s*[:=]?\s*\d+|total\s*chol/i,
  ozempic_dose: /ozempic|semaglutide|dose\s*[:=]?\s*[\d.]+/i,
}

export const checklistItems = [
  { id: "vitals", label: "Vitals Recorded", regex: /vital|bp|blood pressure|temperature|pulse|heart rate/i },
  { id: "complaint", label: "Chief Complaint", regex: /complaint|complain|present|symptom/i },
  { id: "examination", label: "Physical Examination", regex: /exam|examin|inspect|palpat|auscult/i },
  { id: "diagnosis", label: "Diagnosis", regex: /diagnos|condition|disease/i },
  { id: "treatment", label: "Treatment Plan", regex: /treat|prescri|medicat|therapy|plan/i },
  { id: "labs", label: "Lab Orders", regex: /lab|test|blood|urine|x-ray|scan/i },
  { id: "followup", label: "Follow-up Scheduled", regex: /follow.?up|return|revisit|next visit/i },
]

export interface MetricToRecord {
  id: string
  label: string
}

interface UseClinicalNotesProps {
  metricsToRecord?: MetricToRecord[]
  onSaveNote?: (note: string) => void
}

export function useClinicalNotes({
  metricsToRecord = [],
  onSaveNote,
}: UseClinicalNotesProps) {
  const [newNote, setNewNote] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [lastDetectedItem, setLastDetectedItem] = useState<string | null>(null)
  
  // Checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  // Metrics-to-record checklist (which enabled metrics have been detected in note)
  const [metricsChecklist, setMetricsChecklist] = useState<Record<string, boolean>>({})

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
      }
    })

    if (detectedNew) {
      setChecklist(newChecklist)
      setShowReminder(true)
      const timer = setTimeout(() => setShowReminder(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [newNote, checklist])

  // Stable key for metricsToRecord to avoid effect re-runs when parent passes new array ref with same IDs
  const metricIdsKey = metricsToRecord.map((m) => m.id).sort().join(",")

  // Auto-detect progress metrics in note
  useEffect(() => {
    if (metricIdsKey === "") {
      if (Object.keys(metricsChecklist).length > 0) setMetricsChecklist({})
      return
    }
    if (!newNote.trim()) {
      if (Object.keys(metricsChecklist).length > 0) setMetricsChecklist({})
      return
    }
    const next: Record<string, boolean> = { ...metricsChecklist }
    let changed = false
    metricsToRecord.forEach((m) => {
      const regex = METRIC_REGEX[m.id]
      if (!regex) return
      const isDetected = regex.test(newNote)
      if (isDetected && !next[m.id]) {
        next[m.id] = true
        changed = true
      }
    })
    if (changed) setMetricsChecklist(next)
  }, [newNote, metricIdsKey, metricsChecklist, metricsToRecord])

  const completedCount = Object.values(checklist).filter(Boolean).length
  const totalCount = checklistItems.length
  const completenessPercentage = Math.round((completedCount / totalCount) * 100)

  const handleSendNote = () => {
    if (newNote.trim()) {
      onSaveNote?.(newNote)
      setNewNote("")
      setChecklist({})
      setMetricsChecklist({})
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
    newNote,
    setNewNote,
    isRecording,
    isPaused,
    showReminder,
    lastDetectedItem,
    checklist,
    completedCount,
    totalCount,
    completenessPercentage,
    checklistItems,
    metricsToRecord,
    metricsChecklist,
    handleSendNote,
    handleStartRecording,
    handleStopRecording,
    handlePauseResume,
  }
}

