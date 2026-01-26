import { useState, useMemo } from "react"

const checklistItems = [
  { id: "vitals", label: "Vitals Recorded", regex: /vital|bp|blood pressure|temperature|pulse|heart rate/i },
  { id: "complaint", label: "Chief Complaint", regex: /complaint|complain|present|symptom/i },
  { id: "examination", label: "Physical Examination", regex: /exam|examin|inspect|palpat|auscult/i },
  { id: "diagnosis", label: "Diagnosis", regex: /diagnos|condition|disease/i },
  { id: "treatment", label: "Treatment Plan", regex: /treat|prescri|medicat|therapy|plan/i },
  { id: "labs", label: "Lab Orders", regex: /lab|test|blood|urine|x-ray|scan/i },
  { id: "followup", label: "Follow-up Scheduled", regex: /follow.?up|return|revisit|next visit/i },
]

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

type ChatMessage = {
  id: string
  type: "note" | "transcription" | "new"
  content: string
  created_at: string
  audio_url?: string | null
  status?: string
  duration_seconds?: number
  extracted?: boolean
}

interface UseClinicalNotesProps {
  notes: DoctorNote[]
  transcriptions: Transcription[]
  patient?: any
  onSaveNote?: (note: string) => void
}

export function useClinicalNotes({
  notes,
  transcriptions,
  onSaveNote,
}: UseClinicalNotesProps) {
  const [newNote, setNewNote] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [lastDetectedItem, setLastDetectedItem] = useState<string | null>(null)
  
  // Checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})

  // Merge notes and transcriptions into a unified timeline
  const allMessages = useMemo(() => {
    const merged: ChatMessage[] = [
      ...notes.map((n) => ({
        id: n.id,
        type: "note" as const,
        content: n.note,
        created_at: n.created_at,
      })),
      ...transcriptions.map((t) => ({
        id: t.id,
        type: "transcription" as const,
        content: t.transcription_text,
        created_at: t.created_at,
        audio_url: t.audio_url,
        status: t.status,
        duration_seconds: t.duration_seconds,
      })),
    ]

    const sorted = merged.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Check if there's an entry for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const hasTodayEntry = sorted.some(m => {
      const d = new Date(m.created_at)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })

    if (!hasTodayEntry) {
      // Add a virtual "New Session" for today
      sorted.unshift({
        id: "new-today",
        type: "new",
        content: "",
        created_at: new Date().toISOString(),
      })
    }

    return sorted
  }, [notes, transcriptions])

  // Selected message state - Default to the "New" entry if it exists
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)

  // Initialize selectedMessageId
  useMemo(() => {
    if (!selectedMessageId && allMessages.length > 0) {
      setSelectedMessageId(allMessages[0].id)
    }
  }, [allMessages, selectedMessageId])

  const selectedMessage = useMemo(() => 
    allMessages.find(m => m.id === selectedMessageId) || (allMessages.length > 0 ? allMessages[0] : null)
  , [allMessages, selectedMessageId])

  // Group messages for the sidebar history
  const historyGroups = useMemo(() => {
    const groups: { label: string; messages: ChatMessage[] }[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todayMsgs: ChatMessage[] = []
    const yesterdayMsgs: ChatMessage[] = []
    const olderMsgs: ChatMessage[] = []

    allMessages.forEach((msg) => {
      const msgDate = new Date(msg.created_at)
      msgDate.setHours(0, 0, 0, 0)

      if (msgDate.getTime() === today.getTime()) {
        todayMsgs.push(msg)
      } else if (msgDate.getTime() === yesterday.getTime()) {
        yesterdayMsgs.push(msg)
      } else {
        olderMsgs.push(msg)
      }
    })

    if (todayMsgs.length > 0) groups.push({ label: "new clinical investigation", messages: todayMsgs })
    if (yesterdayMsgs.length > 0)
      groups.push({ label: "Yesterday", messages: yesterdayMsgs })
    if (olderMsgs.length > 0) groups.push({ label: "Older", messages: olderMsgs })

    return groups
  }, [allMessages])

  // Auto-detect checklist items as user types
  useMemo(() => {
    const lowerNote = newNote.toLowerCase()
    if (!lowerNote) return

    const newChecklist: Record<string, boolean> = { ...checklist }
    let detectedNew = false

    checklistItems.forEach((item) => {
      if (!checklist[item.id] && item.regex.test(lowerNote)) {
        newChecklist[item.id] = true
        setLastDetectedItem(item.label)
        detectedNew = true
      }
    })

    if (detectedNew) {
      setChecklist(newChecklist)
      setShowReminder(true)
      setTimeout(() => setShowReminder(false), 3000)
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
    selectedMessageId,
    setSelectedMessageId,
    selectedMessage,
    allMessages,
    historyGroups,
    
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

// Utility functions
export const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export const getStatusColor = (status?: string) => {
  switch (status) {
    case "completed":
      return "success"
    case "processing":
      return "warning"
    case "failed":
      return "error"
    default:
      return "neutral"
  }
}

export const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
