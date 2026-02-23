"use client"

import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import {
  RiMicLine,
  RiSendPlaneLine,
  RiPauseLine,
  RiPlayLine,
  RiStopLine,
  RiCheckboxCircleLine,
  RiHeartPulseLine,
  RiCloseLine,
} from "@remixicon/react"
import { cx } from "@/lib/utils"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { PROGRESS_METRIC_REGEX } from "@/types/progress"

interface MetricToRecord {
  id: string
  label: string
}

interface MedicalConditionItem {
  id: string
  label: string
}

interface ClinicalNotesDesktopProps {
  // Hook state
  newNote: string
  setNewNote: (note: string) => void
  isRecording: boolean
  isPaused: boolean
  detectedBadges: Array<{ id: string; label: string }>
  dismissDetectedBadge: (id: string) => void
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
  
  handleSendNote: () => void
  handleStartRecording: () => void
  handleStopRecording: () => void
  handlePauseResume: () => void
}

export function ClinicalNotesDesktop({
  newNote,
  setNewNote,
  isRecording,
  isPaused,
  detectedBadges,
  dismissDetectedBadge,
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
}: ClinicalNotesDesktopProps) {
  const t = useAppTranslations()
  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[600px] gap-6 overflow-hidden">
      {/* Left Pane: Visit Progress */}
      <div className="w-80 flex flex-col shrink-0">
        <Card className="flex-1 overflow-hidden flex flex-col border-gray-200 dark:border-gray-800 shadow-card">
          <CardHeader className="px-4 py-2 space-y-0 border-b border-gray-100 dark:border-gray-800 min-h-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiCheckboxCircleLine className="size-4 text-primary-600 shrink-0" />
                <CardTitle className="text-sm font-semibold capitalize text-gray-500">{t.clinicalNotes.visitProgress}</CardTitle>
              </div>
              <span className="text-xs font-bold text-primary-600">{completenessPercentage}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div 
                className="h-full bg-primary-600 transition-all duration-500 ease-out"
                style={{ width: `${completenessPercentage}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto py-4">
            <div className="grid grid-cols-1 gap-4">
              {checklistItems.map((item) => {
                const isValidatedFromNote = checklist[item.id] && item.regex.test(newNote.toLowerCase())
                return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !isValidatedFromNote && handleChecklistToggle?.(item.id)}
                  disabled={isValidatedFromNote}
                  className={cx(
                    "flex w-full items-center gap-3 text-start transition-opacity",
                    isValidatedFromNote ? "pointer-events-none cursor-default opacity-90" : "hover:opacity-80"
                  )}
                >
                  <div className={cx(
                    "size-5 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0",
                    checklist[item.id] 
                      ? "bg-primary-600 border-primary-600 text-white scale-110 shadow-card" 
                      : "border-gray-200 dark:border-gray-700"
                  )}>
                    {checklist[item.id] && <RiCheckboxCircleLine className="size-3.5" />}
                  </div>
                  <span className={cx(
                    "text-sm transition-colors capitalize",
                    checklist[item.id] ? "text-gray-900 dark:text-gray-100 font-semibold" : "text-gray-400"
                  )}>
                    {item.label}
                  </span>
                </button>
              )})}
            </div>
            {metricsToRecord.length > 0 && (
              <>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-1 gap-4">
                    {metricsToRecord.map((m) => {
                      const metricRegex = PROGRESS_METRIC_REGEX[m.id]
                      const isMetricValidatedFromNote = metricsChecklist[m.id] && metricRegex?.test(newNote)
                      return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => !isMetricValidatedFromNote && handleMetricsChecklistToggle?.(m.id)}
                        disabled={isMetricValidatedFromNote}
                        className={cx(
                          "flex w-full items-center gap-3 text-start transition-opacity",
                          isMetricValidatedFromNote ? "pointer-events-none cursor-default opacity-90" : "hover:opacity-80"
                        )}
                      >
                        <div className={cx(
                          "size-5 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0",
                          metricsChecklist[m.id]
                            ? "bg-primary-600 border-primary-600 text-white scale-110 shadow-card"
                            : "border-gray-200 dark:border-gray-700"
                        )}>
                          {metricsChecklist[m.id] && <RiCheckboxCircleLine className="size-3.5" />}
                        </div>
                        <span className={cx(
                          "text-sm transition-colors capitalize",
                          metricsChecklist[m.id] ? "text-gray-900 dark:text-gray-100 font-semibold" : "text-gray-400"
                        )}>
                          {m.label}
                        </span>
                      </button>
                    )})}
                  </div>
                </div>
              </>
            )}
            {medicalConditions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-1 gap-4">
                  {medicalConditions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleMedicalConditionToggle?.(c.id)}
                      className="flex w-full items-center gap-3 text-start"
                    >
                      <div
                        className={cx(
                          "size-5 shrink-0 rounded-full border flex items-center justify-center transition-all duration-300",
                          medicalConditionValues[c.id]
                            ? "bg-primary-600 border-primary-600 text-white scale-110 shadow-card"
                            : "border-gray-200 dark:border-gray-700"
                        )}
                      >
                        {medicalConditionValues[c.id] && (
                          <RiCheckboxCircleLine className="size-3.5" />
                        )}
                      </div>
                      <span
                        className={cx(
                          "text-sm transition-colors capitalize",
                          medicalConditionValues[c.id]
                            ? "text-gray-900 dark:text-gray-100 font-semibold"
                            : "text-gray-400"
                        )}
                      >
                        {(t.profile as { conditions?: Record<string, string> }).conditions?.[c.id] ?? c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Center Pane: Note Entry - same Card/CardHeader as progress card for matching borders */}
      <Card className="flex-1 flex flex-col min-w-0 overflow-hidden border-gray-200 dark:border-gray-800 shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2 shrink-0 border-b border-gray-100 dark:border-gray-800 min-h-0">
          <Badge color="indigo" size="xs">Active Session</Badge>
          <div className="flex items-center gap-2">
            {isRecording ? (
              <>
                <button
                  onClick={handlePauseResume}
                  className={cx(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all font-medium text-sm",
                    isPaused
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                  )}
                  title={isPaused ? "Resume Recording" : "Pause Recording"}
                >
                  {isPaused ? <RiPlayLine className="size-4" /> : <RiPauseLine className="size-4" />}
                  <span className="text-xs">{isPaused ? "Resume" : "Pause"}</span>
                </button>
                <button
                  onClick={handleStopRecording}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all font-medium text-sm"
                  title="End Recording"
                >
                  <RiStopLine className="size-4" />
                  <span className="text-xs">End</span>
                </button>
                <div className="flex items-center gap-2 px-2 border-l border-gray-200 dark:border-gray-800 ml-2">
                  <div className="size-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Live</span>
                </div>
              </>
            ) : (
              <Button
                variant="secondary"
                onClick={handleStartRecording}
                className="size-10 rounded-lg shadow-none min-w-0 p-0 border-0"
                title="Start Recording"
                aria-label="Start Recording"
              >
                <RiMicLine className="size-5" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 pt-0 min-h-0 overflow-hidden">
          {/* Detected badges - top, dismissable */}
          {detectedBadges.length > 0 && (
            <div className="shrink-0 px-4 pt-4 pb-2 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {detectedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                >
                  <RiCheckboxCircleLine className="size-3.5 shrink-0 text-primary-500 dark:text-primary-400" />
                  <span className="text-xs font-medium">{badge.label}</span>
                  <button
                    type="button"
                    onClick={() => dismissDetectedBadge(badge.id)}
                    className="shrink-0 rounded p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
                    aria-label={t.clinicalNotes.dismissDetected}
                    title={t.clinicalNotes.dismissDetected}
                  >
                    <RiCloseLine className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Note area - overlay + textarea */}
          <div className="flex-1 relative min-h-0">
          {/* Highlight Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words text-lg text-transparent leading-relaxed p-8 z-10"
          >
            {newNote.split(/(\s+)/).map((word, i) => {
              const matchedChecklist = checklistItems.find(item => item.regex.test(word.toLowerCase()));
              if (matchedChecklist) {
                return <span key={i} className="bg-primary-100/30 dark:bg-primary-900/20 rounded px-1 text-transparent border-b-2 border-primary-500/30 font-medium">{word}</span>;
              }
              return word;
            })}
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Start typing or recording your clinical observations..."
            className="w-full flex-1 resize-none bg-transparent text-lg text-gray-900 placeholder-gray-300 outline-none focus:outline-none focus:ring-0 ring-0 border-0 shadow-none dark:text-gray-100 leading-relaxed p-8 pb-24 transition-all"
          />
          
          {/* Action Bar at Bottom */}
          <div className="absolute bottom-8 right-8 z-20">
            <button
              type="button"
              onClick={handleSendNote}
              disabled={!newNote.trim() && !isRecording}
              className="btn-search-action rtl:flex-row-reverse disabled:opacity-50 disabled:pointer-events-none"
            >
              <RiSendPlaneLine className="size-5 shrink-0" />
              {t.clinicalNotes.saveNote}
            </button>
          </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
