import { DEMO_CLINIC_ID } from "@/lib/constants"
import { mockData } from "@/data/mock/mock-data"
import type { AskInsightParams, InsightResponse } from "./insights.types"
import { getTimeRangeDates, formatRecordCount } from "./insights.utils"
import { listPayments } from "@/api/payments.api"
import { useDemo } from "@/contexts/demo-context"

export async function askInsight({ question, clinicId: _clinicId, timeRange }: AskInsightParams): Promise<InsightResponse> {
  // Check if in demo mode - if not, return zero metrics
  let isDemoMode = true
  if (typeof window !== "undefined") {
    const storedDemoMode = localStorage.getItem("demo-mode")
    isDemoMode = storedDemoMode === "true" || storedDemoMode === null
  }
  
  if (!isDemoMode) {
    // Return empty metrics for non-demo mode
    return {
      summary: "No data available yet. Start adding appointments and patients to see insights.",
      metrics: [
        { label: "Appointments", value: 0 },
        { label: "Patients", value: 0 },
        { label: "Revenue", value: "0 EGP" },
      ],
      actions: [],
      basedOn: formatRecordCount(0),
    }
  }
  
  const { start, end } = getTimeRangeDates(timeRange)
  
  const delay = Math.random() * 300 + 600
  await new Promise((resolve) => setTimeout(resolve, delay))
  
  const lowerQuestion = question.toLowerCase()
  
  if (lowerQuestion.includes("slot fill") || lowerQuestion.includes("utilization") || lowerQuestion.includes("fill rate")) {
    return handleSlotFillRateQuestion(start, end, timeRange)
  }
  
  if (lowerQuestion.includes("no-show") || lowerQuestion.includes("no show")) {
    return handleNoShowsQuestion(start, end, timeRange)
  }
  
  if (lowerQuestion.includes("cancellation") || lowerQuestion.includes("cancel") || lowerQuestion.includes("last minute")) {
    return handleCancellationRateQuestion(start, end, timeRange)
  }
  
  if (lowerQuestion.includes("revenue") || lowerQuestion.includes("money collected") || lowerQuestion.includes("earnings")) {
    return await handleRevenueQuestion(start, end, timeRange)
  }
  
  if (lowerQuestion.includes("new patient") || lowerQuestion.includes("first-time") || lowerQuestion.includes("first time")) {
    return handleNewPatientsQuestion(start, end, timeRange)
  }
  
  if (lowerQuestion.includes("return rate") || lowerQuestion.includes("follow-up compliance") || lowerQuestion.includes("returned")) {
    return handleReturnRateQuestion(start, end, timeRange)
  }
  
  if (lowerQuestion.includes("empty slot") || lowerQuestion.includes("losing money") || lowerQuestion.includes("empty slots")) {
    return handleEmptySlotsQuestion(start, end, timeRange)
  }
  
  if (lowerQuestion.includes("lead source") || lowerQuestion.includes("best source") || lowerQuestion.includes("which lead")) {
    return handleLeadSourceQuestion(start, end, timeRange)
  }
  
  if (lowerQuestion.includes("follow up") || lowerQuestion.includes("who should") || lowerQuestion.includes("fill slots")) {
    return handleFollowUpQuestion(start, end, timeRange)
  }
  
  return {
    summary: "I can help you analyze appointments, leads, and performance metrics. Try asking about slot fill rate, no-shows, cancellations, revenue, new patients, return rate, empty slots, lead sources, or follow-ups.",
    metrics: [],
    actions: [],
    basedOn: formatRecordCount(0),
  }
}

function handleNoShowsQuestion(start: Date, end: Date, timeRange: string): InsightResponse {
  const appointmentsInRange = mockData.appointments.filter(
    (apt) => new Date(apt.scheduled_at) >= start && new Date(apt.scheduled_at) <= end
  )
  
  const noShows = appointmentsInRange.filter((apt) => apt.status === "no_show")
  const totalAppointments = appointmentsInRange.length
  const noShowRate = totalAppointments > 0 ? ((noShows.length / totalAppointments) * 100).toFixed(1) : "0"
  
  const previousStart = new Date(start)
  previousStart.setDate(previousStart.getDate() - (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 1))
  const previousEnd = new Date(start)
  
  const previousAppointments = mockData.appointments.filter(
    (apt) => new Date(apt.scheduled_at) >= previousStart && new Date(apt.scheduled_at) < previousEnd
  )
  const previousNoShows = previousAppointments.filter((apt) => apt.status === "no_show")
  const previousRate = previousAppointments.length > 0 ? ((previousNoShows.length / previousAppointments.length) * 100).toFixed(1) : "0"
  
  const isHigher = parseFloat(noShowRate) > parseFloat(previousRate)
  
  return {
    summary: isHigher
      ? `No-show rate is ${noShowRate}% this period, up from ${previousRate}% last period. This may be due to insufficient confirmation reminders or scheduling issues.`
      : `No-show rate is ${noShowRate}% this period, down from ${previousRate}% last period. Your confirmation process is working well.`,
    metrics: [
      { label: "No-shows", value: noShows.length },
      { label: "Total appointments", value: totalAppointments },
      { label: "No-show rate", value: `${noShowRate}%` },
    ],
    actions: [
      {
        label: "View list",
        route: `/app/appointments?status=no_show&range=${timeRange}`,
        type: "primary",
      },
    ],
    basedOn: formatRecordCount(totalAppointments),
  }
}

function handleEmptySlotsQuestion(start: Date, end: Date, _timeRange: string): InsightResponse {
  const appointmentsInRange = mockData.appointments.filter(
    (apt) => new Date(apt.scheduled_at) >= start && new Date(apt.scheduled_at) <= end
  )
  
  const completed = appointmentsInRange.filter((apt) => apt.status === "completed")
  const scheduled = appointmentsInRange.filter((apt) => ["scheduled", "confirmed"].includes(apt.status))
  
  const totalSlots = completed.length + scheduled.length
  const emptySlots = Math.max(0, totalSlots - completed.length - scheduled.length)
  
  const avgSlotValue = 500
  const estimatedLoss = emptySlots * avgSlotValue
  
  return {
    summary: `You have ${emptySlots} empty slots in the next 3 days, potentially losing ${estimatedLoss.toLocaleString()} EGP in revenue. Focus on filling morning slots (9-11 AM) which have the highest no-show rates.`,
    metrics: [
      { label: "Empty slots", value: emptySlots },
      { label: "Potential loss", value: `${estimatedLoss.toLocaleString()} EGP` },
      { label: "Booked slots", value: scheduled.length },
    ],
    actions: [
      {
        label: "Fill slots",
        route: `/app/appointments?openSlots=1&range=7d`,
        type: "primary",
      },
    ],
    basedOn: formatRecordCount(totalSlots),
  }
}

function handleLeadSourceQuestion(start: Date, end: Date, _timeRange: string): InsightResponse {
  const leadsInRange = mockData.leads.filter(
    (lead) => new Date(lead.created_at) >= start && new Date(lead.created_at) <= end
  )
  
  const sourceCounts: Record<string, { total: number; converted: number }> = {}
  
  leadsInRange.forEach((lead) => {
    if (!sourceCounts[lead.source]) {
      sourceCounts[lead.source] = { total: 0, converted: 0 }
    }
    sourceCounts[lead.source].total++
    if (lead.status === "converted") {
      sourceCounts[lead.source].converted++
    }
  })
  
  const sourceRates = Object.entries(sourceCounts).map(([source, counts]) => ({
    source,
    rate: counts.total > 0 ? (counts.converted / counts.total) * 100 : 0,
    total: counts.total,
    converted: counts.converted,
  }))
  
  sourceRates.sort((a, b) => b.rate - a.rate)
  
  const bestSource = sourceRates[0]
  
  return {
    summary: `${bestSource.source} brings the best patients with a ${bestSource.rate.toFixed(1)}% conversion rate (${bestSource.converted}/${bestSource.total} leads converted). Focus your marketing efforts here.`,
    metrics: [
      { label: "Best source", value: bestSource.source },
      { label: "Conversion rate", value: `${bestSource.rate.toFixed(1)}%` },
      { label: "Converted leads", value: bestSource.converted },
    ],
    actions: [
      {
        label: "View leads",
        route: `/app/assistant/leads?source=${encodeURIComponent(bestSource.source)}`,
        type: "primary",
      },
    ],
    basedOn: formatRecordCount(leadsInRange.length),
  }
}

function handleFollowUpQuestion(_start: Date, _end: Date, _timeRange: string): InsightResponse {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 999)
  
  const hotLeads = mockData.leads.filter(
    (lead) =>
      lead.quality === "hot" &&
      lead.status !== "converted" &&
      lead.status !== "lost" &&
      lead.next_action_due &&
      new Date(lead.next_action_due) <= tomorrow
  )
  
  const unconfirmedAppointments = mockData.appointments.filter(
    (apt) =>
      apt.status === "scheduled" &&
      new Date(apt.scheduled_at) >= now &&
      new Date(apt.scheduled_at) <= tomorrow
  )
  
  return {
    summary: `You have ${hotLeads.length} hot leads waiting for follow-up today and ${unconfirmedAppointments.length} unconfirmed appointments tomorrow. Prioritize confirming tomorrow's appointments first, then reach out to hot leads.`,
    metrics: [
      { label: "Hot leads waiting", value: hotLeads.length },
      { label: "Unconfirmed tomorrow", value: unconfirmedAppointments.length },
      { label: "Total actions needed", value: hotLeads.length + unconfirmedAppointments.length },
    ],
    actions: [
      {
        label: "Open leads",
        route: `/app/assistant/leads?quality=hot&due=today`,
        type: "primary",
      },
      {
        label: "Confirm appointments",
        route: `/app/appointments?status=scheduled&range=today`,
        type: "secondary",
      },
    ],
    basedOn: formatRecordCount(hotLeads.length + unconfirmedAppointments.length),
  }
}

function handleSlotFillRateQuestion(start: Date, end: Date, timeRange: string): InsightResponse {
  const appointmentsInRange = mockData.appointments.filter(
    (apt) => new Date(apt.scheduled_at) >= start && new Date(apt.scheduled_at) <= end
  )
  
  // Calculate available slots (assume 8 slots per day)
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const availableSlots = daysDiff * 8
  
  const bookedSlots = appointmentsInRange.filter((apt) =>
    ["scheduled", "confirmed", "completed", "cancelled", "no_show"].includes(apt.status)
  ).length
  
  const slotFillRate = availableSlots > 0 ? ((bookedSlots / availableSlots) * 100).toFixed(1) : "0"
  
  const previousStart = new Date(start)
  previousStart.setDate(previousStart.getDate() - (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 1))
  const previousEnd = new Date(start)
  
  const previousAppointments = mockData.appointments.filter(
    (apt) => new Date(apt.scheduled_at) >= previousStart && new Date(apt.scheduled_at) < previousEnd
  )
  const previousBookedSlots = previousAppointments.filter((apt) =>
    ["scheduled", "confirmed", "completed", "cancelled", "no_show"].includes(apt.status)
  ).length
  const previousSlotFillRate = availableSlots > 0 ? ((previousBookedSlots / availableSlots) * 100).toFixed(1) : "0"
  
  const isHigher = parseFloat(slotFillRate) > parseFloat(previousSlotFillRate)
  
  return {
    summary: isHigher
      ? `Slot fill rate is ${slotFillRate}% this period, up from ${previousSlotFillRate}% last period. Great utilization of your available appointment slots.`
      : `Slot fill rate is ${slotFillRate}% this period, down from ${previousSlotFillRate}% last period. Consider improving marketing or outreach to fill more slots.`,
    metrics: [
      { label: "Booked slots", value: bookedSlots },
      { label: "Available slots", value: availableSlots },
      { label: "Fill rate", value: `${slotFillRate}%` },
    ],
    actions: [
      {
        label: "View appointments",
        route: `/app/appointments?range=${timeRange}`,
        type: "primary",
      },
    ],
    basedOn: formatRecordCount(bookedSlots),
  }
}

function handleCancellationRateQuestion(start: Date, end: Date, timeRange: string): InsightResponse {
  const appointmentsInRange = mockData.appointments.filter(
    (apt) => new Date(apt.scheduled_at) >= start && new Date(apt.scheduled_at) <= end
  )
  
  const bookedAppointments = appointmentsInRange.filter((apt) =>
    ["scheduled", "confirmed", "completed", "cancelled", "no_show"].includes(apt.status)
  )
  
  const lastMinuteCancellations = appointmentsInRange.filter((apt) => {
    if (apt.status !== "cancelled") return false
    const scheduledDate = new Date(apt.scheduled_at)
    const cancelledDate = new Date(apt.created_at)
    const hoursDiff = (scheduledDate.getTime() - cancelledDate.getTime()) / (1000 * 60 * 60)
    return hoursDiff <= 24 && hoursDiff >= 0
  })
  
  const cancellationRate = bookedAppointments.length > 0
    ? ((lastMinuteCancellations.length / bookedAppointments.length) * 100).toFixed(1)
    : "0"
  
  const previousStart = new Date(start)
  previousStart.setDate(previousStart.getDate() - (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 1))
  const previousEnd = new Date(start)
  
  const previousAppointments = mockData.appointments.filter(
    (apt) => new Date(apt.scheduled_at) >= previousStart && new Date(apt.scheduled_at) < previousEnd
  )
  const previousBookedAppointments = previousAppointments.filter((apt) =>
    ["scheduled", "confirmed", "completed", "cancelled", "no_show"].includes(apt.status)
  )
  const previousLastMinuteCancellations = previousAppointments.filter((apt) => {
    if (apt.status !== "cancelled") return false
    const scheduledDate = new Date(apt.scheduled_at)
    const cancelledDate = new Date(apt.created_at)
    const hoursDiff = (scheduledDate.getTime() - cancelledDate.getTime()) / (1000 * 60 * 60)
    return hoursDiff <= 24 && hoursDiff >= 0
  })
  const previousCancellationRate = previousBookedAppointments.length > 0
    ? ((previousLastMinuteCancellations.length / previousBookedAppointments.length) * 100).toFixed(1)
    : "0"
  
  const isHigher = parseFloat(cancellationRate) > parseFloat(previousCancellationRate)
  
  return {
    summary: isHigher
      ? `Last-minute cancellation rate is ${cancellationRate}% this period, up from ${previousCancellationRate}% last period. Consider implementing a cancellation policy or reminder system to reduce last-minute cancellations.`
      : `Last-minute cancellation rate is ${cancellationRate}% this period, down from ${previousCancellationRate}% last period. Your scheduling stability is improving.`,
    metrics: [
      { label: "Last-minute cancellations", value: lastMinuteCancellations.length },
      { label: "Total booked", value: bookedAppointments.length },
      { label: "Cancellation rate", value: `${cancellationRate}%` },
    ],
    actions: [
      {
        label: "View cancellations",
        route: `/app/appointments?status=cancelled&range=${timeRange}`,
        type: "primary",
      },
    ],
    basedOn: formatRecordCount(bookedAppointments.length),
  }
}

async function handleRevenueQuestion(start: Date, end: Date, timeRange: string): Promise<InsightResponse> {
  try {
    const paymentsResponse = await listPayments({
      clinicId: DEMO_CLINIC_ID,
      from: start.toISOString(),
      to: end.toISOString(),
      pageSize: 1000,
    })
    
    const revenue = paymentsResponse.payments.reduce((sum, p) => sum + p.amount, 0)
    
    const previousStart = new Date(start)
    previousStart.setDate(previousStart.getDate() - (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 1))
    const previousEnd = new Date(start)
    
    const previousPaymentsResponse = await listPayments({
      clinicId: DEMO_CLINIC_ID,
      from: previousStart.toISOString(),
      to: previousEnd.toISOString(),
      pageSize: 1000,
    })
    
    const previousRevenue = previousPaymentsResponse.payments.reduce((sum, p) => sum + p.amount, 0)
    
    const revenueChange = previousRevenue > 0 ? (((revenue - previousRevenue) / previousRevenue) * 100).toFixed(1) : "0"
    const isHigher = revenue > previousRevenue
    
    return {
      summary: isHigher
        ? `Revenue collected is ${revenue.toLocaleString()} EGP this period, up ${revenueChange}% from ${previousRevenue.toLocaleString()} EGP last period. Strong financial performance.`
        : `Revenue collected is ${revenue.toLocaleString()} EGP this period, down ${revenueChange}% from ${previousRevenue.toLocaleString()} EGP last period. Review appointment completion rates and payment collection.`,
      metrics: [
        { label: "Revenue collected", value: `${revenue.toLocaleString()} EGP` },
        { label: "Total payments", value: paymentsResponse.payments.length },
        { label: "Change", value: `${isHigher ? "+" : ""}${revenueChange}%` },
      ],
      actions: [
        {
          label: "View payments",
          route: `/app/accounting/payments?range=${timeRange}`,
          type: "primary",
        },
      ],
      basedOn: formatRecordCount(paymentsResponse.payments.length),
    }
  } catch (error) {
    return {
      summary: "Unable to fetch revenue data at this time. Please try again later.",
      metrics: [],
      actions: [],
      basedOn: formatRecordCount(0),
    }
  }
}

function handleNewPatientsQuestion(start: Date, end: Date, timeRange: string): InsightResponse {
  const newPatients = mockData.patients.filter((patient) => {
    if (!patient.first_visit_at) return false
    const firstVisitDate = new Date(patient.first_visit_at)
    return firstVisitDate >= start && firstVisitDate <= end
  })
  
  // Group by source from leads
  const patientSources: Record<string, number> = {}
  // TODO: Link leads to patients (Lead interface doesn't have patient_id field)
  // For now, just count sources from leads directly
  mockData.leads.forEach((lead) => {
    const source = lead.source || "Unknown"
    patientSources[source] = (patientSources[source] || 0) + 1
  })
  
  const topSource = Object.entries(patientSources).sort((a, b) => b[1] - a[1])[0]
  
  const previousStart = new Date(start)
  previousStart.setDate(previousStart.getDate() - (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 1))
  const previousEnd = new Date(start)
  
  const previousNewPatients = mockData.patients.filter((patient) => {
    if (!patient.first_visit_at) return false
    const firstVisitDate = new Date(patient.first_visit_at)
    return firstVisitDate >= previousStart && firstVisitDate < previousEnd
  })
  
  const isHigher = newPatients.length > previousNewPatients.length
  
  return {
    summary: `You have ${newPatients.length} new patients this period${previousNewPatients.length > 0 ? `, ${isHigher ? "up" : "down"} from ${previousNewPatients.length} last period` : ""}. ${topSource ? `Most came from ${topSource[0]} (${topSource[1]} patients).` : ""} Focus on retaining these new patients for long-term value.`,
    metrics: [
      { label: "New patients", value: newPatients.length },
      { label: "Top source", value: topSource ? topSource[0] : "N/A" },
      { label: "From top source", value: topSource ? topSource[1] : 0 },
    ],
    actions: [
      {
        label: "View new patients",
        route: `/app/patients?new=true&range=${timeRange}`,
        type: "primary",
      },
    ],
    basedOn: formatRecordCount(newPatients.length),
  }
}

function handleReturnRateQuestion(start: Date, end: Date, timeRange: string): InsightResponse {
  const patientsWithFollowUp = new Set<string>()
  const patientsEligibleForFollowUp = new Set<string>()
  
  // Get all appointments in the period
  const allAppointmentsInPeriod = mockData.appointments.filter(
    (apt) => {
      const aptDate = new Date(apt.scheduled_at)
      return aptDate >= start && aptDate <= end
    }
  )
  
  // Group appointments by patient
  const patientAppointments = new Map<string, typeof allAppointmentsInPeriod>()
  allAppointmentsInPeriod.forEach((apt) => {
    if (!patientAppointments.has(apt.patient_id)) {
      patientAppointments.set(apt.patient_id, [])
    }
    patientAppointments.get(apt.patient_id)!.push(apt)
  })
  
  // Check for follow-ups within 30 days
  patientAppointments.forEach((appointments, patientId) => {
    if (appointments.length < 2) return
    
    // Sort by date
    appointments.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    
    // Check if patient had a follow-up within 30 days
    for (let i = 0; i < appointments.length - 1; i++) {
      const firstApt = appointments[i]
      const secondApt = appointments[i + 1]
      
      // Only count if first appointment was in the current period
      if (new Date(firstApt.scheduled_at) >= start && new Date(firstApt.scheduled_at) <= end) {
        patientsEligibleForFollowUp.add(patientId)
        
        const daysDiff = (new Date(secondApt.scheduled_at).getTime() - new Date(firstApt.scheduled_at).getTime()) / (1000 * 60 * 60 * 24)
        if (daysDiff <= 30) {
          patientsWithFollowUp.add(patientId)
        }
      }
    }
  })
  
  const returnRate = patientsEligibleForFollowUp.size > 0
    ? ((patientsWithFollowUp.size / patientsEligibleForFollowUp.size) * 100).toFixed(1)
    : "0"
  
  // Calculate previous period return rate
  const previousStart = new Date(start)
  previousStart.setDate(previousStart.getDate() - (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 1))
  const previousEnd = new Date(start)
  
  const previousPatientsWithFollowUp = new Set<string>()
  const previousPatientsEligibleForFollowUp = new Set<string>()
  
  const previousAllAppointments = mockData.appointments.filter(
    (apt) => {
      const aptDate = new Date(apt.scheduled_at)
      return aptDate >= previousStart && aptDate < previousEnd
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
      if (firstAptDate >= previousStart && firstAptDate < previousEnd) {
        previousPatientsEligibleForFollowUp.add(patientId)
        
        const daysDiff = (new Date(secondApt.scheduled_at).getTime() - new Date(firstApt.scheduled_at).getTime()) / (1000 * 60 * 60 * 24)
        if (daysDiff <= 30) {
          previousPatientsWithFollowUp.add(patientId)
        }
      }
    }
  })
  
  const previousReturnRate = previousPatientsEligibleForFollowUp.size > 0
    ? ((previousPatientsWithFollowUp.size / previousPatientsEligibleForFollowUp.size) * 100).toFixed(1)
    : "0"
  
  const isHigher = parseFloat(returnRate) > parseFloat(previousReturnRate)
  
  return {
    summary: isHigher
      ? `Return rate (follow-up compliance) is ${returnRate}% this period, up from ${previousReturnRate}% last period. Patients are returning for follow-ups, indicating strong trust and long-term revenue potential.`
      : `Return rate (follow-up compliance) is ${returnRate}% this period, down from ${previousReturnRate}% last period. Consider improving follow-up communication and appointment scheduling to increase patient retention.`,
    metrics: [
      { label: "Patients returned", value: patientsWithFollowUp.size },
      { label: "Eligible patients", value: patientsEligibleForFollowUp.size },
      { label: "Return rate", value: `${returnRate}%` },
    ],
    actions: [
      {
        label: "View patients",
        route: `/app/patients?range=${timeRange}`,
        type: "primary",
      },
    ],
    basedOn: formatRecordCount(patientsEligibleForFollowUp.size),
  }
}
