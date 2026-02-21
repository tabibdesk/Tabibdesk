"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { SearchInput } from "@/components/SearchInput"
import { RiAddLine } from "@remixicon/react"

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
        <button type="button" onClick={onNewTask} className="btn-search-action rtl:flex-row-reverse">
          <RiAddLine className="size-5 shrink-0" />
          <span className="hidden sm:inline">{t.tasks.newTask}</span>
        </button>
      </div>
    </div>
  )
}
