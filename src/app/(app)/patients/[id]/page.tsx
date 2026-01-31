"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Card, CardContent } from "@/components/Card"
import { PageSkeleton } from "@/components/skeletons"
import { useDemo } from "@/contexts/demo-context"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { mockData, mockAppointments } from "@/data/mock/mock-data"

// Import new components
import { HorizontalTabNav, Tab, MobileAddButton } from "@/components/patient/HorizontalTabNav"
import { ClinicalNotesTab } from "@/components/patient/ClinicalNotesTab"
import { DoctorTab } from "@/components/patient/DoctorTab"
import { FilesTab } from "@/components/patient/FilesTab"
import { PatientHistoryTab } from "@/components/patient/PatientHistoryTab"
import { InvoicesTab } from "@/components/patient/InvoicesTab"
import { AddTaskDrawer } from "@/features/tasks/AddTaskDrawer"
import { TasksCards } from "@/features/tasks/TasksCards"
import { createTask, listTasks, updateTaskStatus } from "@/features/tasks/tasks.api"
import { isOverdue } from "@/features/tasks/tasks.utils"
import type { CreateTaskPayload, TaskListItem } from "@/features/tasks/tasks.types"
import { listInvoices } from "@/api/invoices.api"
import { update as updatePatient } from "@/api/patients.api"
import { getByPatientId as getNotesByPatientId } from "@/api/notes.api"
import { getProgressByPatientId } from "@/api/progress.api"
import { getClinicSettings } from "@/api/settings.api"
import type { ProgressMetric } from "@/types/progress"
import { getMetricsToRecord } from "@/types/progress"
import { useToast } from "@/hooks/useToast"
import { AddPrescriptionDrawer } from "@/features/prescriptions/AddPrescriptionDrawer"
import { AddPastMedicationDrawer } from "@/components/patient/AddPastMedicationDrawer"
import { AddWeightDrawer, type AddWeightPayload } from "@/components/patient/AddWeightDrawer"
import { AddFileDrawer } from "@/components/patient/AddFileDrawer"
import { InvoiceDrawer, type PatientAppointment } from "@/features/accounting/components/InvoiceDrawer"
import { getDraftDueTotalForPatient } from "@/api/draft-due.api"
import { createPrescription, getPastMedicationsByPatient, createPastMedication } from "@/features/prescriptions/prescriptions.api"
import type { CreatePrescriptionPayload, CreatePastMedicationPayload } from "@/features/prescriptions/prescriptions.types"
import {
  RiUserLine,
  RiFolderLine,
  RiTaskLine,
  RiHistoryLine,
  RiStethoscopeLine,
  RiMoneyDollarCircleLine,
} from "@remixicon/react"

function orderProgressMetricsByTracked(
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

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isDemoMode } = useDemo()
  const { currentUser, currentClinic, role } = useUserClinic()
  const patientId = params.id as string

  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<string>("note")
  const [showAddTaskDrawer, setShowAddTaskDrawer] = useState(false)
  const [showAddPrescriptionDrawer, setShowAddPrescriptionDrawer] = useState(false)
  const [showAddPastMedicationDrawer, setShowAddPastMedicationDrawer] = useState(false)
  const [showAddWeightDrawer, setShowAddWeightDrawer] = useState(false)
  const [showUploadFileDrawer, setShowUploadFileDrawer] = useState(false)
  const [showInvoiceDrawer, setShowInvoiceDrawer] = useState(false)
  const [invoicesRefreshTrigger, setInvoicesRefreshTrigger] = useState(0)

  // Data for tabs
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetric[]>([])
  const [enabledProgressMetricIds, setEnabledProgressMetricIds] = useState<string[]>([])
  const [, setMedications] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [labResults, setLabResults] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [tasks, setTasks] = useState<TaskListItem[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [scanExtractions, setScanExtractions] = useState<any[]>([])
  const [, setTranscriptions] = useState<any[]>([])
  const [pastMedications, setPastMedications] = useState<any[]>([])
  const [totalDue, setTotalDue] = useState<number>(0)
  const { showToast } = useToast()

  useEffect(() => {
    fetchPatientData()
    fetchDueTotal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, isDemoMode])

  useEffect(() => {
    if (patientId) {
      fetchTasks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, isDemoMode])

  useEffect(() => {
    const clinicId = currentClinic?.id
    if (!clinicId) return
    getClinicSettings(clinicId).then((settings) => {
      setEnabledProgressMetricIds(settings.enabledProgressMetricIds ?? [])
    })
  }, [currentClinic?.id])

  const defaultMetricIds = useMemo(
    () => ["weight", "bmi", "bp", "pulse", "blood_sugar"],
    []
  )
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

        // Load all related data
        getProgressByPatientId(patientId).then((res) => setProgressMetrics(res.metrics))
        setMedications(mockData.medications.filter((m) => m.patient_id === patientId))
        setPrescriptions(mockData.prescriptions.filter((p) => p.patientId === patientId))
        setLabResults(mockData.labResults.filter((l) => l.patient_id === patientId))
        setAppointments(mockData.appointments.filter((a) => a.patient_id === patientId))
        setNotes(mockData.doctorNotes.filter((n) => n.patient_id === patientId))
        setAttachments(mockData.attachments.filter((a) => a.patient_id === patientId))
        setScanExtractions(mockData.scanExtractions.filter((s) => s.patient_id === patientId))
        setTranscriptions(mockData.transcriptions.filter((t) => t.patient_id === patientId))
        setPastMedications(mockData.pastMedications.filter((m) => m.patientId === patientId))
      } else {
        router.push("/patients")
      }
      setLoading(false)
      return
    }

    // TODO: Fetch from Supabase when integrated
    setLoading(false)
  }

  const fetchDueTotal = async () => {
    try {
      const clinicId = currentClinic?.id || "clinic-001"
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

  const handleCreateTask = async (payload: CreateTaskPayload) => {
    try {
      await createTask(payload)
      // Refresh tasks
      await fetchTasks()
      showToast("Task created successfully", "success")
      // Switch to tasks tab to show the newly added task
      setActiveTab("tasks")
    } catch (error) {
      console.error("Failed to create task:", error)
      showToast("Failed to create task", "error")
      throw error
    }
  }

  const fetchTasks = async () => {
    try {
      const clinicId = currentClinic?.id || "clinic-001"
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

  const handleToggleTaskStatus = async (taskId: string) => {
    if (isDemoMode) {
      setTasks(
        tasks.map((t) => {
          if (t.id === taskId) {
            const isDone = t.status === "done"
            return { ...t, status: isDone ? "pending" : "done" }
          }
          return t
        })
      )
      return
    }

    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const isDone = task.status === "done"
      const newStatus = isDone ? "pending" : "done"

      await updateTaskStatus({ id: taskId, status: newStatus })
      await fetchTasks()
    } catch (error) {
      console.error("Failed to toggle task status:", error)
      showToast("Failed to update task status", "error")
    }
  }

  const handleUpdatePatient = async (updates: Partial<any>) => {
    try {
      const updatedPatient = await updatePatient(patientId, updates)
      setPatient(updatedPatient)
      // Also update in mockData if patient exists there
      const mockIndex = mockData.patients.findIndex((p) => p.id === patientId)
      if (mockIndex !== -1) {
        mockData.patients[mockIndex] = updatedPatient as any
      }
      showToast("Patient information updated successfully", "success")
    } catch (error) {
      console.error("Failed to update patient:", error)
      showToast("Failed to update patient information", "error")
      throw error
    }
  }

  if (loading) {
    return <PageSkeleton showHeader contentBlocks={2} />
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Patient Not Found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The patient you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/patients">
            <Button className="mt-4">Back to Patients</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calculate last visited date
  const getLastVisited = () => {
    // First try to use last_visit_at from patient
    if (patient.last_visit_at) {
      return patient.last_visit_at
    }
    // Otherwise, use the most recent appointment
    if (appointments.length > 0) {
      const sortedAppointments = [...appointments].sort(
        (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
      )
      return sortedAppointments[0].scheduled_at
    }
    return null
  }

  const lastVisited = getLastVisited()
  const formatLastVisited = (dateString: string | null) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  // Patient is "now" in today's queue (first in queue) – show green live indicator on profile
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

  // Define tabs: first = Note (stethoscope), second = Profile (user, contains general + dr content)
  const tabs: Tab[] = [
    { id: "note", label: "Note", icon: RiStethoscopeLine },
    { id: "profile", label: "Profile", icon: RiUserLine },
    { id: "tasks", label: "Tasks", icon: RiTaskLine },
    { id: "files", label: "Files", icon: RiFolderLine },
    { id: "invoices", label: "Invoices", icon: RiMoneyDollarCircleLine },
    { id: "history", label: "History", icon: RiHistoryLine },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-3xl">
              {`${patient.first_name} ${patient.last_name}`}
            </h1>
            {isNowInQueue && (
              <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                live
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
            <Badge
              variant="neutral"
              className="shrink-0 bg-gray-900 text-white text-xs font-medium dark:bg-gray-800 dark:text-gray-100"
            >
              {patient.age != null ? `${patient.age}y` : "Age N/A"} • {patient.gender}
            </Badge>
            {totalDue > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <RiMoneyDollarCircleLine className="size-3.5" />
                Due: {totalDue.toFixed(2)} EGP
              </span>
            )}
          </div>
          {lastVisited && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last visit: {formatLastVisited(lastVisited)}
            </p>
          )}
        </div>
        <div className="shrink-0 sm:hidden">
          <MobileAddButton
            onAddNote={() => setActiveTab("note")}
            onAddMedication={() => setShowAddPrescriptionDrawer(true)}
            onAddTask={() => setShowAddTaskDrawer(true)}
            onAddFile={() => {
              setActiveTab("files")
              setShowUploadFileDrawer(true)
            }}
            onAddCharge={() => setShowInvoiceDrawer(true)}
          />
        </div>
      </div>

      {/* Horizontal Tab Navigation */}
      <HorizontalTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
        onAddNote={() => setActiveTab("note")}
        onAddMedication={() => setShowAddPrescriptionDrawer(true)}
        onAddTask={() => setShowAddTaskDrawer(true)}
        onAddFile={() => {
          setActiveTab("files")
          setShowUploadFileDrawer(true)
        }}
        onAddCharge={() => setShowInvoiceDrawer(true)}
      />

      {/* Tab Content */}
      <div>
        {activeTab === "note" && (
          <ClinicalNotesTab
            metricsToRecord={metricsToRecord}
            onSaveNote={(_note) => {
              // TODO: Implement save note
            }}
          />
        )}
        {activeTab === "profile" && (
          <DoctorTab
            patient={patient}
            notes={notes}
            progressMetrics={orderProgressMetricsByTracked(progressMetrics, [])}
            pastMedications={pastMedications}
            prescriptions={prescriptions}
            onAddPastMedication={() => setShowAddPastMedicationDrawer(true)}
            onAddPrescription={() => setShowAddPrescriptionDrawer(true)}
            onAddWeightLog={() => setShowAddWeightDrawer(true)}
            onNoteAdded={async () => {
              if (isDemoMode) {
                setNotes(mockData.doctorNotes.filter((n) => n.patient_id === patientId))
              } else {
                const list = await getNotesByPatientId(patientId)
                setNotes(list.map((n) => ({ id: n.id, patient_id: n.patientId, note: n.note, created_at: n.createdAt })))
              }
            }}
            onUpdatePatient={handleUpdatePatient}
          />
        )}
        {activeTab === "files" && (
          <FilesTab
            labResults={labResults}
            attachments={attachments}
            scanExtractions={scanExtractions}
            onDeleteAttachment={(attachmentId) => {
              if (isDemoMode) {
                const idx = mockData.attachments.findIndex((a) => a.id === attachmentId)
                if (idx >= 0) mockData.attachments.splice(idx, 1)
                setAttachments(mockData.attachments.filter((a) => a.patient_id === patientId))
              }
            }}
            onExtractLab={(_attachmentId) => {
              // TODO: Call API to extract lab from file; for demo no-op
            }}
            onExtractScan={(attachmentId, text) => {
              if (isDemoMode && text.trim()) {
                const newExtraction = {
                  id: `scan-ext-${Date.now()}`,
                  attachment_id: attachmentId,
                  patient_id: patientId,
                  text: text.trim(),
                  extracted_at: new Date().toISOString(),
                }
                mockData.scanExtractions.push(newExtraction as any)
                setScanExtractions(mockData.scanExtractions.filter((s) => s.patient_id === patientId))
                showToast("Scan note saved", "success")
              }
            }}
          />
        )}
        {activeTab === "tasks" && (() => {
          const inProgressTasks = tasks
            .filter((t) => t.status !== "done" && t.status !== "cancelled")
            .sort((a, b) => {
              const aOverdue = isOverdue(a.dueDate)
              const bOverdue = isOverdue(b.dueDate)
              if (aOverdue && !bOverdue) return -1
              if (!aOverdue && bOverdue) return 1
              return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime()
            })
          if (inProgressTasks.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
                <RiTaskLine className="size-10 text-gray-400 dark:text-gray-500 shrink-0" aria-hidden />
                <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">No in-progress tasks for this patient.</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Completed tasks are shown in the History tab.</p>
              </div>
            )
          }
          return (
            <TasksCards
              tasks={inProgressTasks}
              onMarkDone={(task) => handleToggleTaskStatus(task.id)}
              onAssign={() => {}}
              role={role}
            />
          )
        })()}
        <AddTaskDrawer
          open={showAddTaskDrawer}
          onOpenChange={setShowAddTaskDrawer}
          onSubmit={handleCreateTask}
          defaultPatientId={patientId}
          currentUserId={currentUser?.id || "user-001"}
          clinicId={currentClinic?.id || "clinic-001"}
        />
        <AddPrescriptionDrawer
          open={showAddPrescriptionDrawer}
          onOpenChange={setShowAddPrescriptionDrawer}
          onSubmit={async (payload: CreatePrescriptionPayload) => {
            try {
              await createPrescription(payload)
              // Refresh prescriptions
              if (isDemoMode) {
                setPrescriptions(mockData.prescriptions.filter((p) => p.patientId === patientId))
              } else {
                // TODO: Fetch from API when integrated
              }
              showToast("Prescription created successfully", "success")
              setActiveTab("profile")
            } catch (error) {
              console.error("Failed to create prescription:", error)
              showToast("Failed to create prescription", "error")
              throw error
            }
          }}
          patientId={patientId}
          clinicId={currentClinic?.id || "clinic-001"}
          doctorId={currentUser?.id}
        />
        <AddFileDrawer
          open={showUploadFileDrawer}
          onOpenChange={setShowUploadFileDrawer}
          onUpload={(files, kind, thumbnails) => {
            if (isDemoMode) {
              const uploadedBy = currentUser?.full_name ?? "Dr. Ahmed Hassan"
              const now = new Date().toISOString()
              Array.from(files).forEach((file, i) => {
                const newAttachment = {
                  id: `attach-${Date.now()}-${i}`,
                  patient_id: patientId,
                  file_name: file.name,
                  file_type: file.type || "application/octet-stream",
                  file_size: file.size,
                  file_url: `/attachments/${file.name}`,
                  uploaded_at: now,
                  uploaded_by: uploadedBy,
                  attachment_kind: kind,
                  thumbnail_url: thumbnails?.[file.name],
                }
                mockData.attachments.push(newAttachment as any)
              })
              setAttachments(mockData.attachments.filter((a) => a.patient_id === patientId))
              showToast(`${files.length} file(s) uploaded`, "success")
            } else {
              // TODO: POST to API with kind and thumbnails
            }
          }}
        />
        <AddPastMedicationDrawer
          open={showAddPastMedicationDrawer}
          onOpenChange={setShowAddPastMedicationDrawer}
          onSubmit={async (payload: CreatePastMedicationPayload) => {
            try {
              const newMed = await createPastMedication(payload)
              if (isDemoMode) {
                setPastMedications([newMed, ...pastMedications])
                mockData.pastMedications.push(newMed as any)
              } else {
                const meds = await getPastMedicationsByPatient(patientId)
                setPastMedications(meds)
              }
              showToast("Past medication added successfully", "success")
            } catch (error) {
              console.error("Failed to add past medication:", error)
              showToast("Failed to add past medication", "error")
              throw error
            }
          }}
          patientId={patientId}
        />
        <AddWeightDrawer
          open={showAddWeightDrawer}
          onOpenChange={setShowAddWeightDrawer}
          patientId={patientId}
          onSubmit={async (payload: AddWeightPayload) => {
            if (isDemoMode) {
              const newLog = {
                id: `weight-${Date.now()}`,
                patient_id: payload.patientId,
                weight: payload.weight,
                recorded_date: payload.recordedDate,
                notes: payload.notes ?? null,
              }
              mockData.weightLogs.push(newLog as any)
              const res = await getProgressByPatientId(patientId)
              setProgressMetrics(res.metrics)
            }
            showToast("Weight recorded successfully", "success")
          }}
        />
        <InvoiceDrawer
          open={showInvoiceDrawer}
          onOpenChange={setShowInvoiceDrawer}
          onSuccess={() => {
            fetchDueTotal()
            setInvoicesRefreshTrigger((n) => n + 1)
          }}
          mode="update-due-only"
          patientId={patientId}
          patientAppointments={appointments as PatientAppointment[]}
        />
        {activeTab === "invoices" && (
          <InvoicesTab
            patientId={patientId}
            clinicId={patient.clinic_id || currentClinic?.id || "clinic-001"}
            refreshTrigger={invoicesRefreshTrigger}
          />
        )}
        {activeTab === "history" && (
          <Card>
            <CardContent className="p-6">
              <PatientHistoryTab
                clinicId={patient.clinic_id || "clinic-001"}
                patientId={patientId}
                appointments={appointments}
                tasks={tasks}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
