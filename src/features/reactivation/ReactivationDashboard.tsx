"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/Card"
import { BarChart } from "@tremor/react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useLocale } from "@/contexts/locale-context"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { CardSkeleton } from "@/components/skeletons"
import { getReactivationStats } from "@/api/reactivation.api"
import type { ReactivationStats } from "@/api/reactivation.api"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

export function ReactivationDashboard() {
  const t = useAppTranslations()
  const { lang } = useLocale()
  const { currentClinic } = useUserClinic()
  const [stats, setStats] = useState<ReactivationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const data = await getReactivationStats(currentClinic.id)
        setStats(data)
      } catch (error) {
        console.error("Failed to load reactivation stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [currentClinic.id])

  if (isLoading || !stats) {
    return <CardSkeleton lines={6} borderless />
  }

  const dateLocale = lang === "ar" ? ar : undefined

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="insight-card p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t.insights.reactivationTotalCold}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalColdLeads.toLocaleString()}
          </p>
        </Card>
        <Card className="insight-card p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t.insights.reactivationPotentialRevenue}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.potentialRevenue > 0
              ? `EGP ${stats.potentialRevenue.toLocaleString()}`
              : t.insights.reactivationComingSoon}
          </p>
        </Card>
        <Card className="insight-card p-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t.insights.reactivationRecoveryRate}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.recoveryRate > 0
              ? `${stats.recoveryRate.toFixed(1)}%`
              : t.insights.reactivationComingSoon}
          </p>
        </Card>
      </div>

      {/* Lost Reason Distribution */}
      <Card className="insight-card p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t.insights.reactivationLostReason}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {t.insights.reactivationLostReasonDesc}
        </p>
        
        {stats.lostReasonDistribution.length > 0 ? (
          <BarChart
            data={stats.lostReasonDistribution.map((d) => ({
              name: d.reason,
              value: d.count,
            }))}
            index="name"
            categories={["value"]}
            colors={["blue"]}
            layout="horizontal"
            showLegend={false}
            showGridLines={true}
            barCategoryGap="40%"
            className="h-64 mt-2"
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
            {t.insights.reactivationNoLostReasonData}
          </p>
        )}
      </Card>

      {/* High-Value Cold Leads */}
      <Card className="insight-card p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t.insights.reactivationHighValue}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {t.insights.reactivationHighValueDesc}
        </p>

        {stats.highValueColdLeads.length > 0 ? (
          <div className="space-y-3">
            {stats.highValueColdLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 px-4 py-3 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                    {lead.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lead.lastInteraction
                      ? formatDistanceToNow(new Date(lead.lastInteraction), {
                          addSuffix: true,
                          locale: dateLocale,
                        })
                      : t.insights.reactivationNoInteraction}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  {lead.lostReason && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {lead.lostReason}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
            {t.insights.reactivationNoHighValueLeads}
          </p>
        )}
      </Card>
    </div>
  )
}
