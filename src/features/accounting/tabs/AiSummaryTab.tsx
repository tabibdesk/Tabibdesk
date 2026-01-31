"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useToast } from "@/hooks/useToast"
import { getMonthlySummary, getTodayCashierRows, listPayments } from "@/api/accounting.api"
import { getAiAlerts, generateDailyClosingReport, type AiAlert, type DailyClosingReport } from "@/api/accountingAi.api"
import type { MonthlySummary } from "../accounting.types"
import { formatCurrency } from "../accounting.utils"
import { detectMissingPayments, detectPendingApprovals, generateMissingPaymentTaskTitle, generateMissingPaymentTaskDescription } from "../accounting.rules"
import { createTask } from "@/features/tasks/tasks.api"
import { SummarySkeleton } from "@/components/skeletons"
import {
  RiSparklingLine,
  RiArrowRightLine,
  RiAlertLine,
  RiCheckLine,
  RiFileTextLine,
  RiRobot2Line,
} from "@remixicon/react"

export function AiSummaryTab() {
  const { currentClinic, currentUser } = useUserClinic()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [alerts, setAlerts] = useState<AiAlert[]>([])
  const [dailyReport, setDailyReport] = useState<DailyClosingReport | null>(null)
  const [automationStats, setAutomationStats] = useState({
    missingPayments: 0,
    pendingApprovals: 0,
  })
  const [creatingTasks, setCreatingTasks] = useState(false)
  const [processingAlert, setProcessingAlert] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const currentMonth = new Date().toISOString().substring(0, 7)
      const today = new Date().toISOString().split("T")[0]
      
      // Load monthly summary
      const fetchedSummary = await getMonthlySummary({
        clinicId: currentClinic.id,
        month: currentMonth,
      })
      setSummary(fetchedSummary)

      // Load AI alerts
      const fetchedAlerts = await getAiAlerts({ clinicId: currentClinic.id })
      setAlerts(fetchedAlerts)

      // Load daily closing report
      const report = await generateDailyClosingReport({
        clinicId: currentClinic.id,
        date: today,
      })
      setDailyReport(report)

      // Load automation stats
      const cashierRows = await getTodayCashierRows({
        clinicId: currentClinic.id,
        date: today,
      })
      const payments = await listPayments({
        clinicId: currentClinic.id,
        page: 1,
        pageSize: 1000,
      })

      const missingPayments = detectMissingPayments(cashierRows)
      const pendingApprovals = detectPendingApprovals(payments.payments)

      setAutomationStats({
        missingPayments: missingPayments.length,
        pendingApprovals: pendingApprovals.length,
      })
    } catch (error) {
      console.error("Failed to load summary:", error)
      showToast("Failed to load summary", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentClinic.id])

  const handleCreateAutomationTasks = async () => {
    setCreatingTasks(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const cashierRows = await getTodayCashierRows({
        clinicId: currentClinic.id,
        date: today,
      })
      const missingPayments = detectMissingPayments(cashierRows)

      if (missingPayments.length === 0) {
        showToast("No missing payments to create tasks for", "info")
        return
      }

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      for (const item of missingPayments) {
        await createTask({
          title: generateMissingPaymentTaskTitle(item.patientName),
          description: generateMissingPaymentTaskDescription(item),
          type: "billing",
          priority: "high",
          dueDate: tomorrow.toISOString(),
          clinicId: currentClinic.id,
          patientId: item.patientId,
          assignedToUserId: currentUser.id,
          createdByUserId: currentUser.id,
        })
      }

      showToast(`Created ${missingPayments.length} billing tasks`, "success")
      await loadData()
    } catch (error) {
      console.error("Failed to create tasks:", error)
      showToast("Failed to create tasks", "error")
    } finally {
      setCreatingTasks(false)
    }
  }

  const handleAlertAction = async (alert: AiAlert) => {
    if (alert.primaryActionFn === "createMissingPaymentTasks") {
      setProcessingAlert(alert.id)
      await handleCreateAutomationTasks()
      setProcessingAlert(null)
    } else if (alert.primaryActionRoute) {
      window.location.href = alert.primaryActionRoute
    }
  }

  if (loading) {
    return <SummarySkeleton />
  }

  if (!summary) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No summary data available</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with AI Branding */}
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-blue-600">
          <RiRobot2Line className="size-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
            AI-Powered Summary & Insights
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monthly overview with automated detection and smart suggestions
          </p>
        </div>
      </div>

      {/* Monthly KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Revenue (Month)</p>
          <p className="mt-1 text-2xl font-semibold text-success-600 dark:text-success-400">
            {formatCurrency(summary.totalRevenue)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Expenses (Month)</p>
          <p className="mt-1 text-2xl font-semibold text-error-600 dark:text-error-400">
            {formatCurrency(summary.totalExpenses)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
            {formatCurrency(summary.netProfit)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">
            {formatCurrency(summary.totalOutstanding)}
          </p>
        </Card>
      </div>

      {/* Payment Methods Breakdown */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
          Payment Methods (Monthly)
        </h3>
        <div className="space-y-3">
          {Object.entries(summary.paymentMethodBreakdown).map(([method, amount]) => (
            <div key={method} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {method.replace("_", " ")}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-50">
                {formatCurrency(amount)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Smart Alerts */}
      {alerts.length > 0 && (
        <Card className="border-l-4 border-l-primary-500">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <RiSparklingLine className="size-5 text-primary-600 dark:text-primary-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                AI Smart Alerts
              </h3>
              <Badge color="amber" size="xs">{alerts.length}</Badge>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <RiAlertLine className="size-4 text-amber-600 dark:text-amber-400" />
                      <h4 className="font-medium text-gray-900 dark:text-gray-50">
                        {alert.title}
                      </h4>
                      <Badge color="gray" size="xs">{alert.count}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {alert.description}
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAlertAction(alert)}
                    disabled={processingAlert === alert.id}
                  >
                    {processingAlert === alert.id ? (
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <RiCheckLine className="size-4" />
                    )}
                    {alert.primaryActionLabel}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Automation Suggestions */}
      {(automationStats.missingPayments > 0 || automationStats.pendingApprovals > 0) && (
        <div className="rounded-lg border border-l-4 border-primary-200 border-l-primary-500 bg-gradient-to-r from-primary-50 to-blue-50 p-6 dark:border-primary-800 dark:from-primary-900/20 dark:to-blue-900/20">
          <div className="mb-4 flex items-center gap-2">
            <RiSparklingLine className="size-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              Automation Suggestions
            </h3>
          </div>
          <div className="space-y-3">
            {automationStats.missingPayments > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-white p-4 dark:bg-gray-900">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      Missing Payments
                    </p>
                    <Badge color="amber" size="xs">{automationStats.missingPayments}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Completed appointments without payment recorded
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCreateAutomationTasks}
                  disabled={creatingTasks}
                  className="inline-flex items-center gap-1"
                >
                  {creatingTasks ? (
                    "Creating..."
                  ) : (
                    <>
                      <span>Create Tasks</span>
                      <RiArrowRightLine className="size-3" />
                    </>
                  )}
                </Button>
              </div>
            )}
            {automationStats.pendingApprovals > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-white p-4 dark:bg-gray-900">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      Pending Approvals
                    </p>
                    <Badge color="amber" size="xs">{automationStats.pendingApprovals}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Payment proofs waiting for review
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    window.location.href = "/accounting?tab=today&filter=pending"
                  }}
                  className="inline-flex items-center gap-1"
                >
                  <span>Review</span>
                  <RiArrowRightLine className="size-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Summary Report */}
      {dailyReport && (
        <Card>
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <RiFileTextLine className="size-5 text-primary-600 dark:text-primary-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                Today&apos;s AI Summary
              </h3>
              <Badge color="gray" size="xs">{dailyReport.date}</Badge>
            </div>

            {/* AI Summary Text */}
            <div className="mb-4 rounded-lg bg-gradient-to-r from-primary-50 to-blue-50 p-4 dark:from-primary-900/20 dark:to-blue-900/20">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {dailyReport.summary}
              </p>
            </div>

            {/* Today's Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-xs text-gray-600 dark:text-gray-400">Today&apos;s Revenue</p>
                <p className="mt-1 text-lg font-semibold text-success-600 dark:text-success-400">
                  {formatCurrency(
                    Object.values(dailyReport.totalsByMethod).reduce((sum, val) => sum + val, 0)
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-xs text-gray-600 dark:text-gray-400">Unpaid Today</p>
                <p className="mt-1 text-lg font-semibold text-amber-600 dark:text-amber-400">
                  {dailyReport.unpaidCount} ({formatCurrency(dailyReport.unpaidTotal)})
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-xs text-gray-600 dark:text-gray-400">Pending Approvals</p>
                <p className="mt-1 text-lg font-semibold text-primary-600 dark:text-primary-400">
                  {dailyReport.pendingApprovals}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-xs text-gray-600 dark:text-gray-400">No-Shows</p>
                <p className="mt-1 text-lg font-semibold text-error-600 dark:text-error-400">
                  {dailyReport.noShowsCount}
                </p>
              </div>
            </div>

            {/* Payment Methods Today */}
            {Object.keys(dailyReport.totalsByMethod).length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Payment Methods Today
                </p>
                {Object.entries(dailyReport.totalsByMethod).map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {method.replace("_", " ")}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
