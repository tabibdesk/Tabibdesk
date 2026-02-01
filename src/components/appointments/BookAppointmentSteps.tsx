"use client"

import { Button } from "@/components/Button"
import type { AppTranslations } from "@/lib/app-translations"
import { Label } from "@/components/Label"
import {
  RiUserLine,
  RiArrowLeftLine,
  RiCheckLine,
  RiCalendarLine,
  RiTimeLine,
  RiHospitalLine,
} from "@remixicon/react"
import { format } from "date-fns"
import { PatientSelector } from "@/components/shared/PatientSelector"
import type { Patient } from "@/components/shared/PatientSelector"
import { formatTime } from "./useBookAppointmentState"
import type { AppBookableService, TimeSlot, AvailableDate, PreSelectedSlot } from "./bookAppointmentFlow.types"

interface BookAppointmentStepperProps {
  currentStep: string
  preSelectedSlot: PreSelectedSlot | null
  t: AppTranslations
}

export function BookAppointmentStepper({ currentStep, preSelectedSlot, t }: BookAppointmentStepperProps) {
  const steps = [
    { key: "patient", label: t.appointments.stepPatient },
    { key: "service", label: t.appointments.stepService },
    ...(preSelectedSlot ? [] : [{ key: "datetime", label: t.appointments.stepDateTime }]),
    { key: "confirmation", label: t.appointments.stepConfirm },
  ]
  const stepIndex = steps.findIndex((s) => s.key === currentStep)
  const isSuccess = currentStep === "success"

  return (
    <div className="py-2">
      <div className="flex items-center justify-center max-w-sm mx-auto">
        {steps.map((step, index) => {
          const isActive = step.key === currentStep
          const isCompleted = index < stepIndex || isSuccess

          return (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
                <div
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-primary-600 text-white"
                      : isActive
                      ? "border-2 border-primary-600 bg-white text-primary-600 dark:bg-gray-950"
                      : "border border-gray-200 bg-white text-gray-400 dark:border-gray-800 dark:bg-gray-950"
                  }`}
                >
                  {isCompleted ? <RiCheckLine className="size-4" /> : index + 1}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive || isCompleted ? "text-gray-700 dark:text-gray-300" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-px flex-1 -mt-4 mx-2 ${
                    isCompleted ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-800"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface SlotContextBannerProps {
  preSelectedSlot: PreSelectedSlot
  slotContextInfo: { doctorName: string; clinicName: string }
}

export function SlotContextBanner({ preSelectedSlot, slotContextInfo }: SlotContextBannerProps) {
  return (
    <div className="rounded-xl bg-gray-50/50 border border-gray-100 p-3 dark:bg-gray-900/50 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <RiCalendarLine className="size-5 text-primary-600 dark:text-primary-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
            <span>{format(new Date(preSelectedSlot.startAt), "EEEE, MMM d")}</span>
            <span className="text-gray-300">•</span>
            <span>
              {formatTime(preSelectedSlot.startAt)} – {formatTime(preSelectedSlot.endAt)}
            </span>
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            {slotContextInfo.clinicName}{" "}
            <span className="mx-1 text-gray-300">•</span> {slotContextInfo.doctorName}
          </p>
        </div>
      </div>
    </div>
  )
}

interface PatientStepProps {
  initialPatient: Patient | null
  onPatientSelect: (patient: Patient | null) => void
}

export function PatientStep({ initialPatient, onPatientSelect }: PatientStepProps) {
  return (
    <div className="space-y-6">
      <PatientSelector
        initialPatient={initialPatient}
        onPatientSelect={onPatientSelect}
        showEmail={true}
        required={true}
      />
    </div>
  )
}

interface ServiceStepProps {
  services: AppBookableService[]
  isLoading: boolean
  onServiceSelect: (service: AppBookableService) => void
  t: AppTranslations
}

export function ServiceStep({ services, isLoading, onServiceSelect, t }: ServiceStepProps) {
  return (
    <div className="space-y-4">
      <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ms-1">
        {t.appointments.chooseServiceType}
      </Label>
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => onServiceSelect(service)}
              className="group relative rounded-xl border border-gray-100 p-3 text-left transition-all hover:border-primary-200 hover:bg-primary-50/30 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-primary-800 shadow-sm"
            >
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50">
                {service.title}
              </h3>
              <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {service.description}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 rounded-lg">
                  {service.duration_minutes}m
                </span>
                <RiCheckLine className="size-4 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface DateTimeStepProps {
  availableDates: AvailableDate[]
  selectedDate: string | null
  timeSlots: TimeSlot[]
  isLoadingDates: boolean
  isLoadingSlots: boolean
  onDateSelect: (date: string) => void
  onSlotSelect: (slot: TimeSlot) => void
  t: AppTranslations
}

export function DateTimeStep({
  availableDates,
  selectedDate,
  timeSlots,
  isLoadingDates,
  isLoadingSlots,
  onDateSelect,
  onSlotSelect,
  t,
}: DateTimeStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ms-1">
          {t.appointments.selectDate}
        </Label>
        {isLoadingDates ? (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-16 w-14 shrink-0 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {availableDates.map((dateObj) => {
              const date = new Date(dateObj.date)
              const isSelected = selectedDate === dateObj.date
              return (
                <button
                  key={dateObj.date}
                  onClick={() => onDateSelect(dateObj.date)}
                  className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border transition-all ${
                    isSelected
                      ? "border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-200"
                      : "border-gray-100 bg-white hover:border-primary-200 dark:border-gray-800 dark:bg-gray-950"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      isSelected ? "text-primary-100" : "text-gray-400"
                    }`}
                  >
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span
                    className={`text-base font-bold ${
                      isSelected ? "text-white" : "text-gray-900 dark:text-gray-50"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
      {selectedDate && (
        <div>
          <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ms-1">
            {t.appointments.selectTime}
          </Label>
          {isLoadingSlots ? (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {timeSlots.map((slot) => (
                <button
                  key={slot.starts_at}
                  onClick={() => onSlotSelect(slot)}
                  className="rounded-xl border border-gray-100 bg-white p-2.5 text-center transition-all hover:border-primary-200 hover:bg-primary-50/30 dark:border-gray-800 dark:bg-gray-950 shadow-sm"
                >
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-50">
                    {formatTime(slot.starts_at)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ConfirmationStepProps {
  selectedPatient: Patient | null
  selectedService: AppBookableService | null
  selectedDate: string | null
  selectedSlot: TimeSlot | null
  isSubmitting: boolean
  onBack: () => void
  onConfirm: () => void
  t: AppTranslations
}

export function ConfirmationStep({
  selectedPatient,
  selectedService,
  selectedDate,
  selectedSlot,
  isSubmitting,
  onBack,
  onConfirm,
  t,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-primary-50/50 border border-primary-100 p-3 dark:bg-primary-900/10 dark:border-primary-800">
        <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-1.5">
          <RiCheckLine className="size-4" />
          {t.appointments.reviewDetailsBeforeConfirm}
        </p>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <RiUserLine className="size-4.5 text-gray-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {t.appointments.labelPatient}
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
              {selectedPatient?.first_name} {selectedPatient?.last_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <RiHospitalLine className="size-4.5 text-gray-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {t.appointments.labelService}
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
              {selectedService?.title} • {selectedService?.duration_minutes}m
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <RiTimeLine className="size-4.5 text-gray-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {t.appointments.labelDateTime}
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
              {selectedDate && format(new Date(selectedDate), "EEEE, MMMM d")}
            </p>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-bold">
              {selectedSlot &&
                `${formatTime(selectedSlot.starts_at)} – ${formatTime(selectedSlot.ends_at)}`}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          variant="secondary"
          className="flex-1 text-[11px] h-11 px-2.5 font-bold border-gray-200 dark:border-gray-800"
          onClick={onBack}
          disabled={isSubmitting}
        >
          {t.appointments.back}
        </Button>
        <Button
          variant="primary"
          className="flex-[2] text-[11px] h-11 px-2.5 font-bold bg-gray-900 shadow-lg active:scale-[0.98] transition-all"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? t.appointments.booking : t.appointments.confirmBooking}
        </Button>
      </div>
    </div>
  )
}

interface SuccessStepProps {
  rescheduleAppointmentId: string | null
  t: AppTranslations
}

export function SuccessStep({ rescheduleAppointmentId, t }: SuccessStepProps) {
  return (
    <div className="py-12 text-center animate-in fade-in zoom-in duration-300">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 border-4 border-white dark:border-gray-900 shadow-sm">
        <RiCheckLine className="size-12 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-gray-50">
        {rescheduleAppointmentId ? t.appointments.rescheduled : t.appointments.bookingConfirmed}
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
        {t.appointments.appointmentUpdatedSuccess}
      </p>
    </div>
  )
}
