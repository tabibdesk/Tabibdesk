"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { Card, CardContent } from "@/components/Card"
import { PageSkeleton } from "@/components/skeletons"
import { useDemo } from "@/contexts/demo-context"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { mockData } from "@/data/mock/mock-data"
import { HorizontalTabNav, Tab, MobileAddButton } from "@/components/patient/HorizontalTabNav"
import { ClinicalNotesTab } from "@/components/patient/ClinicalNotesTab"
import { ProfileTab } from "@/components/patient/ProfileTab"
import { FilesTab } from "@/components/patient/FilesTab"
import { PatientHistoryTab } from "@/components/patient/PatientHistoryTab"
import { InvoicesTab } from "@/components/patient/InvoicesTab"
import { AddTaskDrawer } from "@/features/tasks/AddTaskDrawer"
import { TasksCards } from "@/features/tasks/TasksCards"
import { createTask, updateTaskStatus } from "@/features/tasks/tasks.api"
import { isOverdue } from "@/features/tasks/tasks.utils"
import type { CreateTaskPayload } from "@/features/tasks/tasks.types"
import { getByPatientId as getNotesByPatientId } from "@/api/notes.api"
import { getProgressByPatientId } from "@/api/progress.api"
import { useToast } from "@/hooks/useToast"
import { AddPrescriptionDrawer } from "@/features/prescriptions/AddPrescriptionDrawer"
import { AddPastMedicationDrawer } from "@/components/patient/AddPastMedicationDrawer"
import { AddWeightDrawer, type AddWeightPayload } from "@/components/patient/AddWeightDrawer"
import { AddFileDrawer } from "@/components/patient/AddFileDrawer"
import { InvoiceDrawer, type PatientAppointment } from "@/features/accounting/components/InvoiceDrawer"
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
import { usePatientPageData, orderProgressMetricsByTracked } from "./usePatientPageData"
import { PatientPageHeader } from "./PatientPageHeader"

export default function PatientDetailPage() {
  const params = useParams()
  const { isDemoMode } = useDemo()
  const { currentUser, currentClinic, role } = useUserClinic()
  const patientId = params.id as string
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<string>("note")
  const [showAddTaskDrawer, setShowAddTaskDrawer] = useState(false)
  const [showAddPrescriptionDrawer, setShowAddPrescriptionDrawer] = useState(false)
  const [showAddPastMedicationDrawer, setShowAddPastMedicationDrawer] = useState(false)
  const [showAddWeightDrawer, setShowAddWeightDrawer] = useState(false)
  const [showUploadFileDrawer, setShowUploadFileDrawer] = useState(false)
  const [showInvoiceDrawer, setShowInvoiceDrawer] = useState(false)
  const [invoicesRefreshTrigger, setInvoicesRefreshTrigger] = useState(0)

  const data = usePatientPageData(
    patientId,
    isDemoMode,
    currentClinic?.id
  )

  const {
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
    fetchDueTotal,
    fetchTasks,
    handleUpdatePatient,
  } = data

  const handleCreateTask = async (payload: CreateTaskPayload) => {
    try {
      await createTask(payload)
      await fetchTasks()
      showToast("Task created successfully", "success")
      setActiveTab("tasks")
    } catch (error) {
      console.error("Failed to create task:", error)
      showToast("Failed to create task", "error")
      throw error
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

  const handleUpdatePatientWithToast = async (updates: Partial<any>) => {
    try {
      await handleUpdatePatient(updates)
      showToast("Patient information updated successfully", "success")
    } catch (error) {
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

  const lastVisited = getLastVisited()
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
        <PatientPageHeader
          patient={patient}
          totalDue={totalDue}
          lastVisited={lastVisited}
          formatLastVisited={formatLastVisited}
          isNowInQueue={!!isNowInQueue}
        />
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

      <div>
        {activeTab === "note" && (
          <ClinicalNotesTab
            metricsToRecord={metricsToRecord}
            onSaveNote={(_note) => {}}
          />
        )}
        {activeTab === "profile" && (
          <ProfileTab
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
                setNotes(
                  list.map((n) => ({
                    id: n.id,
                    patient_id: n.patientId,
                    note: n.note,
                    created_at: n.createdAt,
                  }))
                )
              }
            }}
            onUpdatePatient={handleUpdatePatientWithToast}
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
            onExtractLab={(_attachmentId) => {}}
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
                <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  No in-progress tasks for this patient.
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Completed tasks are shown in the History tab.
                </p>
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
              if (isDemoMode) {
                setPrescriptions(mockData.prescriptions.filter((p) => p.patientId === patientId))
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
