"use client"

import { Card, CardContent } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { mockData, DEMO_CLINIC_ID } from "@/data/mock/mock-data"
import { calculatePercentageChange } from "./insights.utils"
import { AreaChart } from "@/components/AreaChart"
import { useEffect, useState } from "react"
import { listPayments } from "@/api/payments.api"

export function MetricCards() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const sixtyDaysAgo = new Date(thirtyDaysAgo)
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 30)

  const [revenueData, setRevenueData] = useState<{ current: number; previous: number }>({ current: 0, previous: 0 })

  // Fetch revenue data
  useEffect(() => {
    async function fetchRevenue() {
      try {
        const [currentPayments, previousPayments] = await Promise.all([
          listPayments({
            clinicId: DEMO_CLINIC_ID,
            from: thirtyDaysAgo.toISOString(),
            to: now.toISOString(),
            pageSize: 1000,
          }),
          listPayments({
            clinicId: DEMO_CLINIC_ID,
            from: sixtyDaysAgo.toISOString(),
            to: thirtyDaysAgo.toISOString(),
            pageSize: 1000,
          }),
        ])

        const currentRevenue = currentPayments.payments.reduce((sum, p) => sum + p.amount, 0)
        const previousRevenue = previousPayments.payments.reduce((sum, p) => sum + p.amount, 0)

        setRevenueData({ current: currentRevenue, previous: previousRevenue })
      } catch (error) {
        console.error("Failed to fetch revenue:", error)
      }
    }
    fetchRevenue()
  }, [])

  // Data calculations
  const currentAppointments = mockData.appointments.filter(
    (apt) => new Date(apt.scheduled_at) >= thirtyDaysAgo && new Date(apt.scheduled_at) <= now
  )

  const previousAppointments = mockData.appointments.filter(
    (apt) => new Date(apt.scheduled_at) >= sixtyDaysAgo && new Date(apt.scheduled_at) < thirtyDaysAgo
  )

  // 1. Slot Fill Rate (Utilization) - % of available slots that got booked
  // Assume 8 slots per day, 30 days = 240 available slots
  const availableSlots = 240
  const bookedSlots = currentAppointments.filter((apt) =>
    ["scheduled", "confirmed", "completed", "cancelled", "no_show"].includes(apt.status)
  ).length
  const slotFillRate = availableSlots > 0 ? (bookedSlots / availableSlots) * 100 : 0

  const previousBookedSlots = previousAppointments.filter((apt) =>
    ["scheduled", "confirmed", "completed", "cancelled", "no_show"].includes(apt.status)
  ).length
  const previousSlotFillRate = availableSlots > 0 ? (previousBookedSlots / availableSlots) * 100 : 0
  const slotFillRateChange = calculatePercentageChange(slotFillRate, previousSlotFillRate)

  // 2. No-Show Rate - % of booked patients who didn't attend
  const bookedAppointments = currentAppointments.filter((apt) =>
    ["scheduled", "confirmed", "completed", "cancelled", "no_show"].includes(apt.status)
  )
  const noShows = currentAppointments.filter((apt) => apt.status === "no_show").length
  const noShowRate = bookedAppointments.length > 0 ? (noShows / bookedAppointments.length) * 100 : 0

  const previousBookedAppointments = previousAppointments.filter((apt) =>
    ["scheduled", "confirmed", "completed", "cancelled", "no_show"].includes(apt.status)
  )
  const previousNoShows = previousAppointments.filter((apt) => apt.status === "no_show").length
  const previousNoShowRate = previousBookedAppointments.length > 0 ? (previousNoShows / previousBookedAppointments.length) * 100 : 0
  const noShowRateChange = calculatePercentageChange(noShowRate, previousNoShowRate)

  // 3. Cancellation Rate - last-minute cancellations (within 24 hours)
  const lastMinuteCancellations = currentAppointments.filter((apt) => {
    if (apt.status !== "cancelled") return false
    const scheduledDate = new Date(apt.scheduled_at)
    const cancelledDate = new Date(apt.created_at)
    const hoursDiff = (scheduledDate.getTime() - cancelledDate.getTime()) / (1000 * 60 * 60)
    return hoursDiff <= 24 && hoursDiff >= 0
  }).length
  const cancellationRate = bookedAppointments.length > 0 ? (lastMinuteCancellations / bookedAppointments.length) * 100 : 0

  const previousLastMinuteCancellations = previousAppointments.filter((apt) => {
    if (apt.status !== "cancelled") return false
    const scheduledDate = new Date(apt.scheduled_at)
    const cancelledDate = new Date(apt.created_at)
    const hoursDiff = (scheduledDate.getTime() - cancelledDate.getTime()) / (1000 * 60 * 60)
    return hoursDiff <= 24 && hoursDiff >= 0
  }).length
  const previousCancellationRate = previousBookedAppointments.length > 0 ? (previousLastMinuteCancellations / previousBookedAppointments.length) * 100 : 0
  const cancellationRateChange = calculatePercentageChange(cancellationRate, previousCancellationRate)

  // 4. Revenue Collected - total money actually collected
  const revenueCollected = revenueData.current
  const revenueChange = calculatePercentageChange(revenueCollected, revenueData.previous)

  // 5. New Patients Count - first-time patients
  const newPatients = mockData.patients.filter((patient) => {
    if (!patient.first_visit_at) return false
    const firstVisitDate = new Date(patient.first_visit_at)
    return firstVisitDate >= thirtyDaysAgo && firstVisitDate <= now
  }).length

  const previousNewPatients = mockData.patients.filter((patient) => {
    if (!patient.first_visit_at) return false
    const firstVisitDate = new Date(patient.first_visit_at)
    return firstVisitDate >= sixtyDaysAgo && firstVisitDate < thirtyDaysAgo
  }).length
  const newPatientsChange = calculatePercentageChange(newPatients, previousNewPatients)

  // 6. Return Rate (Follow-up compliance) - % who returned within 30 days
  const patientsWithFollowUp = new Set<string>()
  const patientsEligibleForFollowUp = new Set<string>()

  // Get all appointments in the period
  const allAppointmentsInPeriod = mockData.appointments.filter(
    (apt) => new Date(apt.scheduled_at) >= sixtyDaysAgo && new Date(apt.scheduled_at) <= now
  )

  // Group appointments by patient
  const patientAppointments = new Map<string, typeof allAppointmentsInPeriod>()
  allAppointmentsInPeriod.forEach((apt) => {
    if (!patientAppointments.has(apt.patient_id)) {
      patientAppointments.set(apt.patient_id, [])
    }
    patientAppointments.get(apt.patient_id)!.push(apt)
  })

  // Check for follow-ups
  patientAppointments.forEach((appointments, patientId) => {
    if (appointments.length < 2) return

    // Sort by date
    appointments.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

    // Check if patient had a follow-up within 30 days
    for (let i = 0; i < appointments.length - 1; i++) {
      const firstApt = appointments[i]
      const secondApt = appointments[i + 1]

      // Only count if first appointment was in the current period
      if (new Date(firstApt.scheduled_at) >= thirtyDaysAgo && new Date(firstApt.scheduled_at) <= now) {
        patientsEligibleForFollowUp.add(patientId)

        const daysDiff = (new Date(secondApt.scheduled_at).getTime() - new Date(firstApt.scheduled_at).getTime()) / (1000 * 60 * 60 * 24)
        if (daysDiff <= 30) {
          patientsWithFollowUp.add(patientId)
        }
      }
    }
  })

  const returnRate = patientsEligibleForFollowUp.size > 0 ? (patientsWithFollowUp.size / patientsEligibleForFollowUp.size) * 100 : 0

  // Calculate previous period return rate
  const previousPatientsWithFollowUp = new Set<string>()
  const previousPatientsEligibleForFollowUp = new Set<string>()

  const previousAllAppointments = mockData.appointments.filter(
    (apt) => {
      const aptDate = new Date(apt.scheduled_at)
      return aptDate >= new Date(sixtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000) && aptDate < thirtyDaysAgo
    }
  )

  const previousPatientAppointments = new Map<string, typeof previousAllAppointments>()
  previousAllAppointments.forEach((apt) => {
    if (!previousPatientAppointments.has(apt.patient_id)) {
      previousPatientAppointments.set(apt.patient_id, [])
    }
    previousPatientAppointments.get(apt.patient_id)!.push(apt)
  })

  previousPatientAppointments.forEach((appointments, patientId) => {
    if (appointments.length < 2) return
    appointments.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

    for (let i = 0; i < appointments.length - 1; i++) {
      const firstApt = appointments[i]
      const secondApt = appointments[i + 1]

      const firstAptDate = new Date(firstApt.scheduled_at)
      if (firstAptDate >= sixtyDaysAgo && firstAptDate < thirtyDaysAgo) {
        previousPatientsEligibleForFollowUp.add(patientId)

        const daysDiff = (new Date(secondApt.scheduled_at).getTime() - new Date(firstApt.scheduled_at).getTime()) / (1000 * 60 * 60 * 24)
        if (daysDiff <= 30) {
          previousPatientsWithFollowUp.add(patientId)
        }
      }
    }
  })

  const previousReturnRate = previousPatientsEligibleForFollowUp.size > 0 ? (previousPatientsWithFollowUp.size / previousPatientsEligibleForFollowUp.size) * 100 : 0
  const returnRateChange = calculatePercentageChange(returnRate, previousReturnRate)

  // Mock Sparkline Data
  const generateSparkline = (base: number) => {
    return Array.from({ length: 10 }, (_, i) => ({
      date: i,
      value: base + Math.floor(Math.random() * 20) - 10,
    }))
  }

  const metrics = [
    {
      id: "slot-fill-rate",
      label: "Slot Fill Rate",
      value: `${slotFillRate.toFixed(1)}%`,
      change: slotFillRateChange.value,
      changeType: slotFillRateChange.type,
      data: generateSparkline(slotFillRate),
      color: "blue" as const,
    },
    {
      id: "no-show-rate",
      label: "No-Show Rate",
      value: `${noShowRate.toFixed(1)}%`,
      change: noShowRateChange.value,
      changeType: noShowRateChange.type === "positive" ? "negative" : noShowRateChange.type === "negative" ? "positive" : "neutral",
      data: generateSparkline(noShowRate),
      color: "pink" as const,
    },
    {
      id: "cancellation-rate",
      label: "Cancellation Rate",
      value: `${cancellationRate.toFixed(1)}%`,
      change: cancellationRateChange.value,
      changeType: cancellationRateChange.type === "positive" ? "negative" : cancellationRateChange.type === "negative" ? "positive" : "neutral",
      data: generateSparkline(cancellationRate),
      color: "amber" as const,
    },
    {
      id: "revenue-collected",
      label: "Revenue Collected",
      value: `EGP ${revenueCollected.toLocaleString()}`,
      change: revenueChange.value,
      changeType: revenueChange.type,
      data: generateSparkline(revenueCollected / 100),
      color: "emerald" as const,
    },
    {
      id: "new-patients",
      label: "New Patients",
      value: newPatients.toString(),
      change: newPatientsChange.value,
      changeType: newPatientsChange.type,
      data: generateSparkline(newPatients),
      color: "indigo" as const,
    },
    {
      id: "return-rate",
      label: "Return Rate",
      value: `${returnRate.toFixed(1)}%`,
      change: returnRateChange.value,
      changeType: returnRateChange.type,
      data: generateSparkline(returnRate),
      color: "violet" as const,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.id} className="overflow-hidden">
          <CardContent className="p-4 flex flex-col h-full justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {metric.label}
                </p>
                {metric.change && (
                  <Badge
                    variant={
                      metric.changeType === "positive"
                        ? "success"
                        : metric.changeType === "negative"
                        ? "error"
                        : "neutral"
                    }
                    className="text-xs h-4 px-1"
                  >
                    {metric.change}
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{metric.value}</p>
              </div>
            </div>

            <div className="h-10 w-full -mx-4 -mb-2">
              <AreaChart
                data={metric.data}
                index="date"
                categories={["value"]}
                colors={[metric.color as "indigo" | "blue" | "emerald" | "violet" | "amber" | "gray" | "cyan" | "pink"]}
                showXAxis={false}
                showYAxis={false}
                showTooltip={false}
                className="h-full w-full"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
