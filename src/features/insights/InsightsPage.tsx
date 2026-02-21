"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Select } from "@/components/Select"
import { MetricCards } from "./MetricCards"
import { ReactivationDashboard } from "@/features/reactivation/ReactivationDashboard"
import { MoneyInsightsTab } from "./MoneyInsightsTab"
import { AdSpendInsights } from "./AdSpendInsights"
import { PerformanceInsightsTab } from "./PerformanceInsightsTab"
import type { TimeRange } from "./insights.types"
import type { DateRangePreset } from "@/features/accounting/components/AccountingToolbar"

type InsightsTabId = "visits" | "money" | "marketing" | "performance"

export function InsightsPage() {
  const t = useAppTranslations()
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  const [moneyDateRangePreset, setMoneyDateRangePreset] = useState<DateRangePreset>("30days")
  const [activeTab, setActiveTab] = useState<InsightsTabId>("visits")

  const showTimeRange = activeTab === "visits" || activeTab === "marketing" || activeTab === "performance"
  const showMoneyDateRange = activeTab === "money"

  return (
    <div className="page-content">
      <PageHeader
        title={t.insights.title}
        actions={
          showTimeRange ? (
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
          ) : showMoneyDateRange ? (
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
          ) : null
        }
      />

      <div className="!mt-0 mb-4 border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-4 overflow-x-auto pb-px sm:gap-8" aria-label="Insights tabs">
          <button
            onClick={() => setActiveTab("visits")}
            className={`shrink-0 border-b-2 px-1 py-3 sm:py-4 text-sm font-medium ${
              activeTab === "visits"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {t.insights.visitsTab}
          </button>
          <button
            onClick={() => setActiveTab("money")}
            className={`shrink-0 border-b-2 px-1 py-3 sm:py-4 text-sm font-medium ${
              activeTab === "money"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {t.insights.moneyTab}
          </button>
          <button
            onClick={() => setActiveTab("marketing")}
            className={`shrink-0 border-b-2 px-1 py-3 sm:py-4 text-sm font-medium ${
              activeTab === "marketing"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {t.insights.marketingTab}
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`shrink-0 border-b-2 px-1 py-3 sm:py-4 text-sm font-medium ${
              activeTab === "performance"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {t.insights.performanceTab}
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === "visits" && <MetricCards />}
        {activeTab === "money" && <MoneyInsightsTab dateRangePreset={moneyDateRangePreset} />}
        {activeTab === "marketing" && (
          <div className="space-y-8">
            <AdSpendInsights timeRange={timeRange} />
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                {t.insights.reactivationTab}
              </h3>
              <ReactivationDashboard />
            </div>
          </div>
        )}
        {activeTab === "performance" && <PerformanceInsightsTab timeRange={timeRange} />}
      </div>
    </div>
  )
}
