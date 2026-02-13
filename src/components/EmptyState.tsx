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
  className,
  minHeight = "300px",
}: EmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center w-full px-6">
      {Icon && (
        <div className="relative mb-6">
          <div className="absolute inset-0 scale-150 blur-2xl opacity-20 dark:opacity-10 bg-primary-500 rounded-full" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:scale-105 duration-300">
            <Icon className="size-10 text-gray-400 dark:text-gray-500 shrink-0" aria-hidden />
          </div>
        </div>
      )}
      <h3 className={cx("text-base font-bold text-gray-900 dark:text-gray-50 leading-tight")}>
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="default" onClick={onAction} className="mt-8 gap-2 px-6 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 rtl:flex-row-reverse font-semibold">
          <RiAddLine className="size-5 shrink-0" aria-hidden />
          {actionLabel}
        </Button>
      )}
    </div>
  )

  if (variant === "card") {
    return (
      <Card className={cx("overflow-hidden", className)}>
        <CardContent className="py-12 flex items-center justify-center" style={{ minHeight }}>
          {content}
        </CardContent>
      </Card>
    )
  }

  if (variant === "dashed") {
    return (
      <div 
        className={cx(
          "flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30",
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
      className={cx("py-12 flex items-center justify-center", className)}
      style={{ minHeight: variant === "simple" ? "auto" : minHeight }}
    >
      {content}
    </div>
  )
}
