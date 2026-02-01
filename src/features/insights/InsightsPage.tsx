"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Select } from "@/components/Select"
import { MetricCards } from "./MetricCards"
import type { TimeRange } from "./insights.types"

export function InsightsPage() {
  const t = useAppTranslations()
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  return (
    <div className="page-content">
      <PageHeader
        title={t.insights.title}
        actions={
          <Select
            id="time-range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="w-32"
          >
            <option value="today">{t.insights.today}</option>
            <option value="7d">{t.insights.days7}</option>
            <option value="30d">{t.insights.days30}</option>
            <option value="custom">{t.insights.custom}</option>
          </Select>
        }
      />

      <div className="space-y-6">
        <MetricCards />
      </div>
    </div>
  )
}
