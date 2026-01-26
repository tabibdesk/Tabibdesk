"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Checkbox } from "@/components/Checkbox"
import { Textarea } from "@/components/Textarea"
import { AIExtractionModal } from "./AIExtractionModal"
import { WeightChart } from "./WeightChart"
import { PastMedications } from "./PastMedications"
import { BasicInfoCompact } from "./BasicInfoCompact"
import {
  RiRobot2Line,
  RiHeartPulseLine,
  RiLineChartLine,
} from "@remixicon/react"
import type { PastMedication } from "@/features/prescriptions/prescriptions.types"

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
  ai_diagnosis?: string | null
  ai_diagnosis_updated_at?: string | null
}

interface WeightLog {
  id: string
  patient_id: string
  weight: number
  recorded_date: string
  notes: string | null
}

interface GeneralTabProps {
  patient: Patient
  weightLogs?: WeightLog[]
  pastMedications?: PastMedication[]
  onAddPastMedication?: () => void
  onUpdatePatient?: (updates: Partial<Patient>) => Promise<void>
}

export function GeneralTab({ patient, weightLogs = [], pastMedications = [], onAddPastMedication, onUpdatePatient }: GeneralTabProps) {
  const [clinicalNotesText, _setClinicalNotesText] = useState("")
  const [showAIModal, setShowAIModal] = useState(false)
  const [_showTranscription, _setShowTranscription] = useState(false)

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
      {/* Basic Patient Information - Compact */}
      <BasicInfoCompact patient={patient} onUpdate={onUpdatePatient} />

      {/* Visit Checklist Row */}
      <div className="flex flex-col space-y-6">
        {/* AI Medical Summary */}
        {aiDiagnosis && (
          <Card className="border-blue-100 dark:border-blue-900/30 overflow-hidden">
            <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30 py-2.5">
              <div className="flex items-center gap-2">
                <RiRobot2Line className="size-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-blue-900/70 dark:text-blue-100/70 uppercase tracking-widest">AI Medical Summary</h3>
                <Badge variant="default" className="text-[10px] h-4 px-1.5 font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800">AI Generated</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-medium">
                {aiDiagnosis}
              </div>
              {patient.ai_diagnosis_updated_at && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                  <span>Last updated: {new Date(patient.ai_diagnosis_updated_at).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>

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

      {/* Medical Conditions and Weight Progress Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Medical Conditions */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-2.5">
            <div className="flex items-center gap-2">
              <RiHeartPulseLine className="size-4 text-red-500/70 dark:text-red-400/70" />
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Medical Conditions</h3>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {allMedicalConditions.map((condition) => (
                <div key={condition.id} className="flex items-center gap-3 group">
                  <Checkbox
                    id={condition.id}
                    checked={condition.value || false}
                    onCheckedChange={() => handleConditionToggle(condition.id)}
                    className="size-4 border-gray-300 dark:border-gray-700"
                  />
                  <label
                    htmlFor={condition.id}
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors"
                  >
                    {condition.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weight Progress */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-2.5">
            <div className="flex items-center gap-2">
              <RiLineChartLine className="size-4 text-primary-500/70 dark:text-primary-400/70" />
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Weight Progress</h3>
            </div>
          </CardHeader>
          {weightLogs.length === 0 ? (
            <CardContent className="py-12 text-center">
              <RiLineChartLine className="mx-auto size-10 text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No weight progress data yet</p>
            </CardContent>
          ) : (
            <CardContent className="p-4">
              <WeightChart weightLogs={weightLogs} />
            </CardContent>
          )}
        </Card>
      </div>

      {/* Past Medications */}
      <PastMedications medications={pastMedications} onAddMedication={onAddPastMedication} />
    </div>
  )
}

