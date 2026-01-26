"use client"

import { useState } from "react"
import { Button } from "@/components/Button"
import { Label } from "@/components/Label"
import { Textarea } from "@/components/Textarea"
import { useToast } from "@/hooks/useToast"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { create } from "./waitingList.api"
import { DEMO_CLINIC_ID } from "@/data/mock/mock-data"
import { PatientSelector, type Patient } from "@/components/shared/PatientSelector"
import { RiCheckLine, RiArrowLeftLine, RiUserAddLine, RiTimeLine, RiCalendarLine } from "@remixicon/react"
import { format } from "date-fns"

interface AddToWaitlistFlowProps {
  onComplete?: () => void
  onCancel?: () => void
}

export function AddToWaitlistFlow({ onComplete, onCancel }: AddToWaitlistFlowProps) {
  const { showToast } = useToast()
  const { currentUser, currentClinic } = useUserClinic()
  const clinicId = currentClinic?.id || DEMO_CLINIC_ID

  const [currentStep, setCurrentStep] = useState<"patient" | "preferences" | "confirmation" | "success">("patient")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    appointmentType: "" as "new" | "followup" | "online" | "",
    preferredTimeWindow: "any" as "any" | "morning" | "afternoon" | "evening",
    preferredDays: [] as string[],
    preferredTiming: "anytime" as "anytime" | "tomorrow" | "this_week" | "next_week" | "within_2_weeks",
    notes: "",
  })

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setCurrentStep("preferences")
  }

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day],
    }))
  }

  const handleBack = () => {
    if (currentStep === "preferences") setCurrentStep("patient")
    if (currentStep === "confirmation") setCurrentStep("preferences")
  }

  const handleSubmit = async () => {
    if (!selectedPatient) return

    setIsSubmitting(true)
    try {
      await create({
        clinicId,
        patientId: selectedPatient.id,
        appointmentType: formData.appointmentType || undefined,
        preferredTimeWindow: formData.preferredTimeWindow,
        preferredDays: formData.preferredDays.length > 0 ? formData.preferredDays : undefined,
        priority: "normal",
        notes: formData.notes || undefined,
      })

      setCurrentStep("success")
      if (onComplete) {
        setTimeout(() => onComplete(), 1500)
      }
    } catch (error) {
      console.error("Failed to add to waiting list:", error)
      showToast("Failed to add patient to waiting list", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const daysOfWeek = [
    { value: "monday", label: "M" },
    { value: "tuesday", label: "T" },
    { value: "wednesday", label: "W" },
    { value: "thursday", label: "T" },
    { value: "friday", label: "F" },
    { value: "saturday", label: "S" },
    { value: "sunday", label: "S" },
  ]

  return (
    <div className="space-y-4">
      {/* Navigation */}
      {currentStep !== "success" && (
        <div className="flex items-center -ml-1 mb-2">
          {currentStep === "patient" ? (
            onCancel && (
              <Button 
                variant="link" 
                onClick={onCancel} 
                className="text-[11px] font-bold"
              >
                <RiArrowLeftLine className="mr-1 size-3.5" />
                Cancel
              </Button>
            )
          ) : (
            <Button 
              variant="link" 
              onClick={handleBack} 
              className="text-[11px] font-bold"
            >
              <RiArrowLeftLine className="mr-1 size-3.5" />
              Back
            </Button>
          )}
        </div>
      )}

      {/* Stepper */}
      {currentStep !== "success" && (
        <div className="py-2">
          <div className="flex items-center justify-center max-w-xs mx-auto">
            {[
              { key: "patient", label: "Patient" },
              { key: "preferences", label: "Prefs" },
              { key: "confirmation", label: "Confirm" },
            ].map((step, index, array) => {
              const stepKeys = array.map(s => s.key)
              const stepIndex = stepKeys.indexOf(currentStep)
              const isActive = step.key === currentStep
              const isCompleted = index < stepIndex
              
              return (
                <div key={step.key} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 min-w-[50px]">
                    <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCompleted ? "bg-primary-600 text-white" : 
                      isActive ? "border-2 border-primary-600 bg-white text-primary-600" : 
                      "border border-gray-200 text-gray-400"
                    }`}>
                      {isCompleted ? <RiCheckLine className="size-4" /> : index + 1}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isActive || isCompleted ? "text-gray-700" : "text-gray-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < array.length - 1 && (
                    <div className={`h-px flex-1 -mt-4 mx-2 ${isCompleted ? "bg-primary-600" : "bg-gray-200"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-transparent">
        {currentStep === "patient" && (
          <PatientSelector
            onPatientSelect={handlePatientSelect}
            showEmail={false}
            required={true}
          />
        )}

        {currentStep === "preferences" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Appointment Type */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Type</Label>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full border border-gray-200 dark:border-gray-700">
                {(["new", "followup", "online"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, appointmentType: type }))}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      formData.appointmentType === type
                        ? "bg-white text-primary-600 shadow-sm dark:bg-gray-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <span className="capitalize">{type === "followup" ? "Follow-up" : type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Window */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Time Preference</Label>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full border border-gray-200 dark:border-gray-700">
                {(["any", "morning", "afternoon", "evening"] as const).map((window) => (
                  <button
                    key={window}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, preferredTimeWindow: window }))}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      formData.preferredTimeWindow === window
                        ? "bg-white text-primary-600 shadow-sm dark:bg-gray-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <span className="capitalize">{window}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Days Selection */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Preferred Days</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`size-9 rounded-xl border flex items-center justify-center text-xs font-bold transition-all ${
                      formData.preferredDays.includes(day.value)
                        ? "border-primary-600 bg-primary-600 text-white shadow-md"
                        : "border-gray-100 bg-white hover:border-primary-200"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full h-11 bg-gray-900 text-white rounded-xl font-bold text-xs"
              onClick={() => setCurrentStep("confirmation")}
            >
              Review Details
            </Button>
          </div>
        )}

        {currentStep === "confirmation" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="rounded-xl bg-primary-50/50 border border-primary-100 p-3">
              <p className="text-xs font-semibold text-primary-700 flex items-center gap-1.5">
                <RiCheckLine className="size-4" />
                Review waitlist preferences
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 bg-white shadow-sm">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                  <RiUserAddLine className="size-4.5 text-gray-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Patient</p>
                  <p className="text-sm font-bold text-gray-900">{selectedPatient?.first_name} {selectedPatient?.last_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 bg-white shadow-sm">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                  <RiTimeLine className="size-4.5 text-gray-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Timing</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">{formData.preferredTimeWindow} • {formData.appointmentType || "Any Type"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 bg-white shadow-sm">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                  <RiCalendarLine className="size-4.5 text-gray-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Days</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.preferredDays.length > 0 ? formData.preferredDays.map(d => d.slice(0, 3)).join(", ") : "Any Day"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="secondary" 
                className="flex-1 text-[11px] h-11 px-2.5 font-bold border-gray-200" 
                onClick={handleBack}
              >
                Back
              </Button>
              <Button 
                variant="primary" 
                className="flex-[2] text-[11px] h-11 px-2.5 font-bold bg-gray-900 shadow-lg active:scale-[0.98] transition-all" 
                onClick={handleSubmit} 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add to Waiting List"}
              </Button>
            </div>
          </div>
        )}

        {currentStep === "success" && (
          <div className="py-12 text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-50 border-4 border-white shadow-sm">
              <RiCheckLine className="size-12 text-green-600" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900">Waitlist Updated!</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
              {selectedPatient?.first_name} has been successfully added to the waiting list.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
