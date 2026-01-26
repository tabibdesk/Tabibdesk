"use client"

import { useState } from "react"
import { Textarea } from "@/components/Textarea"
import { Button } from "@/components/Button"
import { RiMicLine, RiSaveLine, RiCloseLine, RiPauseLine, RiPlayLine, RiFileTextLine } from "@remixicon/react"

interface ClinicalNotesProps {
  title?: string
  onSave?: (notes: string) => void
  onCancel?: () => void
  onViewTranscription?: () => void
}

export function ClinicalNotes({ title, onSave, onCancel, onViewTranscription }: ClinicalNotesProps) {
  const [notes, setNotes] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)

  const handleSave = () => {
    onSave?.(notes)
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    setIsPaused(false)
    // Placeholder for voice recording functionality
    // Simulate recording completion after 5 seconds
    setTimeout(() => {
      setIsRecording(false)
      setHasRecording(true)
    }, 5000)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setHasRecording(true)
  }

  const handlePauseResume = () => {
    setIsPaused(!isPaused)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">{title}</h2>
          <div className="flex items-center gap-2">
            {!isRecording && !hasRecording && (
              <Button
                variant="secondary"
                onClick={handleStartRecording}
                className="gap-2"
              >
                <RiMicLine className="size-4" />
                Record
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  variant="ghost"
                  onClick={handlePauseResume}
                  className="gap-2"
                >
                  {isPaused ? (
                    <>
                      <RiPlayLine className="size-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <RiPauseLine className="size-4" />
                      Pause
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleStopRecording}
                  className="gap-2"
                >
                  <RiMicLine className="size-4 animate-pulse" />
                  Stop Recording
                </Button>
              </>
            )}

            {hasRecording && !isRecording && (
              <>
                <Button
                  variant="outline"
                  onClick={onViewTranscription}
                  className="gap-2"
                >
                  <RiFileTextLine className="size-4" />
                  View Transcription
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleStartRecording}
                  className="gap-2"
                >
                  <RiMicLine className="size-4" />
                  New Recording
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Type notes or use voice recording..."
        className="min-h-[300px] resize-none"
      />

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">{notes.length} characters</span>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              <RiCloseLine className="mr-2 size-4" />
              Cancel
            </Button>
          )}
          <Button variant="primary" onClick={handleSave} disabled={!notes.trim()}>
            <RiSaveLine className="mr-2 size-4" />
            Save Notes
          </Button>
        </div>
      </div>
    </div>
  )
}
