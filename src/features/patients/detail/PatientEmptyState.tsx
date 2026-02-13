import type { ComponentType, ReactNode } from "react"
import { EmptyState } from "@/components/EmptyState"

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>

interface PatientEmptyStateProps {
  icon: IconComponent
  title: ReactNode
  description?: ReactNode
  actionLabel?: ReactNode
  onAction?: () => void
}

export function PatientEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: PatientEmptyStateProps) {
  return (
    <EmptyState
      variant="card"
      icon={icon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  )
}

