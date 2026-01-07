"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import {
  RiUserLine,
  RiCalendarLine,
  RiLineChartLine,
  RiPieChartLine,
  RiMoneyDollarCircleLine,
  RiTimeLine,
} from "@remixicon/react"

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month")

  return (
    <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Insights & Reports</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Track your clinic&apos;s performance and key metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "week" ? "primary" : "secondary"}
            onClick={() => setTimeRange("week")}
            className="text-sm"
          >
            Week
          </Button>
          <Button
            variant={timeRange === "month" ? "primary" : "secondary"}
            onClick={() => setTimeRange("month")}
            className="text-sm"
          >
            Month
          </Button>
          <Button
            variant={timeRange === "quarter" ? "primary" : "secondary"}
            onClick={() => setTimeRange("quarter")}
            className="text-sm"
          >
            Quarter
          </Button>
          <Button
            variant={timeRange === "year" ? "primary" : "secondary"}
            onClick={() => setTimeRange("year")}
            className="text-sm"
          >
            Year
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-50">142</p>
                <p className="mt-1 flex items-center text-xs text-green-600">
                  <span className="mr-1">↑</span> +12% from last {timeRange}
                </p>
              </div>
              <div className="rounded-full bg-primary-100 p-3 dark:bg-primary-900/20">
                <RiUserLine className="size-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Appointments</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-50">328</p>
                <p className="mt-1 flex items-center text-xs text-green-600">
                  <span className="mr-1">↑</span> +8% from last {timeRange}
                </p>
              </div>
              <div className="rounded-full bg-secondary-100 p-3 dark:bg-secondary-900/20">
                <RiCalendarLine className="size-6 text-secondary-600 dark:text-secondary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-50">EGP 45.2K</p>
                <p className="mt-1 flex items-center text-xs text-green-600">
                  <span className="mr-1">↑</span> +15% from last {timeRange}
                </p>
              </div>
              <div className="rounded-full bg-accent-100 p-3 dark:bg-accent-900/20">
                <RiMoneyDollarCircleLine className="size-6 text-accent-600 dark:text-accent-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Wait Time</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-50">18m</p>
                <p className="mt-1 flex items-center text-xs text-red-600">
                  <span className="mr-1">↓</span> -5m from last {timeRange}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <RiTimeLine className="size-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Growth</CardTitle>
            <CardDescription>New patient registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-center text-gray-600 dark:text-gray-400">
                <RiLineChartLine className="mx-auto size-12" />
                <p className="mt-2 text-sm">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
            <CardDescription>Distribution of appointment outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-center text-gray-600 dark:text-gray-400">
                <RiPieChartLine className="mx-auto size-12" />
                <p className="mt-2 text-sm">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Key performance indicators for your clinic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Appointment Completion Rate
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">87%</p>
                </div>
                <Badge variant="success">Excellent</Badge>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-full w-[87%] bg-green-500"></div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Patient Satisfaction</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">4.6/5</p>
                </div>
                <Badge variant="success">High</Badge>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-full w-[92%] bg-green-500"></div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No-Show Rate</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">8%</p>
                </div>
                <Badge variant="warning">Fair</Badge>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-full w-[8%] bg-yellow-500"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
          <CardDescription>Actionable insights for your clinic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <RiCalendarLine className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-50">Peak Appointment Hours</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Most appointments are scheduled between 10 AM - 12 PM. Consider adding more slots during
                  these hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <RiUserLine className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-50">Patient Retention</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  65% of patients return within 3 months. Consider implementing a follow-up reminder system.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <RiTimeLine className="size-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-50">Wait Time Trend</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Average wait time has decreased by 5 minutes. Great progress! Keep it up.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
