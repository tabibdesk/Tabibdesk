"use client"

import { useState, useEffect } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent } from "@/components/Card"
import { Button } from "@/components/Button"
import { Skeleton } from "@/components/Skeleton"
import { RiTaskLine } from "@remixicon/react"
import { useDebounce } from "@/lib/useDebounce"
import { EmptyState } from "@/components/EmptyState"
import { TasksToolbar } from "./TasksToolbar"
import { TasksCards } from "./TasksCards"
import { AddTaskDrawer } from "./AddTaskDrawer"
import { AssignModal } from "./TaskModals"
import {
  listTasks,
  createTask,
  updateTaskStatus,
  assignTask,
  snoozeTask,
  createFollowUpTask,
} from "./tasks.api"
import { updateLastActivity, markPatientCold } from "@/api/patients.api"
import { getReactivationRules } from "@/api/settings.api"
import type {
  TaskListItem,
  TaskSource,
  TaskStatus,
  CreateTaskPayload,
} from "./tasks.types"

interface TasksPageProps {
  role: "doctor" | "assistant" | "manager"
  currentUserId: string
  clinicId: string
  defaultSourceFilter?: TaskSource | "all"
  pageTitle?: string
}

export function TasksPage({
  role,
  currentUserId,
  clinicId,
  pageTitle,
}: TasksPageProps) {
  const t = useAppTranslations()
  const [tasks, setTasks] = useState<TaskListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 250)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [assignTaskData, setAssignTaskData] = useState<TaskListItem | null>(null)

  const pageSize = 20

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await listTasks({
        clinicId,
        status: "pending", // Main page only shows pending tasks now
        query: debouncedSearch,
        page,
        pageSize,
      })
      setTasks((prev) => (page === 1 ? response.tasks : [...prev, ...response.tasks]))
      setTotal(response.total)
      setHasMore(response.hasMore)
    } catch (error) {
      // Error handling would go here
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page, clinicId])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const handleCreateTask = async (payload: CreateTaskPayload) => {
    await createTask(payload)
    await fetchTasks()
  }

  const handleMarkDone = async (task: TaskListItem) => {
    await updateTaskStatus({ id: task.id, status: "done" })
    
    // Update patient last_activity_at if task is linked to a patient
    if (task.patientId) {
      try {
        await updateLastActivity(task.patientId)
      } catch (error) {
        console.warn("Failed to update patient last activity:", error)
      }
    }
    
    await fetchTasks()
  }

  const handleSnooze = async (task: TaskListItem, days: number) => {
    const snoozeDate = new Date()
    snoozeDate.setDate(snoozeDate.getDate() + days)
    await snoozeTask(task.id, snoozeDate.toISOString())
    await fetchTasks()
  }

  const handleNextAttempt = async (task: TaskListItem) => {
    if (!task.follow_up_kind || !task.entity_id || !task.patientId) {
      return // Not a follow-up task
    }

    try {
      const rules = await getReactivationRules(clinicId)
      const nextAttempt = (task.attempt || 1) + 1

      // Check if we've reached max attempts
      if (nextAttempt > rules.maxAttempts) {
        // Mark patient as Cold if enabled
        if (rules.markColdAfterMaxAttempts) {
          await markPatientCold(task.patientId)
        }
        // Mark current task as done
        await updateTaskStatus({ id: task.id, status: "done" })
        await fetchTasks()
        return
      }

      // Calculate due date for next attempt
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + rules.daysBetweenAttempts)

      // Create new follow-up task with incremented attempt
      await createFollowUpTask({
        title: "Follow-up",
        type: "follow_up",
        clinicId,
        patientId: task.patientId,
        appointmentId: task.entity_id,
        kind: task.follow_up_kind as "cancelled" | "no_show",
        dueDate: dueDate.toISOString(),
        dueAt: dueDate.toISOString(),
        attempt: nextAttempt,
        createdByUserId: currentUserId,
      })

      // Mark current task as done
      await updateTaskStatus({ id: task.id, status: "done" })
      await fetchTasks()
    } catch (error) {
      console.error("Failed to create next attempt:", error)
    }
  }

  const handleAssign = async (result: { assignedToUserId?: string; assignedToPatientId?: string }) => {
    if (!assignTaskData) return
    await assignTask({
      id: assignTaskData.id,
      assignedToUserId: result.assignedToUserId,
      assignedToPatientId: result.assignedToPatientId,
    })
    await fetchTasks()
  }

  const defaultAssignedTo = role === "assistant" ? currentUserId : undefined

  const filteredCount = searchQuery ? tasks.length : total

  return (
    <div className="page-content">
      <PageHeader
        title={pageTitle ?? t.nav.tasks}
      />

      <TasksToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewTask={() => setShowNewTaskModal(true)}
      />

      {loading && tasks.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={RiTaskLine}
          title={searchQuery ? t.tasks.noTasksMatch : t.tasks.noTasksYet}
          description={!searchQuery ? t.tasks.tasksDescription : undefined}
          actionLabel={!searchQuery ? t.tasks.addFirstTask : undefined}
          onAction={!searchQuery ? () => setShowNewTaskModal(true) : undefined}
        />
      ) : (
        <>
          <TasksCards
            tasks={tasks}
            onMarkDone={handleMarkDone}
            onAssign={(task) => setAssignTaskData(task)}
            onSnooze={handleSnooze}
            onNextAttempt={handleNextAttempt}
            role={role}
          />

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="min-w-[140px]"
              >
                {loading && page > 1 ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t.common.loadMore}
                  </span>
                ) : (
                  t.common.loadMore
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Drawers & Modals */}
      <AddTaskDrawer
        open={showNewTaskModal}
        onOpenChange={setShowNewTaskModal}
        onSubmit={handleCreateTask}
        defaultAssignedToUserId={defaultAssignedTo}
        currentUserId={currentUserId}
        clinicId={clinicId}
      />

      <AssignModal
        isOpen={!!assignTaskData}
        onClose={() => setAssignTaskData(null)}
        onSubmit={handleAssign}
        task={assignTaskData}
      />
    </div>
  )
}
