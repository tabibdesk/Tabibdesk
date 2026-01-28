"use client"

import { Card, CardContent, CardHeader } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Checkbox } from "@/components/Checkbox"
import { WeightChart } from "./WeightChart"
import { PastMedications } from "./PastMedications"
import { NotesTab } from "./NotesTab"
import { Button } from "@/components/Button"
import {
  RiRobot2Line,
  RiHeartPulseLine,
  RiLineChartLine,
  RiHistoryLine,
} from "@remixicon/react"
import type { PastMedication } from "@/features/prescriptions/prescriptions.types"
import { useState } from "react"
import { format } from "date-fns"

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

interface DoctorNote {
  id: string
  patient_id: string
  note: string
  created_at: string
}

interface DoctorTabProps {
  patient: Patient
  notes: DoctorNote[]
  weightLogs?: WeightLog[]
  pastMedications?: PastMedication[]
  onAddPastMedication?: () => void
}

const INITIAL_WEIGHT_VISIBLE_COUNT = 5
const WEIGHT_LOAD_MORE_INCREMENT = 5

export function DoctorTab({
  patient,
  notes,
  weightLogs = [],
  pastMedications = [],
  onAddPastMedication,
}: DoctorTabProps) {
  const [visibleWeightCount, setVisibleWeightCount] = useState(INITIAL_WEIGHT_VISIBLE_COUNT)

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

  // Weight Logs Pagination
  const sortedWeightLogs = [...weightLogs].sort(
    (a, b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()
  )
  const visibleWeightLogs = sortedWeightLogs.slice(0, visibleWeightCount)
  const hasMoreWeight = visibleWeightCount < weightLogs.length

  const handleLoadMoreWeight = () => {
    setVisibleWeightCount((prev) => prev + WEIGHT_LOAD_MORE_INCREMENT)
  }

  return (
    <div className="space-y-6">
      {/* AI Medical Summary */}
      {aiDiagnosis && (
        <Card className="border-blue-100 dark:border-blue-900/30 overflow-hidden">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30 py-2.5 px-4 min-h-12 flex items-center">
            <div className="flex items-center gap-2">
              <RiRobot2Line className="size-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-blue-900/70 dark:text-blue-100/70 uppercase tracking-widest">
                AI Medical Summary
              </h3>
              <Badge
                variant="default"
                className="text-[10px] h-4 px-1.5 font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800"
              >
                AI Generated
              </Badge>
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

      {/* Medical Conditions and Weight Progress Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Medical Conditions */}
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-2.5 px-4 min-h-12 flex items-center">
            <div className="flex items-center gap-2">
              <RiHeartPulseLine className="size-4 text-red-500/70 dark:text-red-400/70" />
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Medical Conditions
              </h3>
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
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-2.5 px-4 min-h-12 flex items-center">
            <div className="flex items-center gap-2">
              <RiLineChartLine className="size-4 text-primary-500/70 dark:text-primary-400/70" />
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Weight Progress
              </h3>
            </div>
          </CardHeader>
          {weightLogs.length === 0 ? (
            <CardContent className="py-12 text-center">
              <RiLineChartLine className="mx-auto size-10 text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No weight progress data yet
              </p>
            </CardContent>
          ) : (
            <CardContent className="p-4">
              <WeightChart weightLogs={weightLogs} />

              {/* Weight History List */}
              <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <RiHistoryLine className="size-3.5 text-gray-400" />
                  <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Weight History</h4>
                </div>
                <div className="space-y-2">
                  {visibleWeightLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-50">{log.weight} kg</span>
                        <span className="text-[10px] text-gray-500 font-medium">{format(new Date(log.recorded_date), "MMM d, yyyy")}</span>
                      </div>
                      {log.notes && (
                        <span className="text-[10px] text-gray-400 italic max-w-[150px] truncate">{log.notes}</span>
                      )}
                    </div>
                  ))}
                </div>
                {hasMoreWeight && (
                  <div className="flex justify-center mt-3">
                    <Button
                      variant="ghost"
                      onClick={handleLoadMoreWeight}
                      className="w-full h-8 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-primary-600 dark:text-gray-500 dark:hover:text-primary-400"
                    >
                      Load More History
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>


      {/* Past Medications */}
      <PastMedications medications={pastMedications} onAddMedication={onAddPastMedication} />

      {/* Past Notes */}
      <NotesTab notes={notes} patient={patient} />
    </div>
  )
}
