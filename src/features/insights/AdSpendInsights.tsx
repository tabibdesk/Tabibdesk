"use client"

import { useEffect, useState } from "react"
import { BarChart } from "@tremor/react"
import { Card } from "@/components/Card"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useDemo } from "@/contexts/demo-context"
import { getMarketingCostPerLead } from "@/api/expenses.api"
import { listPatients } from "@/features/patients/patients.api"
import { getTimeRangeDates } from "./insights.utils"
import type { TimeRange } from "./insights.types"
import { format } from "date-fns"

interface AdSpendInsightsProps {
  timeRange: TimeRange
}

function formatCampaignDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "MMM d, yyyy")
  } catch {
    return dateStr
  }
}

export function AdSpendInsights({ timeRange }: AdSpendInsightsProps) {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const { isDemoMode } = useDemo()
  const [data, setData] = useState<{
    totalAdSpend: number
    leadsCount: number
    costPerLead: number | null
    campaignDateRange?: { from: string; to: string }
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const clinicId = currentClinic?.id ?? "clinic-001"

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const { start, end } = getTimeRangeDates(timeRange)
        const fromStr = start.toISOString().split("T")[0]
        const endStr = end.toISOString().split("T")[0]

        // Demo mode: use mock marketing data for a polished demo
        if (isDemoMode) {
          setData({
            totalAdSpend: 4_500,
            leadsCount: 24,
            costPerLead: 187.5,
            campaignDateRange: { from: fromStr, to: endStr },
          })
          return
        }

        let leadsInRange: { created_at: string }[] = []
        const patientsRes = await listPatients({
          clinicId,
          page: 1,
          pageSize: 10000,
          firstVisitFrom: fromStr,
          firstVisitTo: endStr,
        })
        leadsInRange = (patientsRes.patients || [])
          .filter((p) => p.first_visit_at)
          .map((p) => ({ created_at: p.first_visit_at! }))

        const result = await getMarketingCostPerLead({
          clinicId,
          from: fromStr,
          to: endStr,
          leadsInRange,
        })

        setData({
          totalAdSpend: result.totalAdSpend,
          leadsCount: result.leadsCount,
          costPerLead: result.costPerLead,
          campaignDateRange: result.campaignDateRange,
        })
      } catch (error) {
        console.error("Failed to fetch ad spend insights:", error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [clinicId, timeRange, isDemoMode])

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="insight-card p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </Card>
        ))}
      </div>
    )
  }

  const campaignHint =
    data?.campaignDateRange
      ? (t.insights.adSpendCampaignHint as string)
          .replace("{from}", formatCampaignDate(data.campaignDateRange.from))
          .replace("{to}", formatCampaignDate(data.campaignDateRange.to))
      : null

  const summaryData = [
    { name: t.insights.adSpendTotal, value: data?.totalAdSpend ?? 0 },
    { name: t.insights.adSpendLeadsCount, value: data?.leadsCount ?? 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="insight-card p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t.insights.adSpendTotal}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            EGP {(data?.totalAdSpend ?? 0).toLocaleString()}
          </p>
          {campaignHint && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{campaignHint}</p>
          )}
        </Card>

        <Card className="insight-card p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t.insights.adSpendLeadsCount}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {(data?.leadsCount ?? 0).toLocaleString()}
          </p>
          {campaignHint && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{campaignHint}</p>
          )}
        </Card>

        <Card className="insight-card p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t.insights.adSpendCostPerLead}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data?.costPerLead != null
              ? `EGP ${data.costPerLead.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : t.insights.adSpendNoData}
          </p>
          {campaignHint && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{campaignHint}</p>
          )}
        </Card>
      </div>

      <Card className="insight-card p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {t.insights.marketingTab} {t.insights.summary}
        </h3>
        <BarChart
          data={[
            {
              name: t.insights.summary,
              [t.insights.adSpendTotal]: data?.totalAdSpend ?? 0,
            },
          ]}
          index="name"
          categories={[t.insights.adSpendTotal]}
          colors={["blue"]}
          valueFormatter={(v) => `EGP ${v.toLocaleString()}`}
          showLegend={false}
          showGridLines={true}
          layout="horizontal"
          barCategoryGap="40%"
          className="h-32 mt-2"
        />
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic">
          * {t.insights.performanceLeadsClinicTotal}
        </p>
      </Card>
    </div>
  )
}
