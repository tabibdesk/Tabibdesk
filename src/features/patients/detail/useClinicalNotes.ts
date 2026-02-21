import { useState, useEffect } from "react"
import { PROGRESS_METRIC_REGEX } from "@/types/progress"
import type { VisitProgressChecklistItem } from "@/types/visit-progress"

export interface MetricToRecord {
  id: string
  label: string
}

interface MedicalConditionItem {
  id: string
  label: string
}

interface PatientWithConditions {
  [key: string]: unknown
}

interface UseClinicalNotesProps {
  checklistItems?: VisitProgressChecklistItem[]
  metricsToRecord?: MetricToRecord[]
  onSaveNote?: (note: string) => void
  patient?: PatientWithConditions | null
  onUpdatePatient?: (updates: Partial<PatientWithConditions>) => Promise<void>
  enabledMedicalConditions?: MedicalConditionItem[]
}

export function useClinicalNotes({
  checklistItems: checklistItemsProp = [],
  metricsToRecord = [],
  onSaveNote,
  patient,
  onUpdatePatient,
  enabledMedicalConditions = [],
}: UseClinicalNotesProps) {
  const checklistItems = checklistItemsProp
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
      const regex = PROGRESS_METRIC_REGEX[m.id]
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
  const completenessPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

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

  const handleMedicalConditionToggle = async (conditionId: string) => {
    if (!patient || !onUpdatePatient) return
    const current = !!(patient as Record<string, unknown>)[conditionId]
    try {
      await onUpdatePatient({ [conditionId]: !current })
    } catch {
      // Toast handled by parent
    }
  }

  const handleChecklistToggle = (itemId: string) => {
    setChecklist((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const handleMetricsChecklistToggle = (metricId: string) => {
    setMetricsChecklist((prev) => ({ ...prev, [metricId]: !prev[metricId] }))
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
    medicalConditions:
      patient && onUpdatePatient && enabledMedicalConditions.length > 0
        ? enabledMedicalConditions
        : [],
    medicalConditionValues: patient
      ? Object.fromEntries(
          enabledMedicalConditions.map((c) => [c.id, !!(patient as Record<string, unknown>)[c.id]])
        )
      : {},
    handleMedicalConditionToggle,
    handleChecklistToggle,
    handleMetricsChecklistToggle,
  }
}

