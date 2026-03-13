"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Select } from "@/components/Select"
import { MetricCards } from "./MetricCards"
import { ReactivationDashboard } from "@/features/reactivation/ReactivationDashboard"
import { MoneyInsightsTab } from "./MoneyInsightsTab"
import { MarketingInsightsTab } from "./MarketingInsightsTab"
import { PerformanceInsightsTab } from "./PerformanceInsightsTab"
import type { TimeRange } from "./insights.types"
import type { DateRangePreset } from "@/features/accounting/components/AccountingToolbar"

type InsightsTabId = "visits" | "money" | "marketing" | "reactivation" | "performance"

const TAB_ACTIVE = "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
const TAB_INACTIVE = "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"

export function InsightsPage() {
  const t = useAppTranslations()
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  const [moneyDateRangePreset, setMoneyDateRangePreset] = useState<DateRangePreset>("30days")
  const [activeTab, setActiveTab] = useState<InsightsTabId>("visits")

  const showMoneyDateRange = activeTab === "money"

  const tabs: { id: InsightsTabId; label: string }[] = [
    { id: "visits", label: t.insights.visitsTab },
    { id: "money", label: t.insights.moneyTab },
    { id: "marketing", label: t.insights.marketingTab },
    { id: "reactivation", label: t.insights.reactivationTab },
    { id: "performance", label: t.insights.performanceTab },
  ]

  return (
    <div className="page-content flex flex-col min-h-0 pb-12">
      <PageHeader
        title={t.insights.title}
        actions={
          showMoneyDateRange ? (
            <Select
              id="money-date-range"
              value={moneyDateRangePreset}
              onChange={(e) => setMoneyDateRangePreset(e.target.value as DateRangePreset)}
              className="w-32"
            >
              <option value="today">{t.accounting.today}</option>
              <option value="7days">{t.accounting.last7days}</option>
              <option value="30days">{t.accounting.last30days}</option>
              <option value="90days">{t.accounting.last90days}</option>
              <option value="thismonth">{t.accounting.thisMonth}</option>
              <option value="all">{t.accounting.allTime}</option>
            </Select>
          ) : (
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
          )
        }
      />

      <div className="mt-6 shrink-0 border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-4 overflow-x-auto pb-px sm:gap-8" aria-label="Insights tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 px-1 py-3 sm:py-4 text-sm font-medium ${
                activeTab === tab.id ? TAB_ACTIVE : TAB_INACTIVE
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[55vh] flex-1 space-y-6 pb-4">
        {activeTab === "visits" && <MetricCards />}
        {activeTab === "money" && <MoneyInsightsTab dateRangePreset={moneyDateRangePreset} />}
        {activeTab === "marketing" && <MarketingInsightsTab />}
        {activeTab === "reactivation" && <ReactivationDashboard />}
        {activeTab === "performance" && <PerformanceInsightsTab timeRange={timeRange} />}
      </div>
    </div>
  )
}
