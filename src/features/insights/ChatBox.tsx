"use client"

import { useRef, useEffect } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Button } from "@/components/Button"
import { RiSendPlaneLine, RiExternalLinkLine, RiFileCopyLine, RiUserLine, RiRobot2Line } from "@remixicon/react"
import { useRouter } from "next/navigation"
import type { ChatMessage } from "./insights.types"

export interface SettingsSectionItem {
  label: string
  tab: string
}

interface ChatBoxProps {
  messages: ChatMessage[]
  question: string
  onQuestionChange: (question: string) => void
  onSubmit: () => void
  isLoading: boolean
  quickPrompts: string[]
  onQuickPrompt: (prompt: string) => void
  /** Shown only when user role can change settings (e.g. doctor/manager). Sample ways to open settings tabs. */
  settingsSection?: { title: string; items: SettingsSectionItem[] } | null
  onSettingsAction?: (tab: string) => void
}

export function ChatBox({
  messages,
  question,
  onQuestionChange,
  onSubmit,
  isLoading,
  quickPrompts,
  onQuickPrompt,
  settingsSection,
  onSettingsAction,
}: ChatBoxProps) {
  const t = useAppTranslations()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleCopy = (content: string, response?: any) => {
    let text = content
    if (response) {
      text = `${response.summary}\n\n${response.metrics.map((m: any) => `${m.label}: ${m.value}`).join("\n")}`
    }
    navigator.clipboard.writeText(text)
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800"
      >
        {messages.length === 0 && (
          <div className="py-10 px-12">
            <div className="flex flex-col items-center mb-6">
              <div className="size-12 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <RiRobot2Line className="size-6 text-primary-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t.insights.aiName}</span>
            </div>
            <div
              className={`grid gap-6 w-fit max-w-full mx-auto ${
                settingsSection && settingsSection.items.length > 0 && onSettingsAction
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              <div className="flex flex-col items-center text-center lg:items-start lg:text-start rtl:lg:items-end rtl:lg:text-end max-w-xs w-full">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-end rtl:text-start">
                  {t.insights.askAboutPerformance}
                </p>
                <div className="flex flex-col gap-2 w-full max-w-full px-0 text-end rtl:text-start">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => onQuickPrompt(prompt)}
                      className="text-inherit text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {settingsSection && settingsSection.items.length > 0 && onSettingsAction && (
                <div className="flex flex-col items-center text-center lg:items-start lg:text-start rtl:lg:items-end rtl:lg:text-end pt-4 lg:pt-0 max-w-xs w-full">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-end rtl:text-start">
                    {settingsSection.title}
                  </p>
                  <div className="flex flex-col gap-2 w-full mb-4 text-end rtl:text-start">
                    {settingsSection.items.map((item: SettingsSectionItem) => (
                      <button
                        key={item.tab}
                        onClick={() => onSettingsAction(item.tab)}
                        className="text-inherit text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
          >
            <div className={`flex gap-2 max-w-[90%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`size-7 rounded-full flex items-center justify-center shrink-0 ${
                message.role === "user" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800"
              }`}>
                {message.role === "user" ? <RiUserLine className="size-4" /> : <RiRobot2Line className="size-4" />}
              </div>
              <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                message.role === "user" 
                  ? "bg-primary-600 text-white rounded-tr-none" 
                  : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none"
              }`}>
                {message.role === "assistant" && message.response ? (
                  <div className="space-y-3">
                    <p className="leading-relaxed">{message.response.summary}</p>
                    
                    {message.response.metrics.length > 0 && (
                      <div className="grid grid-cols-1 gap-2 py-2">
                        {message.response.metrics.map((metric: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-900/50 text-xs">
                            <span className="text-gray-500">{metric.label}</span>
                            <span className="font-semibold">{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      {message.response.actions.map((action: any, i: number) => (
                        <Button
                          key={i}
                          variant={action.type === "primary" ? "primary" : "secondary"}
                          size="sm"
                          onClick={() => router.push(action.route)}
                          className="h-8 text-[10px] font-bold px-2"
                        >
                          {action.label}
                          <RiExternalLinkLine className="ms-1 size-3" />
                        </Button>
                      ))}
                      <button 
                        onClick={() => handleCopy(message.content, message.response)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400"
                        title={t.insights.copy}
                      >
                        <RiFileCopyLine className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 border-t dark:border-gray-700 pt-2 mt-2">
                      {message.response.basedOn}
                    </p>
                  </div>
                ) : (
                  <p className="leading-relaxed">{message.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="flex gap-2">
              <div className="size-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <RiRobot2Line className="size-4 animate-pulse" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="size-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="size-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="size-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-2xl">
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="flex gap-2"
        >
          <Input
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            placeholder={t.insights.typeQuestion}
            className="flex-1 h-9 text-sm rounded-xl focus:ring-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="h-9 rounded-xl px-3 shrink-0"
          >
            <RiSendPlaneLine className="size-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
