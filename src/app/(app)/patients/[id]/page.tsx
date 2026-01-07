"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { RiArrowLeftLine } from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"
import * as mockData from "@/data/mock/mock-data"

// Import new components
import { PatientHeader } from "@/components/patient/PatientHeader"
import { HistorySidebar, HistoryTab } from "@/components/patient/HistorySidebar"
import { GeneralTab } from "@/components/patient/GeneralTab"
import { MedicationsTab } from "@/components/patient/MedicationsTab"
import { LabResultsTab } from "@/components/patient/LabResultsTab"
import { ProgressTab } from "@/components/patient/ProgressTab"
import { AppointmentsTab } from "@/components/patient/AppointmentsTab"
import { TasksTab } from "@/components/patient/TasksTab"
import { NotesTab } from "@/components/patient/NotesTab"
import { TranscriptionsTab } from "@/components/patient/TranscriptionsTab"
import { AttachmentsTab } from "@/components/patient/AttachmentsTab"
import { DietTab } from "@/components/patient/DietTab"

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isDemoMode } = useDemo()
  const patientId = params.id as string

  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<HistoryTab>("general")

  // Data for tabs
  const [weightLogs, setWeightLogs] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [labResults, setLabResults] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [transcriptions, setTranscriptions] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [diets, setDiets] = useState<any[]>([])

  useEffect(() => {
    fetchPatientData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, isDemoMode])

  const fetchPatientData = async () => {
    setLoading(true)

    if (isDemoMode) {
      const foundPatient = mockData.mockPatients.find((p) => p.id === patientId)
      if (foundPatient) {
        setPatient(foundPatient)

        // Load all related data
        setWeightLogs(mockData.mockWeightLogs.filter((w) => w.patient_id === patientId))
        setMedications(mockData.mockMedications.filter((m) => m.patient_id === patientId))
        setLabResults(mockData.mockLabResults.filter((l) => l.patient_id === patientId))
        setAppointments(mockData.mockAppointments.filter((a) => a.patient_id === patientId))
        setTasks(mockData.mockTasks.filter((t) => t.patient_id === patientId))
        setNotes(mockData.mockDoctorNotes.filter((n) => n.patient_id === patientId))
        setTranscriptions(mockData.mockTranscriptions.filter((t) => t.patient_id === patientId))
        setAttachments(mockData.mockAttachments.filter((a) => a.patient_id === patientId))
        setDiets(mockData.mockPatientDiets.filter((d) => d.patient_id === patientId))
      } else {
        router.push("/patients")
      }
      setLoading(false)
      return
    }

    // TODO: Fetch from Supabase when integrated
    setLoading(false)
  }


  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
        <div className="h-10 w-48 animate-pulse rounded bg-gray-100 dark:bg-gray-800"></div>
        <div className="mt-6 h-64 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
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

  return (
    <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
      {/* Back Navigation */}
      <div className="mb-2">
        <Link href="/patients">
          <Button variant="ghost">
            <RiArrowLeftLine className="mr-2 size-4" />
            Back to Patients
          </Button>
        </Link>
      </div>

      {/* Patient Header */}
      <div className="mb-3">
        <PatientHeader
          patient={patient}
          onAddAppointment={() => {
            // TODO: Open appointment booking
            router.push("/appointments/book")
          }}
          onAddNote={() => {
            // TODO: Open note modal
            console.log("Add note")
          }}
          onAddMedication={() => {
            // TODO: Open medication modal
            console.log("Add medication")
          }}
          onAddLabFile={() => {
            // TODO: Open lab file upload modal
            console.log("Upload lab file")
          }}
          onAddTask={() => {
            // TODO: Open task modal
            console.log("Add task")
          }}
          onAddAttachment={() => {
            // TODO: Open attachment upload modal
            setActiveTab("attachments")
          }}
          onEditDiet={() => {
            // TODO: Open diet edit modal
            console.log("Edit diet")
          }}
        />
      </div>

      {/* Content Area - History Tabs */}
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <div className="lg:sticky lg:top-4 lg:h-fit">
          <HistorySidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Content */}
        <div>
          {activeTab === "general" && <GeneralTab patient={patient} />}
          {activeTab === "notes" && (
            <NotesTab
              notes={notes}
              patient={patient}
            />
          )}
          {activeTab === "medications" && (
            <MedicationsTab
              medications={medications}
            />
          )}
          {activeTab === "labs" && (
            <LabResultsTab
              labResults={labResults}
            />
          )}
          {activeTab === "progress" && (
            <ProgressTab
              weightLogs={weightLogs}
            />
          )}
          {activeTab === "appointments" && (
            <AppointmentsTab
              appointments={appointments}
            />
          )}
          {activeTab === "tasks" && (
            <TasksTab
              tasks={tasks}
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
          {activeTab === "transcriptions" && (
            <TranscriptionsTab
              transcriptions={transcriptions}
            />
          )}
          {activeTab === "attachments" && (
            <AttachmentsTab
              attachments={attachments}
              onUpload={(files) => {
                // TODO: Implement file upload
                console.log("Upload files:", files)
              }}
              onDelete={(attachmentId) => {
                // TODO: Implement delete attachment
                console.log("Delete attachment:", attachmentId)
              }}
            />
          )}
          {activeTab === "diet" && (
            <DietTab
              diets={diets}
              onEditDiet={() => {
                // TODO: Implement edit diet modal
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
