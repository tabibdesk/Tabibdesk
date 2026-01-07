"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { RiTaskLine, RiAddLine, RiCalendarLine, RiCheckLine, RiCloseLine } from "@remixicon/react"

interface Task {
  id: string
  patient_id: string
  title: string
  description: string | null
  type: string
  status: "pending" | "completed" | "ignored"
  due_date: string
  completed_at: string | null
  ignored_at: string | null
  created_at: string
  updated_at: string | null
}

interface TasksTabProps {
  tasks: Task[]
  onAddTask?: () => void
}

export function TasksTab({ tasks, onAddTask }: TasksTabProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "ignored">("all")

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    return task.status === filter
  })

  // Sort tasks: pending first (by due date), then completed/ignored (by date)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1
    if (a.status !== "pending" && b.status === "pending") return 1

    if (a.status === "pending" && b.status === "pending") {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }

    const aDate = a.completed_at || a.ignored_at || a.created_at
    const bDate = b.completed_at || b.ignored_at || b.created_at
    return new Date(bDate).getTime() - new Date(aDate).getTime()
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "ignored":
        return <Badge variant="neutral">Ignored</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      follow_up: "Follow-up",
      lab_test: "Lab Test",
      medication: "Medication",
      diet_review: "Diet Review",
      other: "Other",
    }
    return <Badge variant="default">{typeLabels[type] || type}</Badge>
  }

  const isOverdue = (task: Task) => {
    return task.status === "pending" && new Date(task.due_date) < new Date()
  }

  const pendingCount = tasks.filter((t) => t.status === "pending").length
  const completedCount = tasks.filter((t) => t.status === "completed").length

  return (
    <div className="space-y-6">
      {sortedTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RiTaskLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <Card
              key={task.id}
              className={
                isOverdue(task)
                  ? "border-l-4 border-l-red-600"
                  : task.status === "pending"
                  ? "border-l-4 border-l-yellow-600"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                          task.status === "completed"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : task.status === "ignored"
                            ? "bg-gray-100 dark:bg-gray-800"
                            : "bg-yellow-100 dark:bg-yellow-900/20"
                        }`}
                      >
                        <RiTaskLine
                          className={`size-5 ${
                            task.status === "completed"
                              ? "text-green-600 dark:text-green-400"
                              : task.status === "ignored"
                              ? "text-gray-600 dark:text-gray-400"
                              : "text-yellow-600 dark:text-yellow-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        {task.description && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {getTypeBadge(task.type)}
                          {getStatusBadge(task.status)}
                          {isOverdue(task) && <Badge variant="error">Overdue</Badge>}
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <RiCalendarLine className="size-4" />
                          <span>
                            Due: {new Date(task.due_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {task.status === "pending" && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <RiCheckLine className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <RiCloseLine className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
                  {tasks.length}
                </p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/10">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="mt-1 text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  {pendingCount}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/10">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-400">
                  {completedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

