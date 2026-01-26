"use client"

import { useState } from "react"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import {
  RiMicLine,
  RiSendPlaneLine,
  RiPauseLine,
  RiPlayLine,
  RiStopLine,
  RiVoiceprintLine,
  RiTimeLine,
  RiRobot2Line,
  RiCheckboxCircleLine,
  RiCloseLine as RiCloseIcon,
  RiFileTextLine,
  RiAddLine,
  RiArrowLeftLine,
  RiHistoryLine,
  RiMoreLine,
} from "@remixicon/react"
import { cx } from "@/lib/utils"
import {
  formatRelativeTime,
  formatDuration,
  getStatusColor,
  formatTime,
  formatDate,
} from "./useClinicalNotes"

interface ClinicalNotesMobileProps {
  // Hook state
  newNote: string
  setNewNote: (note: string) => void
  isRecording: boolean
  isPaused: boolean
  showReminder: boolean
  lastDetectedItem: string | null
  checklist: Record<string, boolean>
  selectedMessageId: string | null
  setSelectedMessageId: (id: string | null) => void
  selectedMessage: any
  allMessages: any[]
  historyGroups: { label: string; messages: any[] }[]
  completedCount: number
  totalCount: number
  completenessPercentage: number
  checklistItems: any[]
  
  // Handlers
  handleSendNote: () => void
  handleStartRecording: () => void
  handleStopRecording: () => void
  handlePauseResume: () => void
}

export function ClinicalNotesMobile({
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
  historyGroups,
  completedCount,
  totalCount,
  completenessPercentage,
  checklistItems,
  handleSendNote,
  handleStartRecording,
  handleStopRecording,
  handlePauseResume,
}: ClinicalNotesMobileProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)

  // If showing history list on mobile
  if (showHistory) {
    return (
      <div className="flex flex-col h-[calc(100dvh-180px)] bg-white dark:bg-gray-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(false)}
              className="flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <RiArrowLeftLine className="size-5" />
            </button>
            <h2 className="text-lg font-semibold">History</h2>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {historyGroups.map((group) => (
            <div key={group.label} className="mt-6 first:mt-0">
              <h4 className="px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                {group.label}
              </h4>
              <div className="space-y-2">
                {group.messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessageId(msg.id)
                      setShowHistory(false)
                    }}
                    className={cx(
                      "w-full rounded-xl px-4 py-4 text-left transition-all duration-200 active:scale-98",
                      selectedMessageId === msg.id 
                        ? "bg-primary-50 dark:bg-primary-900/20 shadow-sm" 
                        : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cx(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                        msg.type === "new" 
                          ? "bg-primary-100 text-primary-600 animate-pulse" 
                          : msg.type === "transcription"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      )}>
                        {msg.type === "new" ? (
                          <RiAddLine className="size-4" />
                        ) : msg.type === "transcription" ? (
                          <RiVoiceprintLine className="size-4" />
                        ) : (
                          <RiFileTextLine className="size-4" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className={cx(
                          "line-clamp-2 text-sm font-medium",
                          selectedMessageId === msg.id 
                            ? "text-primary-700 dark:text-primary-400" 
                            : "text-gray-900 dark:text-gray-100"
                        )}>
                          {msg.type === "new" ? "New Clinical Investigation" : msg.content}
                        </p>
                        {msg.type !== "new" && (
                          <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatTime(msg.created_at)}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(msg.created_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] bg-gray-50/50 dark:bg-gray-950/50">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-gray-950">
        {selectedMessage?.type !== "new" ? (
          /* Show back button when viewing a historical note */
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-sm font-medium"
          >
            <RiArrowLeftLine className="size-5" />
            <span>Back to History</span>
          </button>
        ) : (
          /* Show history button when in active session */
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-sm font-medium"
          >
            <RiHistoryLine className="size-5" />
            <span>History</span>
          </button>
        )}
        
        {selectedMessage?.type === "new" && (
          <div className="flex items-center gap-2">
            {/* Circular Progress */}
            <button
              onClick={() => setShowChecklist(!showChecklist)}
              className="relative flex items-center justify-center size-10"
            >
              <svg className="size-10 -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-gray-200 dark:text-gray-800"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - completenessPercentage / 100)}`}
                  className="text-primary-600 transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-primary-600">
                {completenessPercentage}%
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Checklist Bottom Sheet */}
      {showChecklist && selectedMessage?.type === "new" && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
            onClick={() => setShowChecklist(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300 bg-white dark:bg-gray-950 rounded-t-2xl shadow-2xl max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-4">
              <div className="flex items-center gap-2">
                <RiCheckboxCircleLine className="size-5 text-primary-600" />
                <h3 className="font-semibold">Visit Progress</h3>
              </div>
              <button
                onClick={() => setShowChecklist(false)}
                className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <RiCloseIcon className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 max-h-[calc(70vh-64px)]">
              <div className="space-y-3">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className={cx(
                      "size-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      checklist[item.id] 
                        ? "bg-primary-600 border-primary-600 text-white" 
                        : "border-gray-300 dark:border-gray-700"
                    )}>
                      {checklist[item.id] && <RiCheckboxCircleLine className="size-4" />}
                    </div>
                    <span className={cx(
                      "text-sm font-medium flex-1",
                      checklist[item.id] 
                        ? "text-gray-900 dark:text-gray-100" 
                        : "text-gray-500 dark:text-gray-400"
                    )}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedMessage?.type === "new" ? (
          /* ACTIVE SESSION - Mobile Optimized */
          <div className="flex flex-col h-full p-4">
            <Badge variant="default" className="px-3 py-1.5 text-xs animate-pulse w-fit mb-3">
              Active Session
            </Badge>

            {/* Textarea */}
            <div className="relative flex-1 flex flex-col min-h-0">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Start typing your clinical observations..."
                className="w-full flex-1 resize-none bg-white dark:bg-gray-900 text-base text-gray-900 placeholder-gray-400 focus:outline-none dark:text-gray-100 leading-relaxed rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm focus:ring-2 focus:ring-primary-500/10 transition-all"
                style={{ minHeight: '200px' }}
              />
              
              {/* Reminder Popup */}
              {showReminder && (
                <div className="absolute top-4 left-4 right-4 animate-in fade-in slide-in-from-top-2 duration-300 z-20">
                  <div className="flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-white shadow-lg dark:bg-white dark:text-gray-900">
                    <RiCheckboxCircleLine className="size-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
                    <span className="text-sm font-medium flex-1">Detected: {lastDetectedItem}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : selectedMessage ? (
          /* HISTORICAL ENTRY VIEW */
          <div className="p-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start gap-4 mb-6">
                <div className={cx(
                  "flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm",
                  selectedMessage.type === "transcription" 
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                    : "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                )}>
                  {selectedMessage.type === "transcription" ? (
                    <RiVoiceprintLine className="size-6" />
                  ) : (
                    <RiFileTextLine className="size-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50">
                    {formatDate(selectedMessage.created_at)}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{formatTime(selectedMessage.created_at)}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(selectedMessage.created_at)}</span>
                  </div>
                </div>
                {selectedMessage.type === "transcription" && selectedMessage.status && (
                  <Badge variant={getStatusColor(selectedMessage.status)} className="px-2 py-1 text-xs">
                    {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                  </Badge>
                )}
              </div>

              {selectedMessage.audio_url && (
                <div className="mb-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <audio controls className="w-full">
                    <source src={selectedMessage.audio_url} type="audio/mpeg" />
                  </audio>
                </div>
              )}
              
              <div className="relative">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary-100 dark:bg-primary-900/30 rounded-full" />
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200 pl-3">
                  {selectedMessage.content}
                </p>
              </div>

              {selectedMessage.type === "transcription" && selectedMessage.status === "completed" && !selectedMessage.extracted && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <Button variant="primary" size="sm" className="gap-2 w-full">
                    <RiRobot2Line className="size-4" />
                    Extract with AI
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-4">
            <div className="text-center">
              <RiFileTextLine className="size-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500">Select a record to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar - Only for Active Session */}
      {selectedMessage?.type === "new" && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 safe-area-inset-bottom">
          <div className="flex items-center gap-2">
            {isRecording ? (
              <>
                <button
                  onClick={handlePauseResume}
                  className={cx(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-medium text-sm active:scale-95",
                    isPaused
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                      : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
                  )}
                >
                  {isPaused ? (
                    <>
                      <RiPlayLine className="size-5" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <RiPauseLine className="size-5" />
                      <span>Pause</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleStopRecording}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 transition-all font-medium text-sm active:scale-95"
                >
                  <RiStopLine className="size-5" />
                  <span>Stop</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStartRecording}
                  className="flex items-center justify-center size-12 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition-all active:scale-95"
                >
                  <RiMicLine className="size-6" />
                </button>
                <Button
                  onClick={handleSendNote}
                  disabled={!newNote.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-medium active:scale-95"
                >
                  <RiSendPlaneLine className="mr-2 size-5" />
                  Save Investigation
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
