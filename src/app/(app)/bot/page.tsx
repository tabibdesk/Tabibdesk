"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { ChatBox } from "@/features/insights/ChatBox"
import { askInsight } from "@/features/insights/insights.api"
import type { TimeRange, ChatMessage } from "@/features/insights/insights.types"

export default function BotPage() {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
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

  return (
    <div className="page-content flex flex-col min-h-0 min-h-[calc(100vh-5rem)]">
      <PageHeader title={t.nav.bot} className="shrink-0" />

      <div className="flex-1 min-h-0 flex flex-col mt-4">
        <div className="flex-1 min-h-0 flex flex-col">
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
          />
        </div>
        {error && (
          <div className="shrink-0 border-t border-gray-200 px-4 py-2 dark:border-gray-800 mt-2">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
