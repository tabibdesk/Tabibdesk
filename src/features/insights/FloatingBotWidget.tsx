"use client"

import { useState, useEffect } from "react"
import { RiRobot2Line, RiCloseLine } from "@remixicon/react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { ChatBox } from "./ChatBox"
import { askInsight } from "./insights.api"
import type { TimeRange, ChatMessage } from "./insights.types"
import { Button } from "@/components/Button"
import { cx } from "@/lib/utils"

export function FloatingBotWidget() {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const timeRange: TimeRange = "30d"
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (overrideQuestion?: string) => {
    const activeQuestion = overrideQuestion || question
    if (!activeQuestion.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: activeQuestion,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setQuestion("")
    setIsLoading(true)
    setError(null)

    try {
      const result = await askInsight({
        question: activeQuestion.trim(),
        clinicId: currentClinic.id,
        timeRange,
      })

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.summary,
        response: result,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      setError(t.insights.failedToGetInsight)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    handleSubmit(prompt)
  }

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  return (
    <>
      {/* Floating button - hidden when panel is open */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label={t.insights.botOpen}
        className={cx(
          "fixed z-40 flex size-14 items-center justify-center rounded-full shadow-lg transition-all",
          "bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
          "bottom-6 end-6 sm:bottom-8 sm:end-8"
        )}
      >
        <RiRobot2Line className="size-7" aria-hidden />
      </button>
      )}

      {/* Expanded panel - Desktop: floating card | Mobile: bottom sheet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 sm:inset-auto sm:bottom-24 sm:end-8 sm:top-auto sm:left-auto sm:z-50"
          aria-modal="true"
          aria-label={t.nav.bot}
          role="dialog"
        >
          {/* Backdrop - mobile full, desktop click-to-close */}
          <div
            className="absolute inset-0 bg-black/30 sm:inset-0"
            onClick={() => setIsOpen(false)}
            role="presentation"
          />

          {/* Panel - Desktop: fixed size card | Mobile: bottom sheet */}
          <div
            className={cx(
              "absolute flex flex-col bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl sm:rounded-2xl",
              "bottom-0 start-0 end-0 max-h-[85vh] sm:max-h-[560px] sm:h-[560px] sm:w-[400px] sm:start-auto sm:end-0",
              "animate-in slide-in-from-bottom duration-300 sm:animate-in sm:slide-in-from-bottom-4 sm:duration-200"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                  <RiRobot2Line className="size-4 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {t.nav.bot}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label={t.common.close}
                className="size-8 p-0"
              >
                <RiCloseLine className="size-5" />
              </Button>
            </div>

            {/* Chat content */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ChatBox
                messages={messages}
                question={question}
                onQuestionChange={setQuestion}
                onSubmit={() => handleSubmit()}
                isLoading={isLoading}
                quickPrompts={[
                  t.insights.quickPrompt1,
                  t.insights.quickPrompt2,
                  t.insights.quickPrompt3,
                  t.insights.quickPrompt4,
                ]}
                quickPromptsSettings={[t.insights.quickPromptSettings1]}
                onQuickPrompt={handleQuickPrompt}
                embedded
              />
              {error && (
                <div className="shrink-0 border-t border-gray-200 px-4 py-2 dark:border-gray-800">
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
