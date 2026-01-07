"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { RiFileTextLine, RiAddLine, RiTimeLine, RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react"

interface DoctorNote {
  id: string
  patient_id: string
  note: string
  created_at: string
}

interface NotesTabProps {
  notes: DoctorNote[]
  patient?: any
}

export function NotesTab({ notes, patient }: NotesTabProps) {
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  // Sort notes by date (newest first)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

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

  const toggleNoteExpansion = (noteId: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(noteId)) {
        next.delete(noteId)
      } else {
        next.add(noteId)
      }
      return next
    })
  }

  const truncateText = (text: string, maxLines: number = 3) => {
    const lines = text.split('\n')
    if (lines.length <= maxLines) return text
    return lines.slice(0, maxLines).join('\n')
  }

  return (
    <div className="space-y-6">
      {/* Past Notes Section */}
      {sortedNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RiFileTextLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">No notes yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedNotes.map((note) => {
            const isExpanded = expandedNotes.has(note.id)
            const noteLines = note.note.split('\n')
            const shouldTruncate = noteLines.length > 3
            const displayText = isExpanded ? note.note : truncateText(note.note, 3)

            return (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      {new Date(note.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <RiTimeLine className="size-4" />
                      <span>{formatRelativeTime(note.created_at)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                      {displayText}
                    </p>
                  </div>
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleNoteExpansion(note.id)}
                      className="mt-3 flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      {isExpanded ? (
                        <>
                          <span>Show less</span>
                          <RiArrowUpSLine className="size-4" />
                        </>
                      ) : (
                        <>
                          <span>Show more</span>
                          <RiArrowDownSLine className="size-4" />
                        </>
                      )}
                    </button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

