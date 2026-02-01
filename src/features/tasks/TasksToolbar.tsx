"use client"

import { Button } from "@/components/Button"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { SearchInput } from "@/components/SearchInput"
import { RiAddLine } from "@remixicon/react"
import type { TaskSource, TaskStatus } from "./tasks.types"

interface TasksToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onNewTask: () => void
}

export function TasksToolbar({
  searchQuery,
  onSearchChange,
  onNewTask,
}: TasksToolbarProps) {
  const t = useAppTranslations()
  return (
    <div className="space-y-3">
      {/* Search and Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <SearchInput
            placeholder={t.tasks.searchPlaceholder}
            value={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>

        {/* New Task Button */}
        <Button variant="secondary" onClick={onNewTask} className="flex-shrink-0 md:h-9 md:py-1.5 md:text-sm">
          <RiAddLine className="hidden sm:block sm:me-2 size-4" />
          <span className="hidden sm:inline">{t.tasks.newTask}</span>
          <span className="sm:hidden">+</span>
        </Button>
      </div>
    </div>
  )
}
