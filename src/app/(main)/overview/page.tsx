"use client"
import { CategoryBarCard } from "@/components/ui/overview/DashboardCategoryBarCard"
import { ChartCard } from "@/components/ui/overview/DashboardChartCard"
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar"
import { ProgressBarCard } from "@/components/ui/overview/DashboardProgressBarCard"
import { overviews } from "@/data/overview-data"
import { OverviewData } from "@/data/schema"
import { cx } from "@/lib/utils"
import { subDays, toDate } from "date-fns"
import React from "react"
import { DateRange } from "react-day-picker"

export type PeriodValue = "previous-period" | "last-year" | "no-comparison"

const categories: {
  title: keyof OverviewData
  type: "currency" | "unit"
}[] = [
  {
    title: "Patient Visits",
    type: "unit",
  },
  {
    title: "Appointments Scheduled",
    type: "unit",
  },
  {
    title: "Appointments Completed",
    type: "unit",
  },
  {
    title: "Revenue (EGP)",
    type: "currency",
  },
  {
    title: "New Patients",
    type: "unit",
  },
  {
    title: "Follow-up Visits",
    type: "unit",
  },
]

export type KpiEntry = {
  title: string
  percentage: number
  current: number
  allowed: number
  unit?: string
}

const data: KpiEntry[] = [
  {
    title: "Morning slots",
    percentage: 78,
    current: 23,
    allowed: 30,
  },
  {
    title: "Evening slots",
    percentage: 90,
    current: 18,
    allowed: 20,
  },
  {
    title: "Weekend slots",
    percentage: 40,
    current: 4,
    allowed: 10,
  },
]

const data2: KpiEntry[] = [
  {
    title: "New patients",
    percentage: 65,
    current: 130,
    allowed: 200,
  },
  {
    title: "Follow-ups",
    percentage: 85,
    current: 340,
    allowed: 400,
  },
  {
    title: "Satisfaction",
    percentage: 92,
    current: 92,
    allowed: 100,
    unit: "%",
  },
]

export type KpiEntryExtended = Omit<
  KpiEntry,
  "current" | "allowed" | "unit"
> & {
  value: string
  color: string
}

const data3: KpiEntryExtended[] = [
  {
    title: "Consultations",
    percentage: 68,
    value: "12,500 EGP",
    color: "bg-primary-600 dark:bg-primary-500",
  },
  {
    title: "Procedures",
    percentage: 22,
    value: "4,100 EGP",
    color: "bg-secondary-600 dark:bg-secondary-500",
  },
  {
    title: "Products",
    percentage: 10,
    value: "1,900 EGP",
    color: "bg-gray-400 dark:bg-gray-600",
  },
]

const overviewsDates = overviews.map((item) => toDate(item.date).getTime())
const maxDate = toDate(Math.max(...overviewsDates))

export default function Overview() {
  const [selectedDates, setSelectedDates] = React.useState<
    DateRange | undefined
  >({
    from: subDays(maxDate, 30),
    to: maxDate,
  })

  return (
    <>
      <section aria-labelledby="current-month">
        <h1
          id="current-month"
          className="scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Current Month
        </h1>
        <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
          <ProgressBarCard
            title="Appointments"
            change="+5.2%"
            value="78%"
            valueDescription="slots booked"
            ctaDescription="Appointment capacity this month."
            ctaText="View calendar."
            ctaLink="/appointments"
            data={data}
          />
          <ProgressBarCard
            title="Patients"
            change="+8.1%"
            value="470"
            valueDescription="total visits"
            ctaDescription="Patient engagement metrics."
            ctaText="View patients."
            ctaLink="/patients"
            data={data2}
          />
          <CategoryBarCard
            title="Revenue"
            change="+3.4%"
            value="18,500 EGP"
            valueDescription="this month"
            subtitle="Revenue breakdown"
            ctaDescription="View detailed breakdown in"
            ctaText="insights."
            ctaLink="/insights"
            data={data3}
          />
        </div>
      </section>
      <section aria-labelledby="usage-overview">
        <h1
          id="usage-overview"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Overview
        </h1>
        <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 sm:pt-6 lg:top-0 lg:mx-0 lg:px-0 lg:pt-8 dark:border-gray-800 dark:bg-gray-950">
          <Filterbar
            maxDate={maxDate}
            minDate={new Date(2023, 0, 1)}
            selectedDates={selectedDates}
            onDatesChange={(dates) => setSelectedDates(dates)}
          />
        </div>
        <dl
          className={cx(
            "mt-10 grid grid-cols-1 gap-14 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {categories.map((category) => {
            return (
              <ChartCard
                key={category.title}
                title={category.title}
                type={category.type}
                selectedDates={selectedDates}
                selectedPeriod={"last-year"}
              />
            )
          })}
        </dl>
      </section>
    </>
  )
}

