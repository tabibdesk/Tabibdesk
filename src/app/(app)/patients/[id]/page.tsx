"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Card, CardContent } from "@/components/Card"
import { PageHeader } from "@/components/shared/PageHeader"
import { useDemo } from "@/contexts/demo-context"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { mockData } from "@/data/mock/mock-data"

// Import new components
import { HorizontalTabNav, Tab } from "@/components/patient/HorizontalTabNav"
import { ClinicalNotesTab } from "@/components/patient/ClinicalNotesTab"
import { GeneralTab } from "@/components/patient/GeneralTab"
import { PrescriptionsTab } from "@/components/patient/PrescriptionsTab"
import { FilesTab } from "@/components/patient/FilesTab"
import { TasksTab } from "@/components/patient/TasksTab"
import { PatientHistoryTab } from "@/components/patient/PatientHistoryTab"
import { AddTaskDrawer } from "@/features/tasks/AddTaskDrawer"
import { createTask, listTasks, updateTaskStatus } from "@/features/tasks/tasks.api"
import { listInvoices } from "@/api/invoices.api"
import { update as updatePatient } from "@/api/patients.api"
import { useToast } from "@/hooks/useToast"
import type { CreateTaskPayload } from "@/features/tasks/tasks.types"
import { AddPrescriptionDrawer } from "@/features/prescriptions/AddPrescriptionDrawer"
import { AddPastMedicationModal } from "@/components/patient/AddPastMedicationModal"
import { createPrescription, getPastMedicationsByPatient, createPastMedication } from "@/features/prescriptions/prescriptions.api"
import type { CreatePrescriptionPayload, CreatePastMedicationPayload } from "@/features/prescriptions/prescriptions.types"
import {
  RiFileTextLine,
  RiUserLine,
  RiCapsuleLine,
  RiFolderLine,
  RiTaskLine,
  RiTimeLine,
  RiHistoryLine,
} from "@remixicon/react"

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isDemoMode } = useDemo()
  const { currentUser, currentClinic } = useUserClinic()
  const patientId = params.id as string

  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<string>("clinicalNotes")
  const [showAddTaskDrawer, setShowAddTaskDrawer] = useState(false)
  const [showAddPrescriptionDrawer, setShowAddPrescriptionDrawer] = useState(false)
  const [showAddPastMedicationModal, setShowAddPastMedicationModal] = useState(false)

  // Data for tabs
  const [weightLogs, setWeightLogs] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [labResults, setLabResults] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [transcriptions, setTranscriptions] = useState<any[]>([])
  const [pastMedications, setPastMedications] = useState<any[]>([])
  const [totalDue, setTotalDue] = useState<number>(0)
  const { showToast } = useToast()

  useEffect(() => {
    fetchPatientData()
    fetchUnpaidInvoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, isDemoMode])

  useEffect(() => {
    if (patientId && !isDemoMode) {
      fetchTasks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, isDemoMode])

  const fetchPatientData = async () => {
    setLoading(true)

    if (isDemoMode) {
      const foundPatient = mockData.patients.find((p) => p.id === patientId)
      if (foundPatient) {
        setPatient(foundPatient)

        // Load all related data
        setWeightLogs(mockData.weightLogs.filter((w) => w.patient_id === patientId))
        setMedications(mockData.medications.filter((m) => m.patient_id === patientId))
        setPrescriptions(mockData.prescriptions.filter((p) => p.patientId === patientId))
        setLabResults(mockData.labResults.filter((l) => l.patient_id === patientId))
        setAppointments(mockData.appointments.filter((a) => a.patient_id === patientId))
        setTasks(mockData.tasks.filter((t) => t.patient_id === patientId))
        setNotes(mockData.doctorNotes.filter((n) => n.patient_id === patientId))
        setAttachments(mockData.attachments.filter((a) => a.patient_id === patientId))
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

  const fetchUnpaidInvoices = async () => {
    try {
      const clinicId = currentClinic?.id || currentUser?.clinicId || "clinic-001"
      const result = await listInvoices({
        clinicId,
        patientId,
        status: "unpaid",
        page: 1,
        pageSize: 1000,
      })
      const total = result.invoices.reduce((sum, inv) => sum + inv.amount, 0)
      setTotalDue(total)
    } catch (error) {
      console.error("Failed to fetch unpaid invoices:", error)
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
    if (isDemoMode) {
      // In demo mode, use mockData directly
      const patientTasks = mockData.tasks.filter((t) => t.patient_id === patientId)
      setTasks(patientTasks)
      return
    }

    try {
      const clinicId = currentClinic?.id || currentUser?.clinicId || "clinic-001"
      const response = await listTasks({
        clinicId,
        status: "all",
        page: 1,
        pageSize: 1000,
      })
      // Filter tasks for this patient
      const patientTasks = response.tasks.filter((t) => t.patientId === patientId)
      // Convert to the format expected by TasksTab
      setTasks(
        patientTasks.map((t) => ({
          id: t.id,
          patient_id: t.patientId || patientId,
          title: t.title,
          description: t.description || null,
          type: t.type,
          status: t.status,
          due_date: t.dueDate || new Date().toISOString(),
          completed_at: t.status === "done" ? new Date().toISOString() : null,
          ignored_at: null,
          created_at: t.createdAt,
          updated_at: null,
          created_by_name: t.createdByName,
        }))
      )
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    }
  }

  const handleToggleTaskStatus = async (taskId: string) => {
    if (isDemoMode) {
      // In demo mode, update local state
      setTasks(
        tasks.map((t) => {
          if (t.id === taskId) {
            const isDone = t.status === "completed" || t.status === "done"
            return {
              ...t,
              status: isDone ? "pending" : "done",
              completed_at: isDone ? null : new Date().toISOString(),
            }
          }
          return t
        })
      )
      return
    }

    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const isDone = task.status === "completed" || task.status === "done"
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
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
      </div>
    )
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

  // Define tabs
  const tabs: Tab[] = [
    { id: "clinicalNotes", label: "Notes", icon: RiFileTextLine },
    { id: "general", label: "General", icon: RiUserLine },
    { id: "medications", label: "Prescription", icon: RiCapsuleLine },
    { id: "tasks", label: "Tasks", icon: RiTaskLine },
    { id: "files", label: "Files", icon: RiFolderLine },
    { id: "history", label: "History", icon: RiHistoryLine },
  ]

  return (
    <div className="space-y-6">
      {/* PageHeader with Back Navigation */}
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <span>{`${patient.first_name} ${patient.last_name}`}</span>
            <Badge 
              variant="neutral" 
              className="bg-gray-900 text-white text-xs font-medium dark:bg-gray-800 dark:text-gray-100"
            >
              {patient.age ? `${patient.age}y` : "Age N/A"} • {patient.gender}
            </Badge>
            {totalDue > 0 && (
              <Badge 
                variant="destructive" 
                className="text-xs font-medium"
              >
                Due: {totalDue.toFixed(2)} EGP
              </Badge>
            )}
          </div>
        }
        actions={
          lastVisited && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <RiTimeLine className="size-4 shrink-0" />
              <span>Last visited: {formatLastVisited(lastVisited)}</span>
            </div>
          )
        }
      />

      {/* Horizontal Tab Navigation */}
      <HorizontalTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
        onAddNote={() => {
          setActiveTab("clinicalNotes")
        }}
        onAddMedication={() => {
          setShowAddPrescriptionDrawer(true)
        }}
        onAddTask={() => {
          setShowAddTaskDrawer(true)
        }}
        onAddFile={() => {
          setActiveTab("files")
        }}
      />

      {/* Tab Content */}
      <div>
        {activeTab === "clinicalNotes" && (
          <ClinicalNotesTab
            notes={notes}
            transcriptions={transcriptions}
            patient={patient}
            onSaveNote={(note) => {
              // TODO: Implement save note
              console.log("Save note:", note)
            }}
          />
        )}
        {activeTab === "general" && (
          <GeneralTab
            patient={patient}
            weightLogs={weightLogs}
            pastMedications={pastMedications}
            onAddPastMedication={() => {
              setShowAddPastMedicationModal(true)
            }}
            onUpdatePatient={handleUpdatePatient}
          />
        )}
        {activeTab === "medications" && <PrescriptionsTab prescriptions={prescriptions} />}
        {activeTab === "files" && (
          <FilesTab
            labResults={labResults}
            attachments={attachments}
            onUploadAttachment={(files) => {
              // TODO: Implement file upload
              console.log("Upload files:", files)
            }}
            onDeleteAttachment={(attachmentId) => {
              // TODO: Implement delete attachment
              console.log("Delete attachment:", attachmentId)
            }}
          />
        )}
        {activeTab === "tasks" && (
          <TasksTab
            tasks={tasks}
            patientId={patientId}
            onToggleStatus={handleToggleTaskStatus}
            onEditTask={(taskId) => {
              // TODO: Open edit task modal
              console.log("Edit task:", taskId)
            }}
            onDeleteTask={(taskId) => {
              // TODO: Open delete confirmation modal
              console.log("Delete task:", taskId)
            }}
          />
        )}
        <AddTaskDrawer
          open={showAddTaskDrawer}
          onOpenChange={setShowAddTaskDrawer}
          onSubmit={handleCreateTask}
          defaultPatientId={patientId}
          currentUserId={currentUser?.id || "user-001"}
          clinicId={currentClinic?.id || currentUser?.clinicId || "clinic-001"}
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
              // Switch to prescriptions tab to show the newly added prescription
              setActiveTab("medications")
            } catch (error) {
              console.error("Failed to create prescription:", error)
              showToast("Failed to create prescription", "error")
              throw error
            }
          }}
          patientId={patientId}
          clinicId={currentClinic?.id || currentUser?.clinicId || "clinic-001"}
          doctorId={currentUser?.id}
        />
        <AddPastMedicationModal
          open={showAddPastMedicationModal}
          onOpenChange={setShowAddPastMedicationModal}
          onSubmit={async (payload: CreatePastMedicationPayload) => {
            try {
              const newMed = await createPastMedication(payload)
              if (isDemoMode) {
                setPastMedications([newMed, ...pastMedications])
                // Also update mockData
                mockData.pastMedications.push(newMed as any)
              } else {
                // Refresh from API
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
