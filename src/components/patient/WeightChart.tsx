"use client"

import { LineChart } from "@/components/LineChart"

interface WeightLog {
  id: string
  patient_id: string
  weight: number
  recorded_date: string
  notes: string | null
}

interface WeightChartProps {
  weightLogs: WeightLog[]
}

export function WeightChart({ weightLogs }: WeightChartProps) {
  // Sort logs by date
  const sortedLogs = [...weightLogs].sort(
    (a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime()
  )

  // Format data for LineChart
  const chartData = sortedLogs.map((log) => ({
    date: new Date(log.recorded_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    Weight: log.weight,
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-600 dark:text-gray-400">
        <p>No weight data available</p>
      </div>
    )
  }

  return (
    <div>
      <LineChart
        data={chartData}
        index="date"
        categories={["Weight"]}
        colors={["primary"]}
        valueFormatter={(value) => `${value} kg`}
        className="h-64"
        showLegend={false}
        showGridLines={true}
        showXAxis={true}
        showYAxis={true}
      />

      {/* Latest Weight */}
      <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Current Weight</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {sortedLogs[sortedLogs.length - 1].weight} kg
          </p>
        </div>
        {sortedLogs.length > 1 && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Change</p>
            <p
              className={`text-2xl font-bold ${
                sortedLogs[sortedLogs.length - 1].weight - sortedLogs[0].weight < 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {sortedLogs[sortedLogs.length - 1].weight - sortedLogs[0].weight > 0 ? "+" : ""}
              {(sortedLogs[sortedLogs.length - 1].weight - sortedLogs[0].weight).toFixed(1)} kg
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

