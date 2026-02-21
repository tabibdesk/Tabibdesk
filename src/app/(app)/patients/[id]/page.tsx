"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { PageSkeleton } from "@/components/skeletons"
import { useDemo } from "@/contexts/demo-context"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { mockData } from "@/data/mock/mock-data"
import { HorizontalTabNav, Tab, MobileAddButton } from "@/features/patients/detail/HorizontalTabNav"
import { ClinicalNotesTab } from "@/features/patients/detail/ClinicalNotesTab"
import { ProfileTab } from "@/features/patients/detail/ProfileTab"
import { FilesTab } from "@/features/patients/detail/FilesTab"
import { PatientHistoryTab } from "@/features/patients/detail/PatientHistoryTab"
import { InvoicesTab } from "@/features/patients/detail/InvoicesTab"
import { PatientEmptyState } from "@/features/patients/detail/PatientEmptyState"
import { AddTaskDrawer } from "@/features/tasks/AddTaskDrawer"
import { TasksCards } from "@/features/tasks/TasksCards"
import { AssignModal } from "@/features/tasks/TaskModals"
import {
  createTask,
  updateTaskStatus,
  assignTask,
  snoozeTask,
  createFollowUpTask,
} from "@/features/tasks/tasks.api"
import { isOverdue } from "@/features/tasks/tasks.utils"
import type { CreateTaskPayload } from "@/features/tasks/tasks.types"
import { getByPatientId as getNotesByPatientId } from "@/api/notes.api"
import { getReactivationRules } from "@/api/settings.api"
import { markPatientCold } from "@/api/patients.api"
import { getProgressByPatientId } from "@/api/progress.api"
import { useToast } from "@/hooks/useToast"
import { AddPrescriptionDrawer } from "@/features/prescriptions/AddPrescriptionDrawer"
import { AddPastMedicationDrawer } from "@/features/patients/detail/AddPastMedicationDrawer"
import { AddWeightDrawer, type AddWeightPayload } from "@/features/patients/detail/AddWeightDrawer"
import { AddFileDrawer } from "@/features/patients/detail/AddFileDrawer"
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
  RiCalendarLine,
} from "@remixicon/react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { usePatientPageData, orderProgressMetricsByTracked } from "./usePatientPageData"
import { PatientPageHeader } from "./PatientPageHeader"

export default function PatientDetailPage() {
  const params = useParams()
  const t = useAppTranslations()
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
  const [assignTaskData, setAssignTaskData] = useState<import("@/features/tasks/tasks.types").TaskListItem | null>(null)

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
    fetchDueTotal,
    fetchPatientData,
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

  const handleMarkDone = async (task: import("@/features/tasks/tasks.types").TaskListItem) => {
    if (isDemoMode) {
      setTasks(
        tasks.map((t) => (t.id === task.id ? { ...t, status: "done" } : t))
      )
      return
    }
    try {
      await updateTaskStatus({ id: task.id, status: "done" })
      await fetchTasks()
    } catch (error) {
      console.error("Failed to toggle task status:", error)
      showToast("Failed to update task status", "error")
    }
  }

  const handleAssign = async (result: { assignedToUserId?: string; assignedToPatientId?: string }) => {
    if (!assignTaskData) return
    try {
      await assignTask({
        id: assignTaskData.id,
        assignedToUserId: result.assignedToUserId,
        assignedToPatientId: result.assignedToPatientId,
      })
      await fetchTasks()
      setAssignTaskData(null)
      showToast("Task assigned successfully", "success")
    } catch (error) {
      console.error("Failed to assign task:", error)
      showToast("Failed to assign task", "error")
      throw error
    }
  }

  const handleSnooze = async (task: import("@/features/tasks/tasks.types").TaskListItem, days: number) => {
    try {
      const snoozeDate = new Date()
      snoozeDate.setDate(snoozeDate.getDate() + days)
      await snoozeTask(task.id, snoozeDate.toISOString())
      await fetchTasks()
    } catch (error) {
      console.error("Failed to snooze task:", error)
      showToast("Failed to snooze task", "error")
    }
  }

  const handleNextAttempt = async (task: import("@/features/tasks/tasks.types").TaskListItem) => {
    if (!task.follow_up_kind || !task.entity_id || !task.patientId) return
    const clinicId = currentClinic?.id || "clinic-001"
    const currentUserId = currentUser?.id || "user-001"
    try {
      const rules = await getReactivationRules(clinicId)
      const nextAttempt = (task.attempt || 1) + 1
      if (nextAttempt > rules.maxAttempts) {
        if (rules.markColdAfterMaxAttempts) {
          await markPatientCold(task.patientId)
        }
        await updateTaskStatus({ id: task.id, status: "done" })
        await fetchTasks()
        return
      }
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + rules.daysBetweenAttempts)
      await createFollowUpTask({
        title: "Follow-up",
        type: "follow_up",
        clinicId,
        patientId: task.patientId,
        appointmentId: task.entity_id,
        kind: task.follow_up_kind as "cancelled" | "no_show",
        dueDate: dueDate.toISOString(),
        dueAt: dueDate.toISOString(),
        attempt: nextAttempt,
        createdByUserId: currentUserId,
      })
      await updateTaskStatus({ id: task.id, status: "done" })
      await fetchTasks()
    } catch (error) {
      console.error("Failed to create next attempt:", error)
      showToast("Failed to create next attempt", "error")
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
            <Button className="mt-4">{t.patients.backToPatients}</Button>
          </Link>
        </div>
      </div>
    )
  }

  const lastVisited = getLastVisited()
  const tabs: Tab[] = [
    { id: "note", label: t.patients.note, icon: RiStethoscopeLine },
    { id: "profile", label: t.patients.profile, icon: RiUserLine },
    { id: "tasks", label: t.patients.tasks, icon: RiTaskLine },
    { id: "files", label: t.patients.files, icon: RiFolderLine },
    { id: "invoices", label: t.patients.invoices, icon: RiMoneyDollarCircleLine },
    { id: "history", label: t.patients.history, icon: RiHistoryLine },
  ]

  return (
    <div className="page-content">
      <div className="!mt-0 space-y-0">
        <div className="flex flex-row items-start justify-between gap-4 pt-3 rtl:flex-row-reverse">
          <PatientPageHeader patient={patient} isNowInQueue={!!isNowInQueue} />
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
      </div>

      {activeTab === "profile" && (lastVisited || totalDue > 0) && (
        <div className="mt-3 mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          {lastVisited && (
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <RiCalendarLine className="size-3.5 shrink-0" />
              {t.profile.lastVisitLabel} {formatLastVisited(lastVisited)}
            </span>
          )}
          {totalDue > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <RiMoneyDollarCircleLine className="size-3.5" />
              Due: {totalDue.toFixed(2)} EGP
            </span>
          )}
        </div>
      )}

      <div>
        {activeTab === "note" && (
          <ClinicalNotesTab
            checklistItems={checklistItems}
            metricsToRecord={metricsToRecord}
            onSaveNote={(_note) => {}}
            patient={patient}
            onUpdatePatient={handleUpdatePatientWithToast}
            enabledMedicalConditions={enabledMedicalConditions}
          />
        )}
        {activeTab === "profile" && (
          <ProfileTab
            patient={patient}
            notes={notes}
            enabledMedicalConditions={enabledMedicalConditions}
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
                    patient_id: n.patient_id,
                    note: n.note,
                    created_at: n.created_at,
                  }))
                )
              }
            }}
            onUpdatePatient={handleUpdatePatientWithToast}
            onRefreshAiSummary={fetchPatientData}
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
              <PatientEmptyState
                icon={RiTaskLine}
                title={t.profile.noInProgressTasksPatient}
                description={t.profile.completedTasksInHistoryDesc}
              />
            )
          }
          return (
            <TasksCards
              tasks={inProgressTasks}
              onMarkDone={handleMarkDone}
              onAssign={(task) => setAssignTaskData(task)}
              onSnooze={handleSnooze}
              onNextAttempt={handleNextAttempt}
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
        <AssignModal
          isOpen={!!assignTaskData}
          onClose={() => setAssignTaskData(null)}
          onSubmit={handleAssign}
          task={assignTaskData}
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
          <PatientHistoryTab
            clinicId={patient.clinic_id || "clinic-001"}
            patientId={patientId}
            appointments={appointments}
            tasks={tasks}
          />
        )}
      </div>
    </div>
  )
}
