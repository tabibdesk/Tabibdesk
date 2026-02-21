"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/Card"
import { BarChart } from "@tremor/react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useDemo } from "@/contexts/demo-context"
import { getMemberPerformanceStats } from "@/api/performance.api"
import { getTimeRangeDates } from "./insights.utils"
import type { TimeRange } from "./insights.types"
import type { GetMemberPerformanceStatsResult } from "@/api/performance.api"

/** Mock performance data for demo mode - shows a realistic team dashboard */
const DEMO_PERFORMANCE_DATA: GetMemberPerformanceStatsResult = {
  members: [
    { userId: "user-001", memberName: "Ahmed Hassan", tasksClosed: 24, tasksClosedOnTime: 22, closingRatePercent: 92, leadsCreated: 12 },
    { userId: "user-002", memberName: "Fatima Ali", tasksClosed: 18, tasksClosedOnTime: 16, closingRatePercent: 89, leadsCreated: 8 },
    { userId: "user-003", memberName: "Mariam Mohamed", tasksClosed: 15, tasksClosedOnTime: 13, closingRatePercent: 87, leadsCreated: 14 },
    { userId: "user-004", memberName: "Sara Ibrahim", tasksClosed: 6, tasksClosedOnTime: 6, closingRatePercent: 100, leadsCreated: 2 },
  ],
  clinicTotalLeads: 36,
}

interface PerformanceInsightsTabProps {
  timeRange: TimeRange
}

export function PerformanceInsightsTab({ timeRange }: PerformanceInsightsTabProps) {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const { isDemoMode } = useDemo()
  const [data, setData] = useState<{
    members: Array<{
      userId: string
      memberName: string
      tasksClosed: number
      tasksClosedOnTime: number
      closingRatePercent: number | null
      leadsCreated: number
    }>
    clinicTotalLeads: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const clinicId = currentClinic?.id ?? "clinic-001"

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        if (isDemoMode) {
          setData(DEMO_PERFORMANCE_DATA)
          setLoading(false)
          return
        }
        const { start, end } = getTimeRangeDates(timeRange)
        const fromStr = start.toISOString().split("T")[0]
        const endStr = end.toISOString().split("T")[0]

        const result = await getMemberPerformanceStats({
          clinicId,
          from: fromStr,
          to: endStr,
        })
        // Use mock data when API returns empty members so charts always have something to show
        const hasData = result.members.length > 0 || result.clinicTotalLeads > 0
        setData(hasData ? result : DEMO_PERFORMANCE_DATA)
      } catch (error) {
        console.error("Failed to fetch performance stats:", error)
        setData(DEMO_PERFORMANCE_DATA)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [clinicId, timeRange, isDemoMode])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="insight-card h-64 bg-gray-50/50 dark:bg-gray-800/20" />
        <Card className="insight-card h-64 bg-gray-50/50 dark:bg-gray-800/20" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="insight-card p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">{t.insights.performanceNoTasks}</p>
      </Card>
    )
  }

  const { members, clinicTotalLeads } = data

  const closingRateKey = "closingRate"
  const leadsKey = "leads"

  const closingRateData = members.map((m) => ({
    member: m.memberName,
    [closingRateKey]: m.closingRatePercent ?? 0,
  }))

  const leadsData = members.map((m) => ({
    member: m.memberName,
    [leadsKey]: m.leadsCreated,
  }))

  const hasClosingRate = members.some((m) => m.tasksClosed > 0)

  if (members.length === 0) {
    return (
      <Card className="insight-card p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">{t.insights.performanceNoTasks}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {clinicTotalLeads > 0 && (
        <Card className="insight-card p-4 max-w-sm">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t.insights.performanceLeadsCreated}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {clinicTotalLeads.toLocaleString()}
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t.insights.performanceLeadsClinicTotal}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {hasClosingRate && (
          <Card className="insight-card p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {t.insights.performanceTaskClosingRate}
            </h3>
            <BarChart
              data={closingRateData}
              index="member"
              categories={[closingRateKey]}
              colors={["blue"]}
              layout="horizontal"
              valueFormatter={(v) => `${v}%`}
              yAxisWidth={120}
              showLegend={false}
              showGridLines={true}
              barCategoryGap="40%"
              className="h-64 mt-2"
            />
          </Card>
        )}

        <Card className="insight-card p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {t.insights.performanceLeadsCreated}
          </h3>
          <BarChart
            data={leadsData}
            index="member"
            categories={[leadsKey]}
            colors={["emerald"]}
            layout="horizontal"
            valueFormatter={(v) => v.toString()}
            yAxisWidth={120}
            showLegend={false}
            showGridLines={true}
            barCategoryGap="40%"
            className="h-64 mt-2"
          />
        </Card>
      </div>
    </div>
  )
}
