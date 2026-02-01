"use client"

import React, { useState, useEffect } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useLocale } from "@/contexts/locale-context"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Select } from "@/components/Select"
import { Textarea } from "@/components/Textarea"
import { mockUsers } from "@/data/mock/users-clinics"
import { mockData } from "@/data/mock/mock-data"
import { PatientSelector, type Patient } from "@/components/shared/PatientSelector"
import type { CreateTaskPayload, TaskType } from "./tasks.types"

function toPatientOption(p: (typeof mockData.patients)[number]): Patient {
  return {
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    phone: p.phone,
    email: p.email,
  }
}

interface AddTaskDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CreateTaskPayload) => Promise<void>
  defaultAssignedToUserId?: string
  defaultPatientId?: string
  currentUserId: string
  clinicId: string
}

export function AddTaskDrawer({
  open,
  onOpenChange,
  onSubmit,
  defaultAssignedToUserId,
  defaultPatientId,
  currentUserId,
  clinicId,
}: AddTaskDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<TaskType>("follow_up")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [assignedToUserId, setAssignedToUserId] = useState<string>(defaultAssignedToUserId || "")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    if (!defaultPatientId) return null
    const p = mockData.patients.find((x) => x.id === defaultPatientId)
    return p ? toPatientOption(p) : null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableUsers = mockUsers

  // When user clears the patient we don't re-apply the default
  const [userClearedPatient, setUserClearedPatient] = useState(false)

  // When drawer opens with defaultPatientId, pass the patient so PatientSelector shows it as selected on first render
  const effectiveInitialPatient =
    selectedPatient ??
    (open && defaultPatientId && !userClearedPatient
      ? (() => {
          const p = mockData.patients.find((x) => x.id === defaultPatientId)
          return p ? toPatientOption(p) : null
        })()
      : null)

  useEffect(() => {
    if (open) {
      setTitle("")
      setDescription("")
      setType("follow_up")
      setDueDate(undefined)
      setAssignedToUserId(defaultAssignedToUserId || "")
      setUserClearedPatient(false)
      if (defaultPatientId) {
        const p = mockData.patients.find((x) => x.id === defaultPatientId)
        setSelectedPatient(p ? toPatientOption(p) : null)
      } else {
        setSelectedPatient(null)
      }
    }
  }, [open, defaultAssignedToUserId, defaultPatientId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        dueDate: dueDate?.toISOString(),
        assignedToUserId: assignedToUserId || undefined,
        patientId: selectedPatient?.id || undefined,
        clinicId,
        createdByUserId: currentUserId,
      })
      onOpenChange(false)
    } catch (error) {
      // Error handling would go here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>{t.tasks.addTaskTitle}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t.tasks.taskTitle} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.tasks.taskTitlePlaceholder}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t.tasks.taskDescription}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.tasks.taskDescriptionPlaceholder}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">{t.tasks.taskType}</Label>
                <Select id="type" value={type} onChange={(e) => setType(e.target.value as TaskType)}>
                  <option value="follow_up">{t.tasks.typeFollowUp}</option>
                  <option value="appointment">{t.tasks.typeAppointment}</option>
                  <option value="labs">{t.tasks.typeLabs}</option>
                  <option value="scan">{t.tasks.typeScan}</option>
                  <option value="billing">{t.tasks.typeBilling}</option>
                  <option value="other">{t.tasks.typeOther}</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">{t.tasks.assignTo}</Label>
                <Select
                  id="assignedTo"
                  value={assignedToUserId}
                  onChange={(e) => setAssignedToUserId(e.target.value)}
                >
                  <option value="">{t.tasks.unassigned}</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.role === "doctor" ? t.common.doctor : user.role === "assistant" ? t.common.assistant : t.common.manager})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient">{t.tasks.patientLabel} {defaultPatientId ? t.tasks.patientPrefilled : t.tasks.patientOptional}</Label>
                <PatientSelector
                  initialPatient={effectiveInitialPatient}
                  onPatientSelect={(p) => {
                    setSelectedPatient(p ?? null)
                    if (p) setUserClearedPatient(false)
                    else setUserClearedPatient(true)
                  }}
                  searchOnly
                  required={false}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">{t.tasks.dueDate}</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setDueDate(value ? new Date(value) : undefined)
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                {t.common.cancel}
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!title.trim()} className="flex-[2]">
                {t.tasks.createTask}
              </Button>
            </div>
          </form>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
