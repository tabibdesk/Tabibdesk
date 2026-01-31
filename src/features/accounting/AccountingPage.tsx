"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Select } from "@/components/Select"
import { IncomeTab } from "./tabs/IncomeTab"
import { ExpensesTab } from "./tabs/ExpensesTab"
import { DuesTab } from "./tabs/DuesTab"
import type { DateRangePreset } from "./components/AccountingToolbar"

type AccountingTab = "in" | "out" | "dues"

export function AccountingPage() {
  const [activeTab, setActiveTab] = useState<AccountingTab>("in")
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("30days")

  return (
    <div className="page-content">
      {/* Page Header */}
      <PageHeader 
        title="Accounting"
        actions={
          <Select
            id="date-range"
            value={dateRangePreset}
            onChange={(e) => setDateRangePreset(e.target.value as DateRangePreset)}
            className="w-32"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="thismonth">This month</option>
            <option value="all">All time</option>
          </Select>
        }
      />

      {/* Tab Navigation - same structure as AppointmentsHeader for consistent spacing */}
      <div className="space-y-3">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("in")}
            className={`${
              activeTab === "in"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
            } whitespace-nowrap border-b-2 px-2 sm:px-1 py-4 text-sm font-medium`}
          >
            In
          </button>
          <button
            onClick={() => setActiveTab("out")}
            className={`${
              activeTab === "out"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
            } whitespace-nowrap border-b-2 px-2 sm:px-1 py-4 text-sm font-medium`}
          >
            Out
          </button>
          <button
            onClick={() => setActiveTab("dues")}
            className={`${
              activeTab === "dues"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
            } whitespace-nowrap border-b-2 px-2 sm:px-1 py-4 text-sm font-medium`}
          >
            Dues
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
