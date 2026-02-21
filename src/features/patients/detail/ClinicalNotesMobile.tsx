"use client"

import { useState } from "react"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import {
  RiMicLine,
  RiSendPlaneLine,
  RiPauseLine,
  RiPlayLine,
  RiStopLine,
  RiCheckboxCircleLine,
  RiCloseLine as RiCloseIcon,
} from "@remixicon/react"
import { cx } from "@/lib/utils"
import { useAppTranslations } from "@/lib/useAppTranslations"

interface MetricToRecord {
  id: string
  label: string
}

interface MedicalConditionItem {
  id: string
  label: string
}

interface ClinicalNotesMobileProps {
  // Hook state
  newNote: string
  setNewNote: (note: string) => void
  isRecording: boolean
  isPaused: boolean
  showReminder: boolean
  lastDetectedItem: string | null
  checklist: Record<string, boolean>
  completedCount: number
  totalCount: number
  completenessPercentage: number
  checklistItems: any[]
  metricsToRecord?: MetricToRecord[]
  metricsChecklist?: Record<string, boolean>
  medicalConditions?: MedicalConditionItem[]
  medicalConditionValues?: Record<string, boolean>
  handleMedicalConditionToggle?: (conditionId: string) => void
  handleChecklistToggle?: (itemId: string) => void
  handleMetricsChecklistToggle?: (metricId: string) => void
  
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
  completenessPercentage,
  checklistItems,
  metricsToRecord = [],
  metricsChecklist = {},
  medicalConditions = [],
  medicalConditionValues = {},
  handleMedicalConditionToggle,
  handleChecklistToggle,
  handleMetricsChecklistToggle,
  handleSendNote,
  handleStartRecording,
  handleStopRecording,
  handlePauseResume,
}: ClinicalNotesMobileProps) {
  const t = useAppTranslations()
  const [showChecklist, setShowChecklist] = useState(false)

  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] bg-gray-50/50 dark:bg-gray-950/50">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-gray-950 shadow-sm">
        <div className="flex items-center gap-2">
          <Badge color="indigo" size="xs">Active Session</Badge>
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 dark:bg-red-900/20 rounded-full">
              <div className="size-1.5 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Live</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Floating Progress Indicator */}
          <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="relative flex items-center justify-center size-10 active:scale-90 transition-transform"
        >
          <svg className="size-10 -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-gray-100 dark:text-gray-800"
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
      </div>

      {/* Checklist Bottom Sheet */}
      {showChecklist && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200 backdrop-blur-[2px]"
            onClick={() => setShowChecklist(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300 bg-white dark:bg-gray-950 rounded-t-[2rem] shadow-2xl max-h-[80vh] overflow-hidden">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-3 mb-1" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-gray-900">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                  <RiCheckboxCircleLine className="size-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{t.clinicalNotes.visitProgress}</h3>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{completenessPercentage}% {t.clinicalNotes.complete}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChecklist(false)}
                className="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={t.common.close}
                title={t.common.close}
              >
                <RiCloseIcon className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 max-h-[calc(80vh-80px)]">
              <div className="space-y-3">
                {checklistItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleChecklistToggle?.(item.id)}
                    className={cx(
                      "flex w-full items-center gap-4 p-4 rounded-2xl transition-all duration-300 border text-start active:scale-[0.98]",
                      checklist[item.id] 
                        ? "bg-primary-50/50 border-primary-100 dark:bg-primary-900/10 dark:border-primary-900/20 shadow-sm" 
                        : "bg-gray-50/50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-800"
                    )}
                  >
                    <div className={cx(
                      "size-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 shrink-0",
                      checklist[item.id] 
                        ? "bg-primary-600 border-primary-600 text-white scale-110 rotate-0" 
                        : "border-gray-300 dark:border-gray-700 rotate-45"
                    )}>
                      {checklist[item.id] ? <RiCheckboxCircleLine className="size-5" /> : <div className="size-1 rounded-full bg-gray-300 dark:bg-gray-700" />}
                    </div>
                    <span className={cx(
                      "text-sm font-semibold flex-1 transition-colors",
                      checklist[item.id] 
                        ? "text-primary-900 dark:text-primary-100" 
                        : "text-gray-500 dark:text-gray-400"
                    )}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
              {metricsToRecord.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="space-y-3">
                    {metricsToRecord.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleMetricsChecklistToggle?.(m.id)}
                        className={cx(
                          "flex w-full items-center gap-4 p-4 rounded-2xl transition-all duration-300 border text-start active:scale-[0.98]",
                          metricsChecklist[m.id]
                            ? "bg-primary-50/50 border-primary-100 dark:bg-primary-900/10 dark:border-primary-900/20 shadow-sm"
                            : "bg-gray-50/50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-800"
                        )}
                      >
                        <div className={cx(
                          "size-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 shrink-0",
                          metricsChecklist[m.id]
                            ? "bg-primary-600 border-primary-600 text-white scale-110 rotate-0"
                            : "border-gray-300 dark:border-gray-700 rotate-45"
                        )}>
                          {metricsChecklist[m.id] ? <RiCheckboxCircleLine className="size-5" /> : <div className="size-1 rounded-full bg-gray-300 dark:bg-gray-700" />}
                        </div>
                        <span className={cx(
                          "text-sm font-semibold flex-1 transition-colors",
                          metricsChecklist[m.id]
                            ? "text-primary-900 dark:text-primary-100"
                            : "text-gray-500 dark:text-gray-400"
                        )}>
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {medicalConditions.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="space-y-3">
                    {medicalConditions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleMedicalConditionToggle?.(c.id)}
                        className={cx(
                          "flex w-full items-center gap-4 p-4 rounded-2xl transition-all duration-300 border text-start",
                          medicalConditionValues[c.id]
                            ? "bg-primary-50/50 border-primary-100 dark:bg-primary-900/10 dark:border-primary-900/20 shadow-sm"
                            : "bg-gray-50/50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-800"
                        )}
                      >
                        <div
                          className={cx(
                            "size-7 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                            medicalConditionValues[c.id]
                              ? "bg-primary-600 border-primary-600 text-white scale-110 rotate-0"
                              : "border-gray-300 dark:border-gray-700 rotate-45"
                          )}
                        >
                          {medicalConditionValues[c.id] ? (
                            <RiCheckboxCircleLine className="size-5" />
                          ) : (
                            <div className="size-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                          )}
                        </div>
                        <span
                          className={cx(
                            "text-sm font-semibold flex-1 transition-colors",
                            medicalConditionValues[c.id]
                              ? "text-primary-900 dark:text-primary-100"
                              : "text-gray-500 dark:text-gray-400"
                          )}
                        >
                          {c.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed text-center font-medium">
                  {t.clinicalNotes.itemsAutoDetected}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 safe-area-inset-bottom">
              <Button
                onClick={() => setShowChecklist(false)}
                className="w-full"
              >
                {t.common.close}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Main Content - full width, no horizontal padding */}
      <div className="flex-1 flex flex-col min-h-[320px] px-0 py-2 relative">
        {/* Textarea */}
        <div className="relative flex-1 flex flex-col min-h-[280px] w-full">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Start typing or record..."
            className="w-full flex-1 min-h-[280px] resize-none rounded-none border-0 outline-none focus:outline-none focus:ring-0 ring-0 bg-white dark:bg-gray-900 text-base text-gray-900 placeholder-gray-300 dark:text-gray-100 leading-relaxed px-4 py-4 transition-all"
          />
          
          {/* Detection toast - neutral, at bottom of card */}
          {showReminder && (
            <div className="absolute bottom-3 left-3 right-3 animate-in fade-in slide-in-from-bottom-2 duration-300 z-20">
              <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 w-fit max-w-full mx-auto">
                <RiCheckboxCircleLine className="size-3.5 shrink-0 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium truncate">Detected: {lastDetectedItem}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar - compact for mobile */}
      <div className="border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md px-3 py-3 safe-area-inset-bottom">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <>
              <button
                onClick={handlePauseResume}
                className={cx(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider active:scale-95",
                  isPaused
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30"
                )}
              >
                {isPaused ? <RiPlayLine className="size-4" /> : <RiPauseLine className="size-4" />}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>
              <button
                onClick={handleStopRecording}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-100 text-red-700 dark:bg-red-900/30 transition-all font-semibold text-xs uppercase tracking-wider active:scale-95"
              >
                <RiStopLine className="size-4" />
                <span>Stop</span>
              </button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handleStartRecording}
                className="size-11 rounded-xl shadow-none min-w-0 p-0"
                title="Start Recording"
              >
                <RiMicLine className="size-5" />
              </Button>
              <Button
                onClick={handleSendNote}
                disabled={!newNote.trim()}
                className="flex-1 h-11 rounded-xl text-xs font-semibold uppercase tracking-wider active:scale-95 shadow-md shadow-primary-500/20 min-h-0 py-2"
              >
                <RiSendPlaneLine className="mr-1.5 size-4" />
                Save Note
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
