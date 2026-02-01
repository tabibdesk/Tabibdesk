"use client"

import { useState } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { PageHeader } from "@/components/shared/PageHeader"
import { Select } from "@/components/Select"
import { IncomeTab } from "./tabs/IncomeTab"
import { ExpensesTab } from "./tabs/ExpensesTab"
import { DuesTab } from "./tabs/DuesTab"
import type { DateRangePreset } from "./components/AccountingToolbar"

type AccountingTab = "in" | "out" | "dues"

export function AccountingPage() {
  const t = useAppTranslations()
  const [activeTab, setActiveTab] = useState<AccountingTab>("in")
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("30days")

  return (
    <div className="page-content">
      <PageHeader
        title={t.accounting.title}
        actions={
          <Select
            id="date-range"
            value={dateRangePreset}
            onChange={(e) => setDateRangePreset(e.target.value as DateRangePreset)}
            className="w-32"
          >
            <option value="today">{t.accounting.today}</option>
            <option value="7days">{t.accounting.last7days}</option>
            <option value="30days">{t.accounting.last30days}</option>
            <option value="90days">{t.accounting.last90days}</option>
            <option value="thismonth">{t.accounting.thisMonth}</option>
            <option value="all">{t.accounting.allTime}</option>
          </Select>
        }
      />

      <div className="space-y-3">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex gap-4 overflow-x-auto pb-px sm:gap-8" aria-label="Accounting tabs">
            <button
              onClick={() => setActiveTab("in")}
              className={`shrink-0 ${
                activeTab === "in"
                  ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
              } whitespace-nowrap border-b-2 px-2 sm:px-1 py-4 text-sm font-medium`}
            >
              {t.accounting.in}
            </button>
            <button
              onClick={() => setActiveTab("out")}
              className={`shrink-0 ${
                activeTab === "out"
                  ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
              } whitespace-nowrap border-b-2 px-2 sm:px-1 py-4 text-sm font-medium`}
            >
              {t.accounting.out}
            </button>
            <button
              onClick={() => setActiveTab("dues")}
              className={`shrink-0 ${
                activeTab === "dues"
                  ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
              } whitespace-nowrap border-b-2 px-2 sm:px-1 py-4 text-sm font-medium`}
            >
              {t.accounting.dues}
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4 sm:mt-6">
        {activeTab === "in" && <IncomeTab dateRangePreset={dateRangePreset} />}
        {activeTab === "out" && <ExpensesTab dateRangePreset={dateRangePreset} />}
        {activeTab === "dues" && <DuesTab dateRangePreset={dateRangePreset} />}
      </div>
    </div>
  )
}
