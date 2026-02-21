"use client"

import Link from "next/link"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useLocale } from "@/contexts/locale-context"
import { Button } from "@/components/Button"
import {
  RiUserLine,
  RiCheckLine,
} from "@remixicon/react"
import {
  formatTaskDateTranslated,
  TASK_TYPE_KEYS,
} from "@/features/tasks/tasks.utils"
import type { TaskListItem } from "@/features/tasks/tasks.types"
import { cx } from "@/lib/utils"

interface ArchiveTasksTableProps {
  tasks: TaskListItem[]
}

export function ArchiveTasksTable({ tasks }: ArchiveTasksTableProps) {
  const t = useAppTranslations()
  const { lang } = useLocale()
  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isDone = task.status === "done"
        const taskWithDates = task as TaskListItem & { completed_at?: string | null; ignored_at?: string | null }
        const completedDate = task.status === "done" && taskWithDates.completed_at 
          ? new Date(taskWithDates.completed_at)
          : taskWithDates.ignored_at 
          ? new Date(taskWithDates.ignored_at)
          : null

        return (
          <div
            key={task.id}
            className={cx(
              "group relative flex items-center justify-between p-3 transition-colors bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm opacity-75"
            )}
          >
            {/* Status Accent Line - RTL aware */}
            <div className={cx(
              "absolute start-0 top-0 bottom-0 w-1 rounded-s-xl transition-colors",
              task.status === "done" ? "bg-green-500" : 
              task.status === "cancelled" ? "bg-red-500" :
              taskWithDates.ignored_at ? "bg-gray-500" :
              "bg-gray-200 dark:bg-gray-700"
            )} />

            <div className="flex items-center gap-3 flex-1 min-w-0 ms-1">
              {/* Status Icon */}
              <div className={cx(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                task.status === "done" 
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                  : task.status === "cancelled"
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
              )}>
                {task.status === "done" ? (
                  <RiCheckLine className="size-5" />
                ) : (
                  <span className="text-xs">×</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={cx(
                    "text-sm font-medium text-gray-900 dark:text-white truncate",
                    isDone && "text-gray-400 line-through decoration-gray-400/50"
                  )}>
                    {task.description || task.title}
                  </p>
                </div>
                
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                  {task.patientName && (
                    <Link
                      href={`/patients/${task.patientId}`}
                      className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium rtl:flex-row-reverse"
                    >
                      <RiUserLine className="size-3 shrink-0" />
                      {task.patientName}
                    </Link>
                  )}
                  {task.assignedToName && (
                    <span className="flex items-center gap-1 rtl:flex-row-reverse">
                      {t.archive.assignedTo} {task.assignedToName}
                    </span>
                  )}
                  {task.type && (
                    <span className="flex items-center gap-1 rtl:flex-row-reverse">
                      {t.archive.type} {task.type in TASK_TYPE_KEYS ? (t.tasks as Record<string, string>)[TASK_TYPE_KEYS[task.type as keyof typeof TASK_TYPE_KEYS]] : task.type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Completed Date + Actions - RTL aware */}
            <div className="flex items-center gap-2 ms-4 shrink-0 rtl:flex-row-reverse">
              <div className="flex flex-col items-end gap-1 rtl:items-start">
                {completedDate && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {task.status === "done" ? t.archive.completed : t.archive.ignored}: {completedDate.toLocaleDateString()}
                  </span>
                )}
                {task.dueDate && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t.archive.due} {formatTaskDateTranslated(task.dueDate, t, lang)}
                  </span>
                )}
              </div>
              {task.patientId && (
                <Link href={`/patients/${task.patientId}`}>
                  <Button variant="ghost" size="sm" className="inline-flex items-center gap-2 rtl:flex-row-reverse">
                    <RiUserLine className="size-4" />
                    {t.archive.openPatient}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
