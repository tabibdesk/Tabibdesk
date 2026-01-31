"use client"

import { Card, CardContent, CardHeader } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Checkbox } from "@/components/Checkbox"
import { BasicInfoCompact } from "./BasicInfoCompact"
import { ProgressChart } from "./ProgressChart"
import { PastMedications } from "./PastMedications"
import { NotesTab } from "./NotesTab"
import { Button } from "@/components/Button"
import {
  RiRobot2Line,
  RiHeartPulseLine,
  RiLineChartLine,
  RiCapsuleLine,
  RiTimeLine,
  RiAddLine,
} from "@remixicon/react"
import type { ProgressMetric } from "@/types/progress"
import type { PastMedication, Prescription } from "@/features/prescriptions/prescriptions.types"
import { format } from "date-fns"
import { PatientEmptyState } from "@/components/patient/PatientEmptyState"

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

interface DoctorNote {
  id: string
  patient_id: string
  note: string
  created_at: string
}

interface DoctorTabProps {
  patient: Patient
  notes: DoctorNote[]
  progressMetrics?: ProgressMetric[]
  pastMedications?: PastMedication[]
  prescriptions?: Prescription[]
  onAddPastMedication?: () => void
  onAddPrescription?: () => void
  onAddWeightLog?: () => void
  onNoteAdded?: () => void
  onUpdatePatient?: (updates: Partial<Patient>) => Promise<void>
}

export function DoctorTab({
  patient,
  notes,
  progressMetrics = [],
  pastMedications = [],
  prescriptions = [],
  onAddPastMedication,
  onAddPrescription,
  onAddWeightLog,
  onNoteAdded,
  onUpdatePatient,
}: DoctorTabProps) {

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

  const chartableMetrics = progressMetrics.filter((m) => m.points.length >= 2)

  return (
    <div className="space-y-6">
      {/* Basic Patient Information - Compact */}
      <BasicInfoCompact patient={patient} onUpdate={onUpdatePatient} />

      {/* AI Medical Summary */}
      {aiDiagnosis && (
        <Card className="border-blue-100 dark:border-blue-900/30 overflow-hidden">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30 px-4 py-3 min-h-12 flex flex-row items-center justify-start">
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

      {/* Medical Conditions and Medications Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Medical Conditions */}
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 px-4 py-3 min-h-12 flex flex-row items-center justify-start">
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

        {/* Past Medications */}
        <PastMedications medications={pastMedications} onAddMedication={onAddPastMedication} />
      </div>

      {/* Prescriptions - compact */}
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 px-3 py-2 min-h-10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <RiCapsuleLine className="size-3.5 text-primary-500/70 dark:text-primary-400/70" />
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Prescriptions
            </h3>
          </div>
          {onAddPrescription && (
            <Button variant="ghost" size="sm" onClick={onAddPrescription} className="size-7 shrink-0 p-0" title="Add prescription">
              <RiAddLine className="size-3.5" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-3">
          {prescriptions.length === 0 ? (
            <PatientEmptyState
              icon={RiCapsuleLine}
              title="No prescriptions yet"
              description="Add a prescription to see it here."
            />
          ) : (
            <div className="space-y-2">
              {[...prescriptions]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((prescription) => (
                  <div
                    key={prescription.id}
                    className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/40 overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-gray-100/80 dark:border-gray-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 shrink-0">
                          {format(new Date(prescription.createdAt), "MMM d, yyyy")}
                        </span>
                        <span className="text-xs text-gray-500 shrink-0">
                          {format(new Date(prescription.createdAt), "h:mm a")}
                        </span>
                        {prescription.diagnosisText && (
                          <span className="text-xs text-gray-600 dark:text-gray-400 truncate" title={prescription.diagnosisText}>
                            · {prescription.diagnosisText}
                          </span>
                        )}
                      </div>
                      {prescription.visitType && (
                        <Badge variant="neutral" className="text-xs h-4 px-1.5 font-bold uppercase tracking-wider shrink-0">
                          {prescription.visitType === "in_clinic" ? "In Clinic" : "Online"}
                        </Badge>
                      )}
                    </div>
                    <div className="px-3 py-2 space-y-1.5">
                      {prescription.items.map((item) => (
                        <div key={item.id} className="flex items-baseline gap-2 text-xs min-w-0 flex-wrap">
                          <span className="font-medium text-gray-900 dark:text-gray-100 shrink-0">
                            {item.name}
                            {item.strength ? ` (${item.strength})` : ""}
                          </span>
                          {item.form && (
                            <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0">{item.form}</span>
                          )}
                          <span className="text-gray-600 dark:text-gray-400 min-w-0">{item.sig}</span>
                          {item.duration && (
                            <span className="text-gray-500 shrink-0 flex items-center gap-0.5">
                              <RiTimeLine className="size-3" />
                              {item.duration}
                            </span>
                          )}
                          {item.notes && (
                            <span className="text-gray-400 italic w-full text-xs">Note: {item.notes}</span>
                          )}
                        </div>
                      ))}
                      {prescription.notesToPatient && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 pt-1 border-t border-amber-100/50 dark:border-amber-900/20 font-medium">
                          {prescription.notesToPatient}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress (weight, labs, dosage, note-extracted) */}
      <div className="space-y-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <RiLineChartLine className="size-4 text-primary-500/70 dark:text-primary-400/70" />
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Progress
            </h3>
          </div>
          {onAddWeightLog && (
            <Button variant="ghost" size="sm" onClick={onAddWeightLog} className="size-8 shrink-0 p-0" title="Add weight">
              <RiAddLine className="size-4" />
            </Button>
          )}
        </div>
        {chartableMetrics.length === 0 ? (
          <Card className="overflow-hidden shadow-sm">
            <CardContent className="p-4">
              <PatientEmptyState
                icon={RiLineChartLine}
                title="No progress data yet"
                description="Record weight, labs, or medications to see progress here."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {chartableMetrics.map((metric) => (
              <Card key={metric.id} className="overflow-hidden shadow-sm">
                <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 px-4 py-3 min-h-12">
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {metric.label}
                    {metric.unit && <span className="ml-1 font-normal text-gray-500">({metric.unit})</span>}
                  </h3>
                </CardHeader>
                <CardContent className="p-4">
                  <ProgressChart metric={metric} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Notes */}
      <NotesTab notes={notes} patient={patient} onNoteAdded={onNoteAdded} />
    </div>
  )
}
