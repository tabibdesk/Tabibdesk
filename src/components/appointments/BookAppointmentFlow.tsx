"use client"

import { Button } from "@/components/Button"
import { RiArrowLeftLine } from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"
import { useBookAppointmentState } from "./useBookAppointmentState"
import {
  BookAppointmentStepper,
  SlotContextBanner,
  PatientStep,
  ServiceStep,
  DateTimeStep,
  ConfirmationStep,
  SuccessStep,
} from "./BookAppointmentSteps"
import type { BookAppointmentFlowProps, PreSelectedSlot } from "./bookAppointmentFlow.types"

export type { AppBookableService, PreSelectedSlot, WaitlistEntry } from "./bookAppointmentFlow.types"

export function BookAppointmentFlow({
  initialPatient = null,
  showTitle = true,
  preSelectedSlot = null,
  rescheduleAppointmentId = null,
  waitlistEntry = null,
  clinicId,
  doctorId,
  onBookingComplete,
  onCancel,
}: BookAppointmentFlowProps) {
  const { isDemoMode } = useDemo()

  const state = useBookAppointmentState({
    initialPatient,
    preSelectedSlot,
    rescheduleAppointmentId,
    waitlistEntry: waitlistEntry
      ? {
          patientId: waitlistEntry.patientId,
          patientName: waitlistEntry.patientName,
          patientPhone: waitlistEntry.patientPhone,
        }
      : null,
    clinicId,
    doctorId,
    onBookingComplete,
    isDemoMode,
  })

  const { currentStep } = state

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Book Appointment
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Schedule a new appointment for a patient
          </p>
        </div>
      )}

      {preSelectedSlot && state.slotContextInfo && currentStep !== "success" && (
        <SlotContextBanner
          preSelectedSlot={preSelectedSlot as PreSelectedSlot}
          slotContextInfo={state.slotContextInfo}
        />
      )}

      <BookAppointmentStepper
        currentStep={currentStep}
        preSelectedSlot={preSelectedSlot}
      />

      {currentStep === "patient" && (
        <PatientStep
          initialPatient={initialPatient}
          onPatientSelect={state.handlePatientSelect}
        />
      )}

      {currentStep === "service" && (
        <ServiceStep
          services={state.services}
          isLoading={state.isLoadingServices}
          onServiceSelect={state.handleServiceSelect}
        />
      )}

      {currentStep === "datetime" && (
        <DateTimeStep
          availableDates={state.availableDates}
          selectedDate={state.selectedDate}
          timeSlots={state.timeSlots}
          isLoadingDates={state.isLoadingDates}
          isLoadingSlots={state.isLoadingSlots}
          onDateSelect={state.handleDateSelect}
          onSlotSelect={state.handleSlotSelect}
        />
      )}

      {currentStep === "confirmation" && (
        <ConfirmationStep
          selectedPatient={state.selectedPatient}
          selectedService={state.selectedService}
          selectedDate={state.selectedDate}
          selectedSlot={state.selectedSlot}
          isSubmitting={state.isSubmitting}
          onBack={state.handleBack}
          onConfirm={state.handleConfirmBooking}
        />
      )}

      {currentStep === "success" && (
        <SuccessStep rescheduleAppointmentId={rescheduleAppointmentId} />
      )}

      {currentStep !== "success" &&
        currentStep !== "confirmation" && (
          <div className="flex items-center -ml-1 pt-2">
            {currentStep === "patient" ? (
              onCancel && (
                <Button variant="link" onClick={onCancel} className="text-[11px] font-bold">
                  <RiArrowLeftLine className="mr-1 size-3.5" />
                  Cancel
                </Button>
              )
            ) : (
              <Button
                variant="link"
                onClick={state.handleBack}
                className="text-[11px] font-bold"
              >
                <RiArrowLeftLine className="mr-1 size-3.5" />
                Back
              </Button>
            )}
          </div>
        )}
    </div>
  )
}
