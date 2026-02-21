"use client"

import { useState, useEffect, useMemo } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useRouter } from "next/navigation"
import { mockData, mockAppointments } from "@/data/mock/mock-data"
import { listInvoices } from "@/api/invoices.api"
import { update as updatePatient, getById as getPatientById } from "@/api/patients.api"
import { getByPatientId as getNotesByPatientId } from "@/api/notes.api"
import { getProgressByPatientId } from "@/api/progress.api"
import { getClinicSettings } from "@/api/settings.api"
import { getDraftDueTotalForPatient } from "@/api/draft-due.api"
import { createTask, listTasks, updateTaskStatus } from "@/features/tasks/tasks.api"
import type { CreateTaskPayload, TaskListItem } from "@/features/tasks/tasks.types"
import type { ProgressMetric } from "@/types/progress"
import { getMetricsToRecord } from "@/types/progress"
import { getChecklistItemsForNote, DEFAULT_CHECKLIST_IDS } from "@/types/visit-progress"
import {
  MEDICAL_CONDITIONS,
  DEFAULT_MEDICAL_CONDITION_IDS,
} from "@/features/patients/detail/medical-conditions"

export function usePatientPageData(
  patientId: string,
  isDemoMode: boolean,
  currentClinicId: string | undefined
) {
  const t = useAppTranslations()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<any | null>(null)
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetric[]>([])
  const [enabledProgressMetricIds, setEnabledProgressMetricIds] = useState<string[]>([])
  const [visitProgressChecklistIds, setVisitProgressChecklistIds] = useState<string[]>(
    () => DEFAULT_CHECKLIST_IDS
  )
  const [medicalConditionIds, setMedicalConditionIds] = useState<string[]>([])
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
      const saved = settings.visitProgressChecklistIds
      if (saved !== undefined && saved.length > 0) {
        const legacyDefaults = ["vitals", "complaint", "examination", "diagnosis", "treatment", "labs", "followup"]
        const isLegacy = saved.length === legacyDefaults.length && legacyDefaults.every((id) => saved!.includes(id))
        setVisitProgressChecklistIds(isLegacy ? DEFAULT_CHECKLIST_IDS : saved)
      } else {
        setVisitProgressChecklistIds(DEFAULT_CHECKLIST_IDS)
      }
      const savedMed = settings.medicalConditionIds
      setMedicalConditionIds(
        savedMed !== undefined && savedMed.length > 0
          ? savedMed
          : [...DEFAULT_MEDICAL_CONDITION_IDS]
      )
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

  const checklistItems = useMemo(
    () => getChecklistItemsForNote(visitProgressChecklistIds),
    [visitProgressChecklistIds]
  )

  const enabledMedicalConditions = useMemo(
    () =>
      medicalConditionIds.length > 0
        ? MEDICAL_CONDITIONS.filter((c) => medicalConditionIds.includes(c.id))
        : MEDICAL_CONDITIONS.filter((c) =>
            (DEFAULT_MEDICAL_CONDITION_IDS as readonly string[]).includes(c.id)
          ),
    [medicalConditionIds]
  )

  const fetchPatientData = async () => {
    setLoading(true)
    try {
      const foundPatient = await getPatientById(patientId)
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
    } finally {
      setLoading(false)
    }
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
    if (!dateString) return t.common.never
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor(
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) return t.common.today
    if (diffDays === 1) return t.common.yesterday
    if (diffDays < 7) return t.common.daysAgo.replace("{n}", String(diffDays))
    if (diffDays < 30) return t.common.weeksAgo.replace("{n}", String(Math.floor(diffDays / 7)))
    if (diffDays < 365) return t.common.monthsAgo.replace("{n}", String(Math.floor(diffDays / 30)))
    return t.common.yearsAgo.replace("{n}", String(Math.floor(diffDays / 365)))
  }

  const handleUpdatePatient = async (updates: Partial<any>) => {
    const clinicId = currentClinicId ?? (patient as { clinic_id?: string })?.clinic_id
    const updatedPatient = await updatePatient(patientId, updates, clinicId)
    setPatient(updatedPatient)
    return updatedPatient
  }

  return {
    loading,
    patient,
    progressMetrics,
    setProgressMetrics,
    metricsToRecord,
    checklistItems,
    enabledMedicalConditions,
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
