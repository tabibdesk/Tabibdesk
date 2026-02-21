import Link from "next/link"
import { Button } from "@/components/Button"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useLocale } from "@/contexts/locale-context"
import {
  RiUserLine,
  RiCheckLine,
  RiCheckboxBlankCircleLine,
  RiWhatsappLine,
  RiTimeLine,
  RiArrowRightLine,
} from "@remixicon/react"
import { Badge } from "@/components/Badge"
import { getBadgeColor } from "@/lib/badgeColors"
import {
  formatTaskDateTranslated,
  isOverdue,
  getStatusBadgeVariant,
  TASK_STATUS_KEYS,
} from "./tasks.utils"
import type { TaskListItem } from "./tasks.types"
import { cx } from "@/lib/utils"

interface TasksCardsProps {
  tasks: TaskListItem[]
  onMarkDone: (task: TaskListItem) => void
  onAssign: (task: TaskListItem) => void
  onSnooze?: (task: TaskListItem, days: number) => void
  onNextAttempt?: (task: TaskListItem) => void
  role: "doctor" | "assistant" | "manager"
}

export function TasksCards({
  tasks,
  onMarkDone,
  onAssign,
  onSnooze,
  onNextAttempt,
  role,
}: TasksCardsProps) {
  const t = useAppTranslations()
  const { lang } = useLocale()
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
              "card-surface group relative flex items-start gap-4 p-4",
              isDone && "opacity-70 bg-gray-50/50 dark:bg-gray-950/50"
            )}
          >
            {/* Left side: Status Circle / Mark Done Action */}
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!isDone) onMarkDone(task);
              }}
              disabled={isDone}
              className={cx(
                "flex size-10 shrink-0 items-center justify-center rounded-full transition-all group/done cursor-pointer mt-1",
                isDone 
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
                  : "bg-gray-50 text-gray-400 hover:bg-emerald-500 hover:text-white dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-emerald-600 shadow-sm"
              )}
            >
              <div className={cx(isDone ? "block" : "group-hover/done:hidden")}>
                {isDone ? (
                  <RiCheckLine className="size-6" />
                ) : (
                  <RiCheckboxBlankCircleLine className="size-6" />
                )}
              </div>
              {!isDone && (
                <div className="hidden group-hover/done:block">
                  <RiCheckLine className="size-6" />
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0 space-y-2.5">
              {/* Top row: Patient & Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {task.patientName && (
                    <Link
                      href={`/patients/${task.patientId}`}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors uppercase tracking-wider block mb-0.5"
                    >
                      {task.patientName}
                    </Link>
                  )}
                  <p className={cx(
                    "text-base font-medium text-gray-900 dark:text-white leading-tight",
                    isDone && "text-gray-400 line-through decoration-gray-400/50"
                  )}>
                    {task.description || task.title}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {(task.patientName || task.patientId) && task.patientPhone && waHref && (
                    <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-emerald-50 hover:text-emerald-600" title="Contact on WhatsApp">
                      <a href={waHref} target="_blank" rel="noreferrer">
                        <RiWhatsappLine className="size-4" />
                        <span className="sr-only">Contact on WhatsApp</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Bottom row: Badges & Info */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  color={getBadgeColor(getStatusBadgeVariant(task.status))} 
                  size="xs" 
                  rounded="full"
                  className="px-2.5"
                >
                  {t.tasks[TASK_STATUS_KEYS[task.status] as keyof typeof t.tasks] ?? task.status}
                </Badge>
                
                {task.follow_up_kind && (
                  <Badge color="amber" size="xs" rounded="full" className="px-2.5">
                    {t.tasks.followUp}: {task.follow_up_kind === "cancelled" ? t.tasks.followUpCancelled : task.follow_up_kind === "no_show" ? t.tasks.followUpNoShow : t.tasks.followUpInactive}
                  </Badge>
                )}

                {task.attempt !== undefined && task.follow_up_kind && (
                  <Badge color="gray" size="xs" rounded="full" className="px-2.5">
                    {t.tasks.attempt} {task.attempt}
                  </Badge>
                )}

                {task.dueDate && (
                  <Badge 
                    color={getBadgeColor(isDone ? "neutral" : overdue ? "error" : "default")} 
                    size="xs" 
                    rounded="full"
                    className="px-2.5"
                  >
                    <RiTimeLine className="size-3 me-1 inline-block" />
                    {formatTaskDateTranslated(task.dueDate, t, lang)}
                  </Badge>
                )}

                {(task.createdByName || task.assignedToName) && (
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 ms-1">
                    <RiUserLine className="size-3" />
                    <span>
                      {task.createdByName && <>{task.createdByName}</>}
                      {task.createdByName && task.assignedToName && <RiArrowRightLine className="size-2.5 inline mx-0.5" />}
                      {task.assignedToName && (
                        canAssign ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              onAssign(task)
                            }}
                            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors underline-offset-2 hover:underline"
                          >
                            {task.assignedToName}
                          </button>
                        ) : (
                          <span>{task.assignedToName}</span>
                        )
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons (shown on hover or if important) */}
              {task.follow_up_kind && !isDone && (onSnooze || onNextAttempt) && (
                <div className="flex items-center gap-2 pt-1">
                  {onSnooze && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs rounded-full border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      onClick={() => onSnooze(task, 1)}
                    >
                      <RiTimeLine className="size-3.5 me-1.5" />
                      Snooze
                    </Button>
                  )}
                  {onNextAttempt && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs rounded-full border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      onClick={() => onNextAttempt(task)}
                    >
                      <RiArrowRightLine className="size-3.5 me-1.5" />
                      {t.tasks.nextAttempt}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
