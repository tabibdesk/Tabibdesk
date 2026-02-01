import type { ComponentType, ReactNode } from "react"
import { Button } from "@/components/Button"
import { RiAddLine } from "@remixicon/react"

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>

interface PatientEmptyStateProps {
  icon: IconComponent
  title: ReactNode
  description?: ReactNode
  actionLabel?: ReactNode
  onAction?: () => void
  actionIcon?: IconComponent
}

export function PatientEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = RiAddLine,
}: PatientEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
      <Icon className="size-10 text-gray-400 dark:text-gray-500 shrink-0" aria-hidden />
      <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-4 gap-1.5">
          <ActionIcon className="size-4" aria-hidden />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

