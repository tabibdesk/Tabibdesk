"use client"

import { cx } from "@/lib/utils"
import {
  RiUserLine,
  RiCapsuleLine,
  RiFlaskLine,
  RiCalendarLine,
  RiTaskLine,
  RiFileTextLine,
  RiVoiceprintLine,
  RiRestaurantLine,
  RiLineChartLine,
  RiAttachmentLine,
} from "@remixicon/react"

export type HistoryTab =
  | "general"
  | "medications"
  | "labs"
  | "progress"
  | "appointments"
  | "tasks"
  | "notes"
  | "transcriptions"
  | "attachments"
  | "diet"

interface HistorySidebarProps {
  activeTab: HistoryTab
  onTabChange: (tab: HistoryTab) => void
}

const tabs = [
  { id: "general" as HistoryTab, label: "General", icon: RiUserLine },
  { id: "notes" as HistoryTab, label: "Notes", icon: RiFileTextLine },
  { id: "medications" as HistoryTab, label: "Medications", icon: RiCapsuleLine },
  { id: "labs" as HistoryTab, label: "Labs", icon: RiFlaskLine },
  { id: "tasks" as HistoryTab, label: "Tasks", icon: RiTaskLine },
  { id: "progress" as HistoryTab, label: "Progress", icon: RiLineChartLine },
  { id: "appointments" as HistoryTab, label: "Appointments", icon: RiCalendarLine },
  { id: "transcriptions" as HistoryTab, label: "Transcriptions", icon: RiVoiceprintLine },
  { id: "attachments" as HistoryTab, label: "Attachments", icon: RiAttachmentLine },
  { id: "diet" as HistoryTab, label: "Diet Plans", icon: RiRestaurantLine },
]

export function HistorySidebar({ activeTab, onTabChange }: HistorySidebarProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-950">
      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cx(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

