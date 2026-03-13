"use client"

import { cx } from "@/lib/utils"

export interface FunnelStyleChartItem {
  label: string
  value: number
}

interface FunnelStyleChartProps {
  data: FunnelStyleChartItem[]
  valueFormatter?: (value: number) => string
  /** Tailwind class for the bar fill, e.g. "bg-primary-600" */
  barColor?: string
  className?: string
}

/**
 * Renders data as funnel-style rows (label | value + progress bar).
 * Matches the visual style of CampaignsFunnel / Conversion Funnel.
 */
export function FunnelStyleChart({
  data,
  valueFormatter = (v) => v.toString(),
  barColor = "bg-primary-600",
  className,
}: FunnelStyleChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className={cx("space-y-4", className)}>
      {data.map((item) => (
        <div key={item.label} className="relative">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-end">
              {valueFormatter(item.value)}
            </span>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            <div
              className={cx("h-full rounded-full transition-all duration-500", barColor)}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
