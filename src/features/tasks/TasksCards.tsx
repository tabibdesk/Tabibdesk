import Link from "next/link"
import { Button } from "@/components/Button"
import {
  RiUserLine,
  RiCheckLine,
  RiCheckboxBlankCircleLine,
  RiUserSharedLine,
  RiWhatsappLine,
} from "@remixicon/react"
import { Badge } from "@/components/Badge"
import {
  formatTaskDate,
  isOverdue,
  getSourceLabel,
  getSourceBadgeVariant,
} from "./tasks.utils"
import type { TaskListItem } from "./tasks.types"
import { cx } from "@/lib/utils"

interface TasksCardsProps {
  tasks: TaskListItem[]
  onMarkDone: (task: TaskListItem) => void
  onAssign: (task: TaskListItem) => void
  role: "doctor" | "assistant" | "manager"
}

export function TasksCards({
  tasks,
  onMarkDone,
  onAssign,
  role,
}: TasksCardsProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const overdue = isOverdue(task.dueDate)
        const isDone = task.status === "done"
        const canAssign = role === "doctor" || role === "assistant" || role === "manager"
        const waPhone = task.patientPhone ? task.patientPhone.replace(/[^\d]/g, "") : undefined
        const waHref = waPhone
          ? `https://wa.me/${waPhone}?text=${encodeURIComponent("Hello, this is TabibDesk clinic following up. When is a good time to talk?")}`
          : undefined
        
        return (
          <div
            key={task.id}
            className={cx(
              "group relative flex flex-col p-3 transition-colors bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm",
              isDone && "opacity-75"
            )}
          >
            {/* Status Accent Line */}
            <div className={cx(
              "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors",
              isDone ? "bg-green-500" : 
              overdue ? "bg-red-500" :
              "bg-gray-200 dark:bg-gray-700"
            )} />

            <div className="flex items-start gap-3 ml-1">
              {/* Status Circle / Mark Done Action */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!isDone) onMarkDone(task);
                }}
                disabled={isDone}
                className={cx(
                  "flex size-9 shrink-0 items-center justify-center rounded-full transition-all group/done cursor-pointer mt-0.5",
                  isDone 
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-gray-50 text-gray-400 hover:bg-green-500 hover:text-white dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-green-600"
                )}
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
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className={cx(
                      "text-sm text-gray-900 dark:text-white",
                      isDone && "text-gray-400 line-through decoration-gray-400/50"
                    )}>
                      {task.description || task.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {task.patientName && (
                        <Link
                          href={`/patients/${task.patientId}`}
                          className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                          <RiUserLine className="size-3" />
                          {task.patientName}
                        </Link>
                      )}
                      <Badge variant={getSourceBadgeVariant(task.source)} className="text-[10px] px-1.5 py-0">
                        {getSourceLabel(task.source)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {task.dueDate && (
                      <span className={cx(
                        "inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm",
                        isDone ? "bg-gray-50 text-gray-400 dark:bg-gray-800/50" :
                        overdue ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                        "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                      )}>
                        {formatTaskDate(task.dueDate)}
                      </span>
                    )}
                    {task.createdByName && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        by: {task.createdByName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {waHref && (
                    <Button asChild variant="secondary" size="sm" className="gap-2">
                      <a href={waHref} target="_blank" rel="noreferrer">
                        <RiWhatsappLine className="size-4" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                  {canAssign && (
                    <Button variant="secondary" size="sm" className="gap-2" onClick={() => onAssign(task)}>
                      <RiUserSharedLine className="size-4" />
                      Assign
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
