"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import {
  RiUserLine,
  RiCalendarLine,
  RiCheckLine,
  RiTimeLine,
  RiArrowRightLine,
  RiStethoscopeLine,
  RiUserAddLine,
  RiAlertLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiTestTubeLine,
  RiQuestionLine,
} from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"
import { mockData, mockAppointments } from "@/data/mock/mock-data"

interface DashboardStats {
  patientstToday: number
  newPatientsToday: number
  upcomingAppointments: number
  completedToday: number
}

interface RecentPatient {
  id: string
  name: string
  lastVisit: string
  status: string
}

interface UpcomingAppointment {
  id: string
  patientName: string
  time: string
  type: string
}

interface UrgentAlert {
  id: string
  type: "question" | "lab"
  severity: "critical" | "warning" | "info"
  patient_id: string
  patient_name: string
  title: string
  message: string
  created_at: string
  is_reviewed: boolean
  lab_result_id?: string
  lab_test_name?: string
}

export default function DashboardPage() {
  const { isDemoMode } = useDemo()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    patientstToday: 0,
    newPatientsToday: 0,
    upcomingAppointments: 0,
    completedToday: 0,
  })
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([])
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>([])

  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode])

  const fetchDashboardData = async () => {
    setLoading(true)

    if (isDemoMode) {
      // Calculate today's date range
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Get appointments for today
      const todayAppointments = mockAppointments.filter((apt) => {
        const aptDate = new Date(apt.scheduled_at)
        return aptDate >= today && aptDate < tomorrow
      })

      // Get unique patient IDs who have appointments today
      const todayPatientIds = new Set(todayAppointments.map((apt) => apt.patient_id))
      const patientsToday = todayPatientIds.size

      // Count new patients (created within last 7 days) who have appointments today
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const newPatientsToday = mockData.patients.filter(
        (p) => todayPatientIds.has(p.id) && new Date(p.created_at) >= sevenDaysAgo
      ).length

      // Count upcoming appointments (not completed/cancelled/no-show)
      const upcomingCount = mockAppointments.filter(
        (apt) => 
          new Date(apt.scheduled_at) >= today &&
          !["completed", "cancelled", "no_show"].includes(apt.status)
      ).length

      // Count completed appointments today
      const completedToday = todayAppointments.filter(
        (apt) => apt.status === "completed"
      ).length

      setStats({
        patientstToday: patientsToday,
        newPatientsToday: newPatientsToday,
        upcomingAppointments: upcomingCount,
        completedToday: completedToday,
      })

      // Mock recent patients
      setRecentPatients(
        mockData.patients.slice(0, 3).map((p) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          lastVisit: new Date(p.created_at).toLocaleDateString(),
          status: "Active",
        })),
      )

      // Get today's upcoming appointments for display
      const todayUpcoming = todayAppointments
        .filter((apt) => !["completed", "cancelled", "no_show"].includes(apt.status))
        .slice(0, 3)
        .map((apt) => {
          const time = new Date(apt.scheduled_at)
          return {
            id: apt.id,
            patientName: apt.patient_name,
            time: time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
            type: apt.type,
          }
        })

      setUpcomingAppointments(todayUpcoming)

      // Get urgent alerts sorted by severity
      const alertsBySeverity = mockData.urgentAlerts
        .filter((alert) => !alert.is_reviewed)
        .sort((a, b) => {
          const severityOrder = { critical: 0, warning: 1, info: 2 }
          return severityOrder[a.severity] - severityOrder[b.severity]
        })
        .slice(0, 3)

      setUrgentAlerts(alertsBySeverity)

      setLoading(false)
      return
    }

    // TODO: Fetch from Supabase when integrated
    setLoading(false)
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    color,
  }: {
    title: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    description: string
    color: string
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{description}</p>
          </div>
          <div className={`rounded-full p-3 ${color}`}>
            <Icon className="size-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Patients Today"
            value={stats.patientstToday}
            icon={RiUserLine}
            description="Unique patients scheduled"
            color="bg-primary-600"
          />
          <StatCard
            title="New Patients Today"
            value={stats.newPatientsToday}
            icon={RiUserAddLine}
            description="New within last 7 days"
            color="bg-secondary-600"
          />
          <StatCard
            title="Upcoming"
            value={stats.upcomingAppointments}
            icon={RiTimeLine}
            description="Total upcoming appointments"
            color="bg-accent-600"
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon={RiCheckLine}
            description="Finished appointments"
            color="bg-green-600"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today&apos;s Schedule</CardTitle>
              <Link href="/appointments">
                <Button variant="ghost" className="text-sm">
                  View All
                  <RiArrowRightLine className="ml-1 size-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
                        <RiStethoscopeLine className="size-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-50">{apt.patientName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{apt.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">{apt.time}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                <RiCalendarLine className="mx-auto size-12 text-gray-400" />
                <p className="mt-2">No appointments scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Urgent Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Urgent Alerts</CardTitle>
              {urgentAlerts.length > 0 && <Badge variant="error">{urgentAlerts.length}</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
                ))}
              </div>
            ) : urgentAlerts.length > 0 ? (
              <div className="space-y-3">
                {urgentAlerts.map((alert) => {
                  const getSeverityIcon = () => {
                    switch (alert.severity) {
                      case "critical":
                        return <RiAlertLine className="size-5" />
                      case "warning":
                        return <RiErrorWarningLine className="size-5" />
                      case "info":
                        return <RiInformationLine className="size-5" />
                    }
                  }

                  const getSeverityColor = () => {
                    switch (alert.severity) {
                      case "critical":
                        return "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      case "warning":
                        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                      case "info":
                        return "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    }
                  }

                  const getTypeIcon = () => {
                    return alert.type === "lab" ? (
                      <RiTestTubeLine className="size-4" />
                    ) : (
                      <RiQuestionLine className="size-4" />
                    )
                  }

                  const getTimeAgo = (dateString: string) => {
                    const now = Date.now()
                    const then = new Date(dateString).getTime()
                    const diffMs = now - then
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                    const diffDays = Math.floor(diffHours / 24)

                    if (diffDays > 0) return `${diffDays}d ago`
                    if (diffHours > 0) return `${diffHours}h ago`
                    return "Just now"
                  }

                  return (
                    <Link key={alert.id} href={`/patients/${alert.patient_id}`}>
                      <div className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
                        <div className="flex items-start gap-3">
                          {/* Severity Icon */}
                          <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${getSeverityColor()}`}>
                            {getSeverityIcon()}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                {getTypeIcon()}
                              </div>
                              <p className="font-medium text-gray-900 dark:text-gray-50">
                                {alert.patient_name}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {getTimeAgo(alert.created_at)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-50">
                              {alert.title}
                            </p>
                            <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-400">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                <RiCheckLine className="mx-auto size-12 text-gray-400" />
                <p className="mt-2">No urgent alerts</p>
                <p className="mt-1 text-xs">All caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
