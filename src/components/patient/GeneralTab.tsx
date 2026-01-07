"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Checkbox } from "@/components/Checkbox"
import { ClinicalNotes } from "./ClinicalNotes"
import { VisitChecklist } from "./VisitChecklist"
import { AIExtractionModal } from "./AIExtractionModal"
import {
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
  RiBriefcaseLine,
  RiRulerLine,
  RiCalendarLine,
  RiRobot2Line,
  RiHeartPulseLine,
} from "@remixicon/react"

interface Patient {
  id: string
  first_name: string
  last_name: string
  age: number | null
  gender: string
  phone: string
  email: string | null
  address: string | null
  height: number | null
  job: string | null
  date_of_birth: string | null
  created_at: string
  updated_at: string
  complaint: string | null
  // Medical conditions
  is_diabetic: boolean | null
  is_hypertensive: boolean | null
  has_pancreatitis: boolean | null
  is_pregnant: boolean | null
  is_breastfeeding: boolean | null
  glp1a_previous_exposure: boolean | null
  has_rheumatoid: boolean | null
  has_ihd: boolean | null
  has_heart_failure: boolean | null
  has_gerd: boolean | null
  has_gastritis: boolean | null
  has_hepatic: boolean | null
  has_anaemia: boolean | null
  has_bronchial_asthma: boolean | null
  thyroid_status: string | null
  history_of_operation: any | null
}

interface GeneralTabProps {
  patient: Patient
}

export function GeneralTab({ patient }: GeneralTabProps) {
  const [clinicalNotesText, setClinicalNotesText] = useState("")
  const [showAIModal, setShowAIModal] = useState(false)
  const [showTranscription, setShowTranscription] = useState(false)

  const allMedicalConditions = [
    { id: "is_diabetic", label: "Diabetes", value: patient.is_diabetic },
    { id: "is_hypertensive", label: "Hypertension", value: patient.is_hypertensive },
    { id: "has_pancreatitis", label: "Pancreatitis", value: patient.has_pancreatitis },
    { id: "has_gerd", label: "GERD", value: patient.has_gerd },
    { id: "has_gastritis", label: "Gastritis", value: patient.has_gastritis },
    { id: "has_hepatic", label: "Hepatic Disease", value: patient.has_hepatic },
    { id: "has_anaemia", label: "Anemia", value: patient.has_anaemia },
    { id: "has_bronchial_asthma", label: "Bronchial Asthma", value: patient.has_bronchial_asthma },
    { id: "has_rheumatoid", label: "Rheumatoid Arthritis", value: patient.has_rheumatoid },
    { id: "has_ihd", label: "Ischemic Heart Disease", value: patient.has_ihd },
    { id: "has_heart_failure", label: "Heart Failure", value: patient.has_heart_failure },
    { id: "is_pregnant", label: "Pregnant", value: patient.is_pregnant },
    { id: "is_breastfeeding", label: "Breastfeeding", value: patient.is_breastfeeding },
    { id: "glp1a_previous_exposure", label: "GLP-1A Previous Exposure", value: patient.glp1a_previous_exposure },
  ]

  const handleConditionToggle = (conditionId: string) => {
    // TODO: Update condition in database
    console.log("Toggle condition:", conditionId)
  }

  const aiDiagnosis = patient.ai_diagnosis || null

  return (
    <div className="space-y-6">
      {/* Clinical Investigation & Medical Conditions Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {/* Clinical Investigation - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="space-y-4 rounded-lg border border-primary-200 bg-primary-50/50 p-6 dark:border-primary-800 dark:bg-primary-900/10">
            {/* Clinical Notes */}
            <ClinicalNotes
              title="Clinical Investigation"
              onSave={(notesText) => {
                console.log("Notes saved:", notesText)
                setClinicalNotesText(notesText)
                // TODO: Save to database
              }}
              onViewTranscription={() => {
                setShowTranscription(true)
                // TODO: Show transcription modal/view
                console.log("View transcription")
              }}
            />
          </div>
        </div>

        {/* Medical Conditions - Takes 1 column */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RiHeartPulseLine className="size-5 text-red-600 dark:text-red-400" />
                <CardTitle>Medical Conditions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] space-y-2 overflow-y-auto pr-2">
                {allMedicalConditions.map((condition) => (
                  <label
                    key={condition.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                  >
                    <Checkbox
                      checked={condition.value === true}
                      onCheckedChange={() => handleConditionToggle(condition.id)}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{condition.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Medical Summary */}
      {aiDiagnosis && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <RiRobot2Line className="size-5 text-blue-600 dark:text-blue-400" />
              <CardTitle>AI Medical Summary</CardTitle>
              <Badge variant="default" className="text-xs">AI Generated</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {aiDiagnosis}
              </p>
              {patient.ai_diagnosis_updated_at && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  Last updated: {new Date(patient.ai_diagnosis_updated_at).toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visit Checklist */}
      <VisitChecklist clinicalNotes={clinicalNotesText} />

      {/* AI Extraction Modal */}
      <AIExtractionModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        clinicalNotes={clinicalNotesText}
        onAccept={(diagnosis, severity) => {
          console.log("AI data accepted:", { diagnosis, severity })
          // TODO: Save to database
        }}
      />

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {patient.email && (
              <div className="flex items-center gap-3">
                <RiMailLine className="size-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">{patient.email}</p>
                </div>
              </div>
            )}

            {patient.address && (
              <div className="flex items-center gap-3">
                <RiMapPinLine className="size-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">{patient.address}</p>
                </div>
              </div>
            )}

            {patient.job && (
              <div className="flex items-center gap-3">
                <RiBriefcaseLine className="size-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Occupation</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">{patient.job}</p>
                </div>
              </div>
            )}

            {patient.height && (
              <div className="flex items-center gap-3">
                <RiRulerLine className="size-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Height</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">{patient.height} cm</p>
                </div>
              </div>
            )}

            {patient.date_of_birth && (
              <div className="flex items-center gap-3">
                <RiCalendarLine className="size-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">
                    {new Date(patient.date_of_birth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <RiCalendarLine className="size-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Registration Date</p>
                <p className="font-medium text-gray-900 dark:text-gray-50">
                  {new Date(patient.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RiCalendarLine className="size-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="font-medium text-gray-900 dark:text-gray-50">
                  {new Date(patient.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

