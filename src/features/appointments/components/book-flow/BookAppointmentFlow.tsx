"use client"

import { Button } from "@/components/Button"
import { useAppTranslations } from "@/lib/useAppTranslations"
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
  const t = useAppTranslations()
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
            {t.appointments.bookAppointment}
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {t.appointments.scheduleNewAppointment}
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
        t={t}
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
          t={t}
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
          t={t}
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
          t={t}
        />
      )}

      {currentStep === "success" && (
        <SuccessStep rescheduleAppointmentId={rescheduleAppointmentId} t={t} />
      )}

      {currentStep !== "success" &&
        currentStep !== "confirmation" && (
          <div className="flex items-center -ml-1 pt-2">
            {currentStep === "patient" ? (
              onCancel && (
                <Button variant="link" onClick={onCancel} className="text-[11px] font-bold inline-flex items-center gap-1.5 rtl:flex-row-reverse">
                  <RiArrowLeftLine className="size-3.5 rtl:rotate-180" />
                  {t.common.cancel}
                </Button>
              )
            ) : (
              <Button
                variant="link"
                onClick={state.handleBack}
                className="text-[11px] font-bold inline-flex items-center gap-1.5 rtl:flex-row-reverse"
              >
                <RiArrowLeftLine className="size-3.5 rtl:rotate-180" />
                {t.appointments.back}
              </Button>
            )}
          </div>
        )}
    </div>
  )
}
