"use client"

import { useState, useEffect } from "react"
import { mockAppointments } from "@/data/mock/mock-data"
import { listPayments } from "@/api/payments.api"
import type { DashboardAppointment } from "./dashboard.types"
import type { QueueStatus } from "./dashboard.types"

export function useDashboardData(
  isDemoMode: boolean,
  role: string,
  currentClinic: { id: string } | null
) {
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([])
  const [paidAppointments, setPaidAppointments] = useState<Set<string>>(new Set())

  const loadPaymentStatus = async () => {
    if (!currentClinic) return
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split("T")[0]
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split("T")[0]

      const payments = await listPayments({
        clinicId: currentClinic.id,
        from: todayStr,
        to: tomorrowStr,
        page: 1,
        pageSize: 1000,
      })

      const paidSet = new Set<string>()
      payments.payments.forEach((payment) => {
        if (payment.appointmentId) {
          paidSet.add(payment.appointmentId)
        }
      })
      setPaidAppointments(paidSet)
    } catch (error) {
      console.error("Failed to load payment status:", error)
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)

    if (isDemoMode) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayAppts = mockAppointments.filter((apt) => {
        const aptDate = new Date(apt.scheduled_at)
        return aptDate >= today && aptDate < tomorrow
      })

      if (role === "doctor") {
        const queueStatuses: QueueStatus[] = ["in_progress", "next", "waiting", "online_now"]
        const queueData = todayAppts
          .filter((apt) => !["completed", "cancelled", "no_show"].includes(apt.status))
          .map((apt, index) => {
            const time = new Date(apt.scheduled_at)
            return {
              id: apt.id,
              patient_id: apt.patient_id,
              patientName: apt.patient_name,
              time: time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
              scheduled_at: apt.scheduled_at,
              type: apt.type,
              status: apt.status,
              queueStatus: queueStatuses[index % queueStatuses.length] as QueueStatus,
              online_call_link: apt.online_call_link,
            }
          })
          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        setAppointments(queueData)
      } else {
        const assistantAppts = todayAppts
          .filter((apt) => !["completed", "cancelled"].includes(apt.status))
          .map((apt, index) => {
            const time = new Date(apt.scheduled_at)
            let queueStatus: QueueStatus | undefined = undefined
            if (apt.status === "no_show") {
              queueStatus = "no_show"
            } else if (index === 0) {
              queueStatus = "now"
            } else if (index === 1) {
              queueStatus = "next"
            } else {
              queueStatus = "waiting"
            }
            return {
              id: apt.id,
              patient_id: apt.patient_id,
              patientName: apt.patient_name,
              time: time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
              scheduled_at: apt.scheduled_at,
              type: apt.type,
              status: apt.status,
              queueStatus,
              online_call_link: apt.online_call_link,
            }
          })
          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        setAppointments(assistantAppts)
      }
      setLoading(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
    setAppointments([])
    setLoading(false)
  }

  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, role])

  useEffect(() => {
    if (isDemoMode && appointments.length > 0 && currentClinic) {
      loadPaymentStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, isDemoMode, currentClinic])

  return {
    loading,
    appointments,
    setAppointments,
    paidAppointments,
    setPaidAppointments,
    fetchDashboardData,
    loadPaymentStatus,
  }
}
