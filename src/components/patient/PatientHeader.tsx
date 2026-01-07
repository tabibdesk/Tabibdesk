"use client"

import { useState } from "react"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import {
  RiUserLine,
  RiPhoneLine,
  RiCalendarLine,
  RiAddLine,
  RiFlaskLine,
  RiTaskLine,
  RiCapsuleLine,
  RiFileTextLine,
  RiRestaurantLine,
  RiAttachmentLine,
  RiCloseLine,
} from "@remixicon/react"

interface Patient {
  id: string
  first_name: string
  last_name: string
  age: number | null
  gender: string
  phone: string
  date_of_birth: string | null
  created_at: string
  updated_at: string
  // Medical conditions
  is_diabetic: boolean | null
  is_hypertensive: boolean | null
  has_pancreatitis: boolean | null
  is_pregnant: boolean | null
  is_breastfeeding: boolean | null
  has_rheumatoid: boolean | null
  has_ihd: boolean | null
  has_heart_failure: boolean | null
  has_gerd: boolean | null
  has_gastritis: boolean | null
  has_hepatic: boolean | null
  has_anaemia: boolean | null
  has_bronchial_asthma: boolean | null
  // AI diagnosis
  ai_diagnosis: string | null
  ai_diagnosis_updated_at: string | null
}

interface PatientHeaderProps {
  patient: Patient
  onAddLabFile?: () => void
  onAddTask?: () => void
  onAddMedication?: () => void
  onAddNote?: () => void
  onAddAppointment?: () => void
  onAddAttachment?: () => void
  onEditDiet?: () => void
}

export function PatientHeader({
  patient,
  onAddLabFile,
  onAddTask,
  onAddMedication,
  onAddNote,
  onAddAppointment,
  onAddAttachment,
  onEditDiet,
}: PatientHeaderProps) {
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const getConditionBadges = () => {
    const conditions: Array<{ label: string; show: boolean }> = [
      { label: "Hypertension", show: patient.is_hypertensive === true },
      { label: "Obesity", show: false }, // Can add BMI calculation later
      { label: "Diabetes", show: patient.is_diabetic === true },
      { label: "GERD", show: patient.has_gerd === true },
      { label: "Gastritis", show: patient.has_gastritis === true },
      { label: "Anemia", show: patient.has_anaemia === true },
      { label: "Asthma", show: patient.has_bronchial_asthma === true },
      { label: "Rheumatoid", show: patient.has_rheumatoid === true },
      { label: "IHD", show: patient.has_ihd === true },
      { label: "Heart Failure", show: patient.has_heart_failure === true },
      { label: "Pancreatitis", show: patient.has_pancreatitis === true },
      { label: "Hepatic", show: patient.has_hepatic === true },
      { label: "Pregnant", show: patient.is_pregnant === true },
      { label: "Breastfeeding", show: patient.is_breastfeeding === true },
    ]

    return conditions.filter((c) => c.show)
  }

  const badges = getConditionBadges()

  const formatLastVisit = () => {
    if (!patient.updated_at) return "No visits yet"
    const date = new Date(patient.updated_at)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  const conditionBadges = getConditionBadges()
  const chiefComplaint = "Fever and cough" // TODO: Get from patient data

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      {/* Main Header Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        {/* Patient Info */}
        <div className="flex-1">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
              <RiUserLine className="size-6 text-primary-600 dark:text-primary-400" />
            </div>

            {/* Details */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {patient.first_name} {patient.last_name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <RiUserLine className="size-4" />
                  {patient.age}y • {patient.gender}
                </span>
                <span className="flex items-center gap-1">
                  <RiPhoneLine className="size-4" />
                  {patient.phone}
                </span>
                <span className="flex items-center gap-1">
                  <RiCalendarLine className="size-4" />
                  Last: {formatLastVisit()}
                </span>
              </div>

              {/* Medical Conditions & Chief Complaint */}
              {(conditionBadges.length > 0 || chiefComplaint) && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {conditionBadges.map((badge, index) => (
                    <Badge key={index} variant="error" className="text-xs">
                      {badge.label}
                    </Badge>
                  ))}
                  {chiefComplaint && (
                    <Badge variant="default" className="text-xs">
                      <RiUserLine className="mr-1 size-3" />
                      {chiefComplaint}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button with Dropdown */}
        <div className="relative lg:shrink-0">
          <Button
            variant="primary"
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="text-sm"
          >
            {showActionsMenu ? (
              <RiCloseLine className="mr-1.5 size-4" />
            ) : (
              <RiAddLine className="mr-1.5 size-4" />
            )}
            Add
          </Button>

          {showActionsMenu && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950">
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowActionsMenu(false)
                    onAddNote?.()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <RiFileTextLine className="size-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-50">Note</span>
                </button>
                <button
                  onClick={() => {
                    setShowActionsMenu(false)
                    onAddMedication?.()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <RiCapsuleLine className="size-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-50">Prescription</span>
                </button>
                <button
                  onClick={() => {
                    setShowActionsMenu(false)
                    onAddTask?.()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <RiTaskLine className="size-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-50">Task</span>
                </button>
                <button
                  onClick={() => {
                    setShowActionsMenu(false)
                    onAddLabFile?.()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <RiFlaskLine className="size-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-50">Lab File</span>
                </button>
                <button
                  onClick={() => {
                    setShowActionsMenu(false)
                    onAddAppointment?.()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <RiCalendarLine className="size-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-50">Appointment</span>
                </button>
                <button
                  onClick={() => {
                    setShowActionsMenu(false)
                    onAddAttachment?.()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <RiAttachmentLine className="size-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-50">Attachment</span>
                </button>
                <button
                  onClick={() => {
                    setShowActionsMenu(false)
                    onEditDiet?.()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  <RiRestaurantLine className="size-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-50">Diet Plan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

