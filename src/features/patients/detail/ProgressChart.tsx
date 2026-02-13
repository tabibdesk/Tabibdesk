"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { LineChart } from "@/components/LineChart"
import { EmptyState } from "@/components/EmptyState"
import { RiLineChartLine } from "@remixicon/react"
import type { ProgressMetric } from "@/types/progress"

interface ProgressChartProps {
  metric: ProgressMetric
}

export function ProgressChart({ metric }: ProgressChartProps) {
  const t = useAppTranslations()
  const { label, unit, points } = metric
  const sorted = [...points].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const chartData = sorted.map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    [label]: p.value,
  }))

  const formatValue = (value: number) => (unit ? `${value} ${unit}` : String(value))

  if (chartData.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon={RiLineChartLine}
        title={t.profile.noProgressData}
        description={t.profile.recordProgressDesc}
      />
    )
  }

  return (
    <div>
      <LineChart
        data={chartData}
        index="date"
        categories={[label]}
        colors={["blue"]}
        valueFormatter={formatValue}
        className="h-64"
        showLegend={false}
        showGridLines={true}
        showXAxis={true}
        showYAxis={true}
      />

      <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Current</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {formatValue(sorted[sorted.length - 1].value)}
          </p>
        </div>
        {sorted.length > 1 && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Change</p>
            <p
              className={`text-2xl font-bold ${
                sorted[sorted.length - 1].value - sorted[0].value < 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {sorted[sorted.length - 1].value - sorted[0].value > 0 ? "+" : ""}
              {(sorted[sorted.length - 1].value - sorted[0].value).toFixed(1)} {unit}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
