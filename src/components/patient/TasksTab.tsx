"use client"

import { cx } from "@/lib/utils"
import {
  RiTaskLine,
  RiCheckLine,
  RiCheckboxBlankCircleLine,
} from "@remixicon/react"
import { formatTaskDate, isOverdue } from "@/features/tasks/tasks.utils"

interface Task {
  id: string
  patient_id: string
  title: string
  description: string | null
  type: string
  status: string
  due_date: string
  completed_at: string | null
  ignored_at: string | null
  created_at: string
  updated_at: string | null
  created_by_name?: string
}

interface TasksTabProps {
  tasks: Task[]
  patientId: string
  onToggleStatus: (taskId: string) => void
  onEditTask?: (taskId: string) => void
  onDeleteTask?: (taskId: string) => void
}

export function TasksTab({
  tasks,
  patientId: _patientId,
  onToggleStatus,
}: TasksTabProps) {

  // Filter to show only in-progress tasks (pending, not completed)
  const inProgressTasks = tasks.filter((task) => {
    const isDone = task.status === "completed" || task.status === "done"
    return !isDone && !task.ignored_at
  })

  // Sort tasks: overdue first, then by due date
  const sortedTasks = [...inProgressTasks].sort((a, b) => {
    const aOverdue = isOverdue(a.due_date)
    const bOverdue = isOverdue(b.due_date)

    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1

    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  })

  return (
    <div className="space-y-4">
      {sortedTasks.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
          <RiTaskLine className="mx-auto size-12 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No in-progress tasks for this patient.</p>
          <p className="mt-1 text-xs text-gray-400">Completed tasks are shown in the History tab.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => {
            const overdue = isOverdue(task.due_date)
            const isDone = task.status === "completed" || task.status === "done"

            return (
              <div
                key={task.id}
                className={cx(
                  "group relative flex items-center justify-between p-3 transition-colors bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm",
                  isDone && "opacity-75"
                )}
              >
                {/* Status Accent Line */}
                <div
                  className={cx(
                    "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors",
                    isDone
                      ? "bg-green-500"
                      : overdue
                      ? "bg-red-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  )}
                />

                <div className="flex items-center gap-3 flex-1 min-w-0 ml-1">
                  {/* Status Circle / Mark Done Action */}
                  <button
                    onClick={() => onToggleStatus(task.id)}
                    className={cx(
                      "flex size-9 shrink-0 items-center justify-center rounded-full transition-all group/done cursor-pointer",
                      isDone
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-50 text-gray-400 hover:bg-green-500 hover:text-white dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-green-600"
                    )}
                    title={isDone ? "Mark as Pending" : "Mark as Done"}
                  >
                    <div className={cx(isDone ? "block" : "group-hover/done:hidden")}>
                      {isDone ? (
                        <RiCheckLine className="size-5" />
                      ) : (
                        <RiCheckboxBlankCircleLine className="size-5" />
                      )}
                    </div>
                    {!isDone && (
                      <div className="hidden group-hover/done:block">
                        <RiCheckLine className="size-5" />
                      </div>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cx(
                        "text-sm text-gray-900 dark:text-white truncate",
                        isDone && "text-gray-400 line-through decoration-gray-400/50"
                      )}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side - Due Date and Creator */}
                <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                  <span
                    className={cx(
                      "inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm",
                      isDone
                        ? "bg-gray-50 text-gray-400 dark:bg-gray-800/50"
                        : overdue
                        ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                    )}
                  >
                    {formatTaskDate(task.due_date)}
                  </span>
                  {task.created_by_name && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      by: {task.created_by_name}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
