"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { mockData, mockAppointments } from "@/data/mock/mock-data"
import { listInvoices } from "@/api/invoices.api"
import { update as updatePatient } from "@/api/patients.api"
import { getByPatientId as getNotesByPatientId } from "@/api/notes.api"
import { getProgressByPatientId } from "@/api/progress.api"
import { getClinicSettings } from "@/api/settings.api"
import { getDraftDueTotalForPatient } from "@/api/draft-due.api"
import { createTask, listTasks, updateTaskStatus } from "@/features/tasks/tasks.api"
import type { CreateTaskPayload, TaskListItem } from "@/features/tasks/tasks.types"
import type { ProgressMetric } from "@/types/progress"
import { getMetricsToRecord } from "@/types/progress"

export function usePatientPageData(
  patientId: string,
  isDemoMode: boolean,
  currentClinicId: string | undefined
) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<any | null>(null)
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetric[]>([])
  const [enabledProgressMetricIds, setEnabledProgressMetricIds] = useState<string[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [labResults, setLabResults] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [tasks, setTasks] = useState<TaskListItem[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [scanExtractions, setScanExtractions] = useState<any[]>([])
  const [pastMedications, setPastMedications] = useState<any[]>([])
  const [totalDue, setTotalDue] = useState<number>(0)

  useEffect(() => {
    fetchPatientData()
    fetchDueTotal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, isDemoMode])

  useEffect(() => {
    if (patientId) fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, isDemoMode])

  useEffect(() => {
    if (!currentClinicId) return
    getClinicSettings(currentClinicId).then((settings) => {
      setEnabledProgressMetricIds(settings.enabledProgressMetricIds ?? [])
    })
  }, [currentClinicId])

  const defaultMetricIds = useMemo(() => ["weight", "bmi", "bp", "pulse", "blood_sugar"], [])
  const metricsToRecord = useMemo(
    () =>
      getMetricsToRecord(
        enabledProgressMetricIds.length > 0 ? enabledProgressMetricIds : defaultMetricIds
      ),
    [enabledProgressMetricIds, defaultMetricIds]
  )

  const fetchPatientData = async () => {
    setLoading(true)
    if (isDemoMode) {
      const foundPatient = mockData.patients.find((p) => p.id === patientId)
      if (foundPatient) {
        setPatient(foundPatient)
        getProgressByPatientId(patientId).then((res) => setProgressMetrics(res.metrics))
        setPrescriptions(mockData.prescriptions.filter((p) => p.patientId === patientId))
        setLabResults(mockData.labResults.filter((l) => l.patient_id === patientId))
        setAppointments(mockData.appointments.filter((a) => a.patient_id === patientId))
        setNotes(mockData.doctorNotes.filter((n) => n.patient_id === patientId))
        setAttachments(mockData.attachments.filter((a) => a.patient_id === patientId))
        setScanExtractions(mockData.scanExtractions.filter((s) => s.patient_id === patientId))
        setPastMedications(mockData.pastMedications.filter((m) => m.patientId === patientId))
      } else {
        router.push("/patients")
      }
    }
    setLoading(false)
  }

  const fetchDueTotal = async () => {
    try {
      const clinicId = currentClinicId || "clinic-001"
      const [invResult, draftTotal] = await Promise.all([
        listInvoices({
          clinicId,
          patientId,
          status: "unpaid",
          page: 1,
          pageSize: 1000,
        }),
        getDraftDueTotalForPatient(patientId),
      ])
      const invoicesTotal = invResult.invoices.reduce((sum, inv) => sum + inv.amount, 0)
      setTotalDue(invoicesTotal + draftTotal)
    } catch (error) {
      console.error("Failed to fetch due total:", error)
    }
  }

  const fetchTasks = async () => {
    try {
      const clinicId = currentClinicId || "clinic-001"
      const response = await listTasks({
        clinicId,
        status: "all",
        page: 1,
        pageSize: 1000,
      })
      const patientTasks = response.tasks.filter((t) => t.patientId === patientId)
      setTasks(patientTasks)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    }
  }

  const isNowInQueue =
    isDemoMode &&
    (() => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const todayAppts = mockAppointments.filter((apt) => {
        const aptDate = new Date(apt.scheduled_at)
        return aptDate >= today && aptDate < tomorrow
      })
      const queue = todayAppts
        .filter((apt) => !["completed", "cancelled", "no_show"].includes(apt.status))
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
      const first = queue[0]
      return first?.patient_id === patientId
    })()

  const getLastVisited = () => {
    if (patient?.last_visit_at) return patient.last_visit_at
    if (appointments.length > 0) {
      const sorted = [...appointments].sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
      )
      return sorted[0].scheduled_at
    }
    return null
  }

  const formatLastVisited = (dateString: string | null) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor(
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const handleUpdatePatient = async (updates: Partial<any>) => {
    const updatedPatient = await updatePatient(patientId, updates)
    setPatient(updatedPatient)
    const mockIndex = mockData.patients.findIndex((p) => p.id === patientId)
    if (mockIndex !== -1) {
      mockData.patients[mockIndex] = updatedPatient as any
    }
    return updatedPatient
  }

  return {
    loading,
    patient,
    progressMetrics,
    setProgressMetrics,
    metricsToRecord,
    prescriptions,
    labResults,
    appointments,
    tasks,
    setTasks,
    notes,
    setNotes,
    attachments,
    setAttachments,
    scanExtractions,
    setScanExtractions,
    pastMedications,
    setPastMedications,
    setPrescriptions,
    totalDue,
    isNowInQueue,
    getLastVisited,
    formatLastVisited,
    fetchPatientData,
    fetchDueTotal,
    fetchTasks,
    handleUpdatePatient,
    setPatient,
  }
}

export function orderProgressMetricsByTracked(
  metrics: ProgressMetric[],
  trackedIds: string[]
): ProgressMetric[] {
  if (trackedIds.length === 0) return metrics
  const byId = new Map(metrics.map((m) => [m.id, m]))
  const ordered: ProgressMetric[] = []
  for (const id of trackedIds) {
    const m = byId.get(id)
    if (m && m.points.length >= 2) ordered.push(m)
  }
  for (const m of metrics) {
    if (!trackedIds.includes(m.id)) ordered.push(m)
  }
  return ordered
}
