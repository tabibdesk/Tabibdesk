import type { ComponentType, ReactNode } from "react"
import { Button } from "@/components/Button"
import { Card, CardContent } from "@/components/Card"
import { cx } from "@/lib/utils"
import { RiAddLine } from "@remixicon/react"

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>

interface EmptyStateProps {
  icon?: IconComponent
  title: ReactNode
  description?: ReactNode
  actionLabel?: ReactNode
  onAction?: () => void
  variant?: "card" | "dashed" | "simple"
  /** "secondary" matches add patient button style (btn-search-action); "primary" is the default prominent style */
  actionVariant?: "primary" | "secondary"
  className?: string
  minHeight?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "card",
  actionVariant = "primary",
  className,
  minHeight = "300px",
}: EmptyStateProps) {
  const actionButton =
    actionLabel && onAction ? (
      actionVariant === "secondary" ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 btn-search-action rtl:flex-row-reverse"
        >
          <RiAddLine className="size-4 shrink-0" aria-hidden />
          {actionLabel}
        </button>
      ) : (
        <Button
          variant="primary"
          size="default"
          onClick={onAction}
          className="mt-6 gap-2 px-6 rounded-full shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 rtl:flex-row-reverse font-semibold text-xs"
        >
          <RiAddLine className="size-4 shrink-0" aria-hidden />
          {actionLabel}
        </Button>
      )
    ) : null

  const content = (
    <div className="flex flex-col items-center justify-center text-center w-full px-4 py-6">
      {Icon && (
        <div className="relative mb-5">
          <div className="absolute inset-0 scale-150 blur-2xl opacity-20 dark:opacity-10 bg-primary-500 rounded-full" />
          <div className="relative flex items-center justify-center">
            <Icon className="size-8 text-primary-600 dark:text-primary-400 shrink-0" aria-hidden />
          </div>
        </div>
      )}
      <h3 className={cx("text-base font-bold text-gray-900 dark:text-gray-50 tracking-tight leading-tight")}>
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed font-medium">
          {description}
        </p>
      )}
      {actionButton}
    </div>
  )

  if (variant === "card") {
    return (
      <Card className={cx("overflow-hidden border-none shadow-card hover:shadow-xl transition-shadow duration-500", className)}>
        <CardContent className="py-10 flex items-center justify-center bg-gradient-to-b from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-950/50" style={{ minHeight }}>
          {content}
        </CardContent>
      </Card>
    )
  }

  if (variant === "dashed") {
    return (
      <div 
        className={cx(
          "flex flex-col items-center justify-center py-10 px-4 text-center rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/20 hover:bg-gray-50/60 dark:hover:bg-gray-900/30 transition-all duration-300",
          className
        )}
        style={{ minHeight }}
      >
        {content}
      </div>
    )
  }

  return (
    <div 
      className={cx("py-8 flex items-center justify-center", className)}
      style={{ minHeight: variant === "simple" ? "auto" : minHeight }}
    >
      {content}
    </div>
  )
}
