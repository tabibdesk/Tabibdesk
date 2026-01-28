"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { RiFileTextLine, RiTimeLine, RiEditLine, RiDeleteBinLine, RiCheckLine, RiCloseLine, RiArrowRightSLine } from "@remixicon/react"
import { Button } from "@/components/Button"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { Textarea } from "@/components/Textarea"
import { update as updateNote, remove as removeNote } from "@/api/notes.api"
import { useToast } from "@/hooks/useToast"
import { cx } from "@/lib/utils"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"

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

const INITIAL_VISIBLE_COUNT = 5
const LOAD_MORE_INCREMENT = 5

export function NotesTab({ notes: initialNotes, patient: _patient }: NotesTabProps) {
  const { role } = useUserClinic()
  const { showToast } = useToast()
  const [notes, setNotes] = useState(initialNotes)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)
  const [selectedNote, setSelectedNote] = useState<DoctorNote | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const isDoctor = role === "doctor"

  // Sort notes by date (newest first)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const visibleNotes = sortedNotes.slice(0, visibleCount)
  const hasMore = visibleCount < notes.length

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_INCREMENT)
  }

  const handleViewNote = (note: DoctorNote) => {
    setSelectedNote(note)
    setEditValue(note.note)
    setIsEditing(false)
    setIsDrawerOpen(true)
  }

  const handleEditStart = () => {
    setIsEditing(true)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditValue(selectedNote?.note || "")
  }

  const handleEditSave = async () => {
    if (!selectedNote) return
    try {
      await updateNote(selectedNote.id, editValue)
      const updatedNote = { ...selectedNote, note: editValue }
      setNotes((prev) =>
        prev.map((n) => (n.id === selectedNote.id ? updatedNote : n))
      )
      setSelectedNote(updatedNote)
      setIsEditing(false)
      showToast("Note updated successfully", "success")
    } catch (error) {
      showToast("Failed to update note", "error")
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent opening drawer
    if (!confirm("Are you sure you want to delete this note?")) return
    try {
      await removeNote(id)
      setNotes((prev) => prev.filter((n) => n.id !== id))
      if (selectedNote?.id === id) {
        setIsDrawerOpen(false)
      }
      showToast("Note deleted successfully", "success")
    } catch (error) {
      showToast("Failed to delete note", "error")
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-2.5 px-4 min-h-12 flex items-center">
          <div className="flex items-center gap-2">
            <RiFileTextLine className="size-4 text-primary-500/70 dark:text-primary-400/70" />
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Clinical Notes History</h3>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {notes.length === 0 ? (
            <div className="py-12 text-center">
              <RiFileTextLine className="mx-auto size-12 text-gray-300 dark:text-gray-700" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No clinical notes recorded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibleNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleViewNote(note)}
                  className="w-full flex items-end gap-4 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group text-left"
                >
                  {/* Note content - primary (like patient name on card) */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                      {note.note}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {new Date(note.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {formatRelativeTime(note.created_at)}
                      </span>
                    </div>
                  </div>
                  {/* Right: actions + chevron (like phone / last visited on patient card) */}
                  <div className="flex shrink-0 items-center gap-2">
                    {isDoctor && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewNote(note)
                            handleEditStart()
                          }}
                          className="size-7 p-0 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          <RiEditLine className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDelete(e, note.id)}
                          className="size-7 p-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <RiDeleteBinLine className="size-3.5" />
                        </Button>
                      </div>
                    )}
                    <RiArrowRightSLine className="size-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" aria-hidden />
                  </div>
                </button>
              ))}
            </div>
          )}
          {hasMore && (
            <div className="p-2 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="ghost"
                onClick={handleLoadMore}
                className="w-full text-[10px] font-bold uppercase tracking-wider h-8 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10"
              >
                Load More Notes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note Details Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                <RiFileTextLine className="size-5" />
              </div>
              <div>
                <DrawerTitle>Clinical Note Details</DrawerTitle>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <RiTimeLine className="size-3.5" />
                  <span>
                    {selectedNote && new Date(selectedNote.created_at).toLocaleDateString("en-US", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </DrawerHeader>
          <DrawerBody>
            {isEditing ? (
              <div className="space-y-4 h-full flex flex-col">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Enter clinical note details..."
                  className="flex-1 min-h-[400px] resize-none text-base leading-relaxed"
                  autoFocus
                />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
                  {selectedNote?.note}
                </p>
              </div>
            )}
          </DrawerBody>
          <DrawerFooter>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleEditCancel} className="flex-1 sm:flex-none">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleEditSave} className="flex-1 sm:flex-none gap-2">
                  <RiCheckLine className="size-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    Close
                  </Button>
                </DrawerClose>
                {isDoctor && (
                  <Button variant="primary" onClick={handleEditStart} className="flex-1 sm:flex-none gap-2">
                    <RiEditLine className="size-4" />
                    Edit Note
                  </Button>
                )}
              </>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
