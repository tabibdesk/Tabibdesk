"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { useDemo } from "@/contexts/demo-context"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { mockData } from "@/data/mock/mock-data"

// Import new components
import { HorizontalTabNav, Tab } from "@/components/patient/HorizontalTabNav"
import { ClinicalNotesTab } from "@/components/patient/ClinicalNotesTab"
import { GeneralTab } from "@/components/patient/GeneralTab"
import { MedicationsTab } from "@/components/patient/MedicationsTab"
import { FilesTab } from "@/components/patient/FilesTab"
import { AppointmentsTab } from "@/components/patient/AppointmentsTab"
import { TasksTab } from "@/components/patient/TasksTab"
import { ActivityFeed } from "@/features/activity/ActivityFeed"
import {
  RiFileTextLine,
  RiUserLine,
  RiCapsuleLine,
  RiFolderLine,
  RiTaskLine,
  RiCalendarLine,
  RiTimeLine,
  RiHistoryLine,
} from "@remixicon/react"

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isDemoMode } = useDemo()
  const { currentUser } = useUserClinic()
  const patientId = params.id as string

  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<string>("clinicalNotes")

  // Data for tabs
  const [weightLogs, setWeightLogs] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [labResults, setLabResults] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [transcriptions, setTranscriptions] = useState<any[]>([])

  useEffect(() => {
    fetchPatientData()
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
        setLabResults(mockData.labResults.filter((l) => l.patient_id === patientId))
        setAppointments(mockData.appointments.filter((a) => a.patient_id === patientId))
        setTasks(mockData.tasks.filter((t) => t.patient_id === patientId))
        setNotes(mockData.doctorNotes.filter((n) => n.patient_id === patientId))
        setAttachments(mockData.attachments.filter((a) => a.patient_id === patientId))
        setTranscriptions(mockData.transcriptions.filter((t) => t.patient_id === patientId))
      } else {
        router.push("/patients")
      }
      setLoading(false)
      return
    }

    // TODO: Fetch from Supabase when integrated
    setLoading(false)
  }

  const handleAddTask = (title: string) => {
    const newTask = {
      id: `task-${Date.now()}`,
      patient_id: patientId,
      title,
      description: null,
      type: "other",
      status: "pending",
      due_date: new Date().toISOString(),
      completed_at: null,
      ignored_at: null,
      created_at: new Date().toISOString(),
      updated_at: null,
      created_by_name: currentUser?.full_name || "Doctor",
    }
    setTasks([newTask, ...tasks])
  }

  const handleToggleTaskStatus = (taskId: string) => {
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
    { id: "medications", label: "Medications", icon: RiCapsuleLine },
    { id: "files", label: "Files", icon: RiFolderLine },
    { id: "tasks", label: "Tasks", icon: RiTaskLine },
    { id: "appointments", label: "Appointments", icon: RiCalendarLine },
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
          // TODO: Open note modal
          console.log("Add note")
        }}
        onAddMedication={() => {
          // TODO: Open medication modal
          console.log("Add medication")
        }}
        onAddTask={() => {
          // TODO: Open task modal
          console.log("Add task")
        }}
        onAddLabFile={() => {
          // TODO: Open lab file upload modal
          console.log("Upload lab file")
        }}
        onAddAppointment={() => {
          router.push("/appointments/book")
        }}
        onAddAttachment={() => {
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
        {activeTab === "general" && <GeneralTab patient={patient} weightLogs={weightLogs} />}
        {activeTab === "medications" && <MedicationsTab medications={medications} />}
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
            onAddTask={handleAddTask}
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
        {activeTab === "appointments" && <AppointmentsTab appointments={appointments} />}
        {activeTab === "history" && (
          <Card>
            <CardContent className="p-6">
              <ActivityFeed
                clinicId={patient.clinic_id || "clinic-001"}
                entityId={patientId}
                entityType="patient"
                title="Patient Audit Trail"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
