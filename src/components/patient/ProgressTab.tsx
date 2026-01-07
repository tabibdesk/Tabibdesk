"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { WeightChart } from "./WeightChart"
import { RiLineChartLine } from "@remixicon/react"

interface WeightLog {
  id: string
  patient_id: string
  weight: number
  recorded_date: string
  notes: string | null
}

interface ProgressTabProps {
  weightLogs: WeightLog[]
}

export function ProgressTab({ weightLogs }: ProgressTabProps) {
  return (
    <div className="space-y-6">
      {weightLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RiLineChartLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">No progress data yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightChart weightLogs={weightLogs} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

