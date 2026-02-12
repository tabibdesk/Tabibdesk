"use client"

import { useState, useEffect } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { RiFileTextLine, RiEditLine, RiDeleteBinLine, RiCheckLine, RiCloseLine, RiArrowRightSLine, RiAddLine } from "@remixicon/react"
import { Button } from "@/components/Button"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useLocale } from "@/contexts/locale-context"
import { Textarea } from "@/components/Textarea"
import { create as createNote, update as updateNote, remove as removeNote } from "@/api/notes.api"
import { useToast } from "@/hooks/useToast"
import { cx } from "@/lib/utils"
import { PatientEmptyState } from "./PatientEmptyState"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
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
  onNoteAdded?: () => void
}

const INITIAL_VISIBLE_COUNT = 5
const LOAD_MORE_INCREMENT = 5

export function NotesTab({ notes: initialNotes, patient, onNoteAdded }: NotesTabProps) {
  const t = useAppTranslations()
  const { isRtl, lang } = useLocale()
  const { role } = useUserClinic()
  const { showToast } = useToast()
  const [notes, setNotes] = useState(initialNotes)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)
  const [selectedNote, setSelectedNote] = useState<DoctorNote | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isAddMode, setIsAddMode] = useState(false)
  const [editValue, setEditValue] = useState("")
  const isDoctor = role === "doctor"

  useEffect(() => {
    setNotes(initialNotes)
  }, [initialNotes])

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
    setIsAddMode(false)
    setIsDrawerOpen(true)
  }

  const handleAddNote = () => {
    setSelectedNote(null)
    setEditValue("")
    setIsAddMode(true)
    setIsEditing(true)
    setIsDrawerOpen(true)
  }

  const handleAddSave = async () => {
    if (!patient?.id || !editValue.trim()) return
    try {
      await createNote({ patient_id: patient.id, note: editValue.trim() })
      showToast(t.profile.noteAddedSuccess, "success")
      setIsDrawerOpen(false)
      setIsAddMode(false)
      setEditValue("")
      onNoteAdded?.()
    } catch (error) {
      showToast(t.profile.failedToAddNote, "error")
    }
  }

  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open)
    if (!open) {
      setIsAddMode(false)
      if (!selectedNote) setEditValue("")
    }
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
      showToast(t.profile.noteUpdatedSuccess, "success")
    } catch (error) {
      showToast(t.profile.failedToUpdateNote, "error")
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
      showToast(t.profile.noteDeletedSuccess, "success")
    } catch (error) {
      showToast(t.profile.failedToDeleteNote, "error")
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return t.common.today
    if (diffDays === 1) return t.common.yesterday
    if (diffDays < 7) return t.common.daysAgo.replace("{n}", String(diffDays))
    if (diffDays < 30) return t.common.weeksAgo.replace("{n}", String(Math.floor(diffDays / 7)))
    if (diffDays < 365) return t.common.monthsAgo.replace("{n}", String(Math.floor(diffDays / 30)))
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 px-4 py-3 min-h-12 flex flex-row items-center justify-between rtl:flex-row-reverse">
          <div className="flex items-center gap-2 rtl:flex-row-reverse">
            <RiFileTextLine className="size-4 text-primary-500/70 dark:text-primary-400/70 shrink-0" />
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-start">{t.profile.clinicalNotesHistory}</h3>
          </div>
          {patient?.id && (
            <Button variant="ghost" size="sm" onClick={handleAddNote} className="size-8 shrink-0 p-0" title={t.profile.addNote}>
              <RiAddLine className="size-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {notes.length === 0 ? (
            <div className="p-4">
              <PatientEmptyState
                icon={RiFileTextLine}
                title={t.profile.noClinicalNotesYet}
                description={t.profile.addClinicalNotesDesc}
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibleNotes.map((note) => (
                <div
                  key={note.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleViewNote(note)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleViewNote(note)
                    }
                  }}
                  className="w-full flex items-end gap-4 px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group text-start cursor-pointer rtl:flex-row-reverse"
                >
                  {/* Note content - primary (like patient name on card) */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 text-start" dir="auto">
                      {note.note}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {new Date(note.created_at).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
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
                  {/* Actions + chevron - mirrored for RTL */}
                  <div className="flex shrink-0 items-center gap-2 rtl:flex-row-reverse">
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
                    <RiArrowRightSLine className="size-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors rtl:rotate-180" aria-hidden />
                  </div>
                </div>
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
                {t.profile.loadMoreNotes}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note Details / Add Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={handleDrawerOpenChange}>
        <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>{isAddMode ? t.profile.clinicalNoteAdd : t.profile.clinicalNoteDetails}</DrawerTitle>
            {!isAddMode && selectedNote && (
              <DrawerDescription className="text-sm mt-0.5">
                {new Date(selectedNote.created_at).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </DrawerDescription>
            )}
          </DrawerHeader>
          <DrawerBody>
            {isEditing || isAddMode ? (
              <div className="space-y-4 h-full flex flex-col">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={t.profile.enterClinicalNotePlaceholder}
                  className="flex-1 min-h-[400px] resize-none text-base leading-relaxed"
                  autoFocus
                />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-300 font-medium" dir="auto">
                  {selectedNote?.note}
                </p>
              </div>
            )}
          </DrawerBody>
          <DrawerFooter>
            {isAddMode ? (
              <>
                <Button variant="outline" onClick={() => handleDrawerOpenChange(false)} className="flex-1 sm:flex-none">
                  {t.common.cancel}
                </Button>
                <Button variant="primary" onClick={handleAddSave} disabled={!editValue.trim()} className="flex-1 sm:flex-none gap-2">
                  <RiCheckLine className="size-4" />
                  {t.profile.addNote}
                </Button>
              </>
            ) : isEditing ? (
              <>
                <Button variant="outline" onClick={handleEditCancel} className="flex-1 sm:flex-none">
                  {t.common.cancel}
                </Button>
                <Button variant="primary" onClick={handleEditSave} className="flex-1 sm:flex-none gap-2">
                  <RiCheckLine className="size-4" />
                  {t.profile.saveChanges}
                </Button>
              </>
            ) : (
              <>
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    {t.common.close}
                  </Button>
                </DrawerClose>
                {isDoctor && (
                  <Button variant="primary" onClick={handleEditStart} className="flex-1 sm:flex-none gap-2">
                    <RiEditLine className="size-4" />
                    {t.profile.editNote}
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
