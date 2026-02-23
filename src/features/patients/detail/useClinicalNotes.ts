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
  const [detectedBadges, setDetectedBadges] = useState<Array<{ id: string; label: string }>>([])
  
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
        setDetectedBadges((prev) =>
          prev.some((b) => b.id === item.id) ? prev : [...prev, { id: item.id, label: item.label }]
        )
        detectedNew = true
      }
    })

    if (detectedNew) {
      setChecklist(newChecklist)
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
    const newBadges: Array<{ id: string; label: string }> = []
    metricsToRecord.forEach((m) => {
      const regex = PROGRESS_METRIC_REGEX[m.id]
      if (!regex) return
      const isDetected = regex.test(newNote)
      if (isDetected && !next[m.id]) {
        next[m.id] = true
        newBadges.push({ id: m.id, label: m.label })
      }
    })
    if (newBadges.length > 0) {
      setMetricsChecklist(next)
      setDetectedBadges((prev) => {
        const existingIds = new Set(prev.map((b) => b.id))
        const toAdd = newBadges.filter((b) => !existingIds.has(b.id))
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev
      })
    }
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
      setDetectedBadges([])
    }
  }

  const dismissDetectedBadge = (id: string) => {
    setDetectedBadges((prev) => prev.filter((b) => b.id !== id))
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
    const flags = (patient as Record<string, unknown>).condition_flags as Record<string, boolean> | undefined
    const current = !!(flags?.[conditionId] ?? (patient as Record<string, unknown>)[conditionId])
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
    detectedBadges,
    dismissDetectedBadge,
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
          enabledMedicalConditions.map((c) => {
            const flags = (patient as Record<string, unknown>).condition_flags as Record<string, boolean> | undefined
            const value = flags?.[c.id] ?? (patient as Record<string, unknown>)[c.id]
            return [c.id, !!value]
          })
        )
      : {},
    handleMedicalConditionToggle,
    handleChecklistToggle,
    handleMetricsChecklistToggle,
  }
}

