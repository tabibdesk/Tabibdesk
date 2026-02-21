"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import { Button } from "@/components/Button"
import { Select } from "@/components/Select"
import { mockUsers } from "@/data/mock/users-clinics"
import { mockData } from "@/data/mock/mock-data"
import { useAppTranslations } from "@/lib/useAppTranslations"
import type { TaskListItem } from "./tasks.types"

/** Staff associated with the task's patient (doctors from appointments + patient's doctor). Falls back to all staff if none found. */
function getStaffForPatient(patientId: string | undefined): typeof mockUsers {
  if (!patientId) return mockUsers
  const patient = mockData.patients.find((p) => p.id === patientId)
  const doctorIds = new Set<string>()
  if (patient?.doctor_id) doctorIds.add(patient.doctor_id)
  mockData.appointments
    .filter((a) => a.patient_id === patientId && a.doctor_id)
    .forEach((a) => doctorIds.add(a.doctor_id!))
  const staff = mockUsers.filter((u) => doctorIds.has(u.id))
  return staff.length > 0 ? staff : mockUsers
}

export interface AssignTaskResult {
  assignedToUserId?: string
  assignedToPatientId?: string
}

interface AssignModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (result: AssignTaskResult) => Promise<void>
  task: TaskListItem | null
}

export function AssignModal({
  isOpen,
  onClose,
  onSubmit,
  task,
}: AssignModalProps) {
  const t = useAppTranslations()
  const [assigneeValue, setAssigneeValue] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableUsers = useMemo(() => getStaffForPatient(task?.patientId), [task?.patientId])
  const taskPatient = useMemo(
    () => (task?.patientId ? mockData.patients.find((p) => p.id === task.patientId) : null),
    [task?.patientId]
  )

  useEffect(() => {
    if (isOpen && task) {
      if (task.assignedToUserId) {
        setAssigneeValue(`user:${task.assignedToUserId}`)
      } else if (task.assignedToPatientId) {
        setAssigneeValue(`patient:${task.assignedToPatientId}`)
      } else {
        setAssigneeValue("")
      }
    } else if (!isOpen) {
      setAssigneeValue("")
      setIsSubmitting(false)
    }
  }, [isOpen, task])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      let assignedToUserId: string | undefined
      let assignedToPatientId: string | undefined
      if (assigneeValue.startsWith("user:")) {
        assignedToUserId = assigneeValue.slice(5) || undefined
      } else if (assigneeValue.startsWith("patient:")) {
        assignedToPatientId = assigneeValue.slice(8) || undefined
      }
      await onSubmit({ assignedToUserId, assignedToPatientId })
      onClose()
    } catch (error) {
      console.error("Failed to assign task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "doctor":
        return t.common.doctor
      case "assistant":
        return t.common.assistant
      case "manager":
        return t.common.manager
      default:
        return role
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.tasks.assignTask}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Select
            id="assignedTo"
            value={assigneeValue}
            onChange={(e) => setAssigneeValue(e.target.value)}
            disabled={isSubmitting}
            className="w-full"
          >
            <option value="">{t.tasks.unassigned}</option>
            {availableUsers.map((user) => (
              <option key={`user-${user.id}`} value={`user:${user.id}`}>
                {user.full_name} ({getRoleLabel(user.role)})
              </option>
            ))}
            {taskPatient && (
              <option key={`patient-${taskPatient.id}`} value={`patient:${taskPatient.id}`}>
                {taskPatient.first_name} {taskPatient.last_name} ({t.tasks.assigneeRolePatient})
              </option>
            )}
          </Select>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" disabled={isSubmitting}>
              {t.common.cancel}
            </Button>
          </DialogClose>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {t.tasks.assign}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
