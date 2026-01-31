"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useToast } from "@/hooks/useToast"
import { Skeleton } from "@/components/Skeleton"
import { getAiAlerts, type AiAlert } from "@/api/accountingAi.api"
import { getTodayCashierRows } from "@/api/accounting.api"
import { detectMissingPayments, generateMissingPaymentTaskTitle, generateMissingPaymentTaskDescription } from "../accounting.rules"
import { createTask } from "@/features/tasks/tasks.api"
import {
  RiSparklingLine,
  RiAlertLine,
  RiCheckLine,
} from "@remixicon/react"

interface AiAlertsPanelProps {
  onAlertAction?: (alertId: string) => void
}

export function AiAlertsPanel({ onAlertAction }: AiAlertsPanelProps) {
  const { currentClinic, currentUser } = useUserClinic()
  const { showToast } = useToast()
  const [alerts, setAlerts] = useState<AiAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [processingAlert, setProcessingAlert] = useState<string | null>(null)

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const fetchedAlerts = await getAiAlerts({ clinicId: currentClinic.id })
      setAlerts(fetchedAlerts)
    } catch (error) {
      console.error("Failed to load AI alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [currentClinic.id])

  const handleCreateMissingPaymentTasks = async () => {
    setProcessingAlert("alert-missing-payments")
    try {
      const today = new Date().toISOString().split("T")[0]
      const cashierRows = await getTodayCashierRows({
        clinicId: currentClinic.id,
        date: today,
      })

      const missingPayments = detectMissingPayments(cashierRows)

      // Create a billing task for each missing payment
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

      showToast(
        `Created ${missingPayments.length} billing tasks`,
        "success"
      )
      await loadAlerts() // Refresh alerts
    } catch (error) {
      console.error("Failed to create tasks:", error)
      showToast("Failed to create billing tasks", "error")
    } finally {
      setProcessingAlert(null)
    }
  }

  const handleAlertAction = async (alert: AiAlert) => {
    if (alert.primaryActionFn === "createMissingPaymentTasks") {
      await handleCreateMissingPaymentTasks()
    } else if (alert.primaryActionRoute) {
      // Navigate to route
      window.location.href = alert.primaryActionRoute
    }

    if (onAlertAction) {
      onAlertAction(alert.id)
    }
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-4 shrink-0 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
      </Card>
    )
  }

  if (alerts.length === 0) {
    return null // Hide panel if no alerts
  }

  return (
    <Card className="border-l-4 border-l-primary-500">
      <div className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <RiSparklingLine className="size-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-50">
            AI Insights
          </h3>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <RiAlertLine className="size-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="font-medium text-gray-900 dark:text-gray-50">
                    {alert.title}
                  </h4>
                  <Badge color="gray" size="xs">
                    {alert.count}
                  </Badge>
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
  )
}
