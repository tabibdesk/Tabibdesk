"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { getBadgeColor } from "@/lib/badgeColors"
import { AIExtractionModal } from "./AIExtractionModal"
import { RiVoiceprintLine, RiTimeLine, RiRobot2Line } from "@remixicon/react"
import { PatientEmptyState } from "@/components/patient/PatientEmptyState"

interface Transcription {
  id: string
  patient_id: string
  audio_url: string | null
  transcription_text: string
  duration_seconds: number
  created_at: string
  status: "processing" | "completed" | "failed"
}

interface TranscriptionsTabProps {
  transcriptions: Transcription[]
}

export function TranscriptionsTab({ transcriptions }: TranscriptionsTabProps) {
  const [showAIModal, setShowAIModal] = useState(false)
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null)

  // Sort transcriptions by date (newest first)
  const sortedTranscriptions = [...transcriptions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const handleExtractWithAI = (transcription: Transcription) => {
    setSelectedTranscription(transcription)
    setShowAIModal(true)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
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

  return (
    <div className="space-y-6">
      {sortedTranscriptions.length === 0 ? (
        <PatientEmptyState
          icon={RiVoiceprintLine}
          title="No transcriptions yet"
          description="Record or upload audio to get started."
        />
      ) : (
        <div className="space-y-4">
          {sortedTranscriptions.map((transcription) => (
            <Card key={transcription.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
                      <RiVoiceprintLine className="size-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {new Date(transcription.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <RiTimeLine className="size-4" />
                          {formatRelativeTime(transcription.created_at)}
                        </span>
                        <span>•</span>
                        <span>{formatDuration(transcription.duration_seconds)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge color={getBadgeColor(getStatusColor(transcription.status))} size="xs">
                    {transcription.status === "completed"
                      ? "Completed"
                      : transcription.status === "processing"
                      ? "Processing"
                      : "Failed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {transcription.status === "completed" ? (
                  <>
                    {transcription.audio_url && (
                      <div className="mb-4">
                        <audio controls className="w-full">
                          <source src={transcription.audio_url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {transcription.transcription_text}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtractWithAI(transcription)}
                      >
                        <RiRobot2Line className="mr-2 size-4" />
                        Extract with AI
                      </Button>
                    </div>
                  </>
                ) : transcription.status === "processing" ? (
                  <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/10">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Transcription is being processed. This may take a few moments...
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/10">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      Transcription failed. Please try recording again.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Extraction Modal */}
      <AIExtractionModal
        isOpen={showAIModal}
        onClose={() => {
          setShowAIModal(false)
          setSelectedTranscription(null)
        }}
        clinicalNotes={selectedTranscription?.transcription_text || ""}
        onAccept={(_diagnosis, _severity) => {
          // TODO: Save to database
        }}
      />
    </div>
  )
}

