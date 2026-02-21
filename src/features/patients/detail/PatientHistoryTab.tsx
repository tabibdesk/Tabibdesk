"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/Badge"
import { Card, CardContent, CardHeader } from "@/components/Card"
import { Select } from "@/components/Select"
import { getBadgeColor } from "@/lib/badgeColors"
import { RiCalendarLine, RiTimeLine, RiHistoryLine, RiCheckLine } from "@remixicon/react"
import { format } from "date-fns"
import { cx } from "@/lib/utils"
import { ListSkeleton } from "@/components/skeletons"
import { PatientEmptyState } from "@/features/patients/detail/PatientEmptyState"
import { getStatusBadgeVariant, getStatusLabel } from "@/features/appointments/appointments.utils"
import { useAppTranslations } from "@/lib/useAppTranslations"

interface Appointment {
  id: string
  patient_id: string
  patient_name: string
  scheduled_at: string
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show"
  type: string
  notes: string | null
  created_at: string
  online_call_link?: string
}

interface PatientHistoryTabProps {
  clinicId: string
  patientId: string
  appointments: Appointment[]
  /** Completed tasks (TaskListItem or legacy shape with completed_at/created_by_name) */
  tasks?: Array<{
    id: string
    status: string
    createdAt: string
    title?: string
    description?: string
    completed_at?: string | null
    created_by_name?: string
    createdByName?: string
  }>
}

type HistoryItem = {
  id: string
  type: "activity" | "appointment" | "task"
  date: Date
  data: any
}

type FilterType = "all" | "appointments" | "tasks" | "activity"

export function PatientHistoryTab({ clinicId, patientId, appointments, tasks = [] }: PatientHistoryTabProps) {
  const t = useAppTranslations()
  const [activityEvents, setActivityEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("all")

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const { listActivities } = await import("@/api/activity.api")
        const response = await listActivities({
          clinicId,
          entityId: patientId,
          entityType: "patient",
          pageSize: 50,
        })
        setActivityEvents(response.events)
      } catch (error) {
        console.error("Failed to fetch activity feed:", error)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [clinicId, patientId])

  // Combine and sort all history items
  const historyItems = useMemo(() => {
    const items: HistoryItem[] = []

    // Add activity events
    activityEvents.forEach((event) => {
      items.push({
        id: event.id,
        type: "activity",
        date: new Date(event.createdAt),
        data: event,
      })
    })

    // Add appointments (only past/completed ones for history)
    appointments
      .filter((apt) => {
        const aptDate = new Date(apt.scheduled_at)
        const now = new Date()
        // Include past appointments or completed ones
        return aptDate < now || apt.status === "completed" || apt.status === "cancelled" || apt.status === "no_show"
      })
      .forEach((apt) => {
        items.push({
          id: apt.id,
          type: "appointment",
          date: new Date(apt.scheduled_at),
          data: apt,
        })
      })

    // Add completed tasks (TaskListItem: status "done", date from createdAt)
    tasks
      .filter((task) => task.status === "completed" || task.status === "done")
      .forEach((task) => {
        const completedAt =
          typeof task.completed_at === "string" ? task.completed_at : task.createdAt
        items.push({
          id: task.id,
          type: "task",
          date: new Date(completedAt),
          data: task,
        })
      })

    // Sort by date (newest first)
    return items.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [activityEvents, appointments, tasks])

  // Filter history items based on selected filter
  const filteredItems = useMemo(() => {
    if (filter === "all") return historyItems
    if (filter === "appointments") return historyItems.filter(item => item.type === "appointment")
    if (filter === "tasks") return historyItems.filter(item => item.type === "task")
    if (filter === "activity") return historyItems.filter(item => item.type === "activity")
    return historyItems
  }, [historyItems, filter])

  // Count items by type
  const counts = useMemo(() => {
    return {
      all: historyItems.length,
      appointments: historyItems.filter(item => item.type === "appointment").length,
      tasks: historyItems.filter(item => item.type === "task").length,
      activity: historyItems.filter(item => item.type === "activity").length,
    }
  }, [historyItems])

  if (loading && historyItems.length === 0) {
    return <ListSkeleton rows={3} showHeader />
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 px-4 py-3 min-h-12 flex flex-row items-center justify-between rtl:flex-row-reverse">
        <div className="flex items-center gap-2">
          <RiHistoryLine className="size-4 text-primary-500/70 dark:text-primary-400/70 shrink-0" />
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {t.patients.history}
          </h3>
        </div>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="w-auto min-w-[180px]"
        >
          <option value="all">All ({counts.all})</option>
          <option value="appointments">Appointments ({counts.appointments})</option>
          <option value="tasks">Tasks ({counts.tasks})</option>
          <option value="activity">Activity ({counts.activity})</option>
        </Select>
      </CardHeader>
      <CardContent className="p-4">
      {filteredItems.length === 0 ? (
        <PatientEmptyState
          icon={RiHistoryLine}
          title={t.profile.noHistoryYet}
          variant="simple"
        />
      ) : (
        <div className="relative space-y-4">
          {/* Vertical line */}
          <div className="absolute left-2.5 top-0 h-full w-px bg-gray-100 dark:bg-gray-800" />

          {filteredItems.map((item) => (
            <div key={item.id} className="relative pl-8">
              {/* Dot */}
              <div className="absolute left-0 top-1.5 size-5 rounded-full bg-white ring-2 ring-gray-100 dark:bg-gray-950 dark:ring-gray-800 flex items-center justify-center">
                <div
                  className={cx(
                    "size-2 rounded-full",
                    item.type === "appointment"
                      ? item.data.status === "completed"
                        ? "bg-green-500"
                        : item.data.status === "cancelled" || item.data.status === "no_show"
                        ? "bg-red-500"
                        : "bg-blue-500"
                      : item.type === "task"
                      ? "bg-green-500"
                      : item.data.action === "create"
                      ? "bg-green-500"
                      : item.data.action === "delete"
                      ? "bg-red-500"
                      : "bg-primary-500"
                  )}
                />
              </div>

              <div className="space-y-1">
                {item.type === "appointment" ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <RiCalendarLine className="size-4 text-gray-400 shrink-0" />
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Appointment - {item.data.type}
                          </p>
                          <Badge color={getBadgeColor(getStatusBadgeVariant(item.data.status))} size="xs">
                            {getStatusLabel(item.data.status)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {format(item.date, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        {item.data.notes && (
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{item.data.notes}</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : item.type === "task" ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <RiCheckLine className="size-4 text-green-600 dark:text-green-400 shrink-0" />
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Task Completed - {item.data.title}
                          </p>
                        </div>
                        {item.data.description && (
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{item.data.description}</p>
                        )}
                        {(item.data.createdByName ?? item.data.created_by_name) && (
                          <p className="mt-1 text-xs text-gray-500">
                            Completed by: {item.data.createdByName ?? item.data.created_by_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.data.actorName}</span>
                      {" "}{item.data.message}
                    </p>
                  </>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <RiTimeLine className="size-3" />
                  {format(item.date, "MMM d, h:mm a")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </CardContent>
    </Card>
  )
}
