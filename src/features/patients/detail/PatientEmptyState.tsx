import type { ComponentType, ReactNode } from "react"
import { EmptyState } from "@/components/EmptyState"

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>

interface PatientEmptyStateProps {
  icon: IconComponent
  title: ReactNode
  description?: ReactNode
  actionLabel?: ReactNode
  onAction?: () => void
  /** Use "simple" when already inside a card (e.g. Profile tab sections) to avoid card-in-card */
  variant?: "card" | "simple"
}

export function PatientEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "card",
}: PatientEmptyStateProps) {
  return (
    <EmptyState
      variant={variant}
      icon={icon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  )
}

