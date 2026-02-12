"use client"

import { useState, useEffect } from "react"
import type { Patient } from "@/components/shared/PatientSelector"
import { getAppointmentTypeIdForStorage } from "@/features/appointments/appointmentTypes"
import { mockUsers, mockClinics } from "@/data/mock/users-clinics"
import { createAppointment, updateAppointmentTime } from "@/features/appointments/appointments.api"
import { getAvailableDates, getAvailableSlots } from "@/features/appointments/slots.api"
import type {
  AppBookableService,
  TimeSlot,
  AvailableDate,
  PreSelectedSlot,
  BookFlowStep,
} from "./bookAppointmentFlow.types"

export interface UseBookAppointmentStateParams {
  initialPatient: Patient | null
  preSelectedSlot: PreSelectedSlot | null
  rescheduleAppointmentId: string | null
  waitlistEntry: { patientId: string; patientName: string; patientPhone: string } | null
  clinicId?: string
  doctorId?: string
  onBookingComplete?: () => void
}

export function useBookAppointmentState(params: UseBookAppointmentStateParams) {
  const {
    initialPatient,
    preSelectedSlot,
    rescheduleAppointmentId,
    waitlistEntry,
    clinicId,
    doctorId,
    onBookingComplete,
  } = params

  const [currentStep, setCurrentStep] = useState<BookFlowStep>(
    initialPatient ? "service" : "patient"
  )
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient)
  const [selectedService, setSelectedService] = useState<AppBookableService | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [services, setServices] = useState<AppBookableService[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])
  const [isLoadingDates, setIsLoadingDates] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [slotContextInfo, setSlotContextInfo] = useState<{
    doctorName: string
    clinicName: string
  } | null>(null)

  useEffect(() => {
    if (preSelectedSlot) {
      const doctor = mockUsers.find((u) => u.id === preSelectedSlot.doctorId)
      const clinic = mockClinics.find((c) => c.id === preSelectedSlot.clinicId)
      if (doctor && clinic) {
        setSlotContextInfo({ doctorName: doctor.full_name, clinicName: clinic.name })
      }
    }
  }, [preSelectedSlot])

  useEffect(() => {
    if (currentStep === "service") loadServices()
  }, [currentStep])

  const loadServices = async () => {
    setIsLoadingServices(true)
    try {
      // Inline bookable services (appointment types) for the booking flow
      await new Promise((resolve) => setTimeout(resolve, 300))
      const data: AppBookableService[] = [
        {
          id: 1,
          title: "General Consultation",
          description: "Standard consultation for new or existing patients",
          duration_minutes: 30,
          app_appointment_type_id: "consultation",
          app_appointment_type_name: "Consultation",
        },
        {
          id: 2,
          title: "Follow-up Visit",
          description: "Short follow-up appointment for existing patients",
          duration_minutes: 15,
          app_appointment_type_id: "followup",
          app_appointment_type_name: "Follow-up",
        },
        {
          id: 3,
          title: "Comprehensive Check-up",
          description: "Full medical examination and health assessment",
          duration_minutes: 60,
          app_appointment_type_id: "checkup",
          app_appointment_type_name: "Check-up",
        },
        {
          id: 4,
          title: "Procedure Consultation",
          description: "Consultation for medical procedures and treatments",
          duration_minutes: 45,
          app_appointment_type_id: "procedure",
          app_appointment_type_name: "Procedure",
        },
      ]
      setServices(data)
    } catch (error) {
      console.error("Failed to load services:", error)
    } finally {
      setIsLoadingServices(false)
    }
  }

  useEffect(() => {
    if (currentStep === "datetime" && selectedService) loadAvailableDates()
  }, [currentStep, selectedService])

  const loadAvailableDates = async () => {
    if (!selectedService) return
    const effectiveClinicId = preSelectedSlot?.clinicId || clinicId
    const effectiveDoctorId = preSelectedSlot?.doctorId || doctorId
    if (!effectiveClinicId || !effectiveDoctorId) return

    setIsLoadingDates(true)
    try {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 30)
      const dates = await getAvailableDates({
        clinicId: effectiveClinicId,
        doctorId: effectiveDoctorId,
        startDate,
        endDate,
        excludeAppointmentId: rescheduleAppointmentId || undefined,
      })
      setAvailableDates(dates.map((d) => ({ date: d })))
    } catch (error) {
      console.error("Failed to load dates:", error)
    } finally {
      setIsLoadingDates(false)
    }
  }

  useEffect(() => {
    if (selectedDate && selectedService) loadTimeSlots()
  }, [selectedDate, selectedService])

  const loadTimeSlots = async () => {
    if (!selectedService || !selectedDate) return
    const effectiveClinicId = preSelectedSlot?.clinicId || clinicId
    const effectiveDoctorId = preSelectedSlot?.doctorId || doctorId
    if (!effectiveClinicId || !effectiveDoctorId) return

    setIsLoadingSlots(true)
    try {
      const startDate = new Date(selectedDate)
      const endDate = new Date(selectedDate)
      const slotsByDate = await getAvailableSlots({
        clinicId: effectiveClinicId,
        doctorId: effectiveDoctorId,
        startDate,
        endDate,
        excludeAppointmentId: rescheduleAppointmentId || undefined,
      })
      const availableSlots = slotsByDate[selectedDate] || []
      setTimeSlots(
        availableSlots.map((slot) => ({ starts_at: slot.startAt, ends_at: slot.endAt }))
      )
    } catch (error) {
      console.error("Failed to load time slots:", error)
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient)
    if (patient) setCurrentStep("service")
    else setCurrentStep("patient")
  }

  const handleServiceSelect = (service: AppBookableService) => {
    setSelectedService(service)
    if (preSelectedSlot) {
      setSelectedDate(preSelectedSlot.startAt.split("T")[0])
      setSelectedSlot({ starts_at: preSelectedSlot.startAt, ends_at: preSelectedSlot.endAt })
      setCurrentStep("confirmation")
    } else {
      setCurrentStep("datetime")
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setCurrentStep("confirmation")
  }

  const handleBack = () => {
    switch (currentStep) {
      case "service":
        if (!initialPatient) {
          setSelectedPatient(null)
          setCurrentStep("patient")
        }
        break
      case "datetime":
        setSelectedService(null)
        setSelectedDate(null)
        setCurrentStep("service")
        break
      case "confirmation":
        setSelectedSlot(null)
        setCurrentStep(preSelectedSlot ? "service" : "datetime")
        break
    }
  }

  const handleConfirmBooking = async () => {
    if (!selectedPatient || !selectedService || !selectedSlot) return
    setIsSubmitting(true)
    try {
      if (rescheduleAppointmentId) {
        await updateAppointmentTime(
          rescheduleAppointmentId,
          selectedSlot.starts_at,
          selectedSlot.ends_at
        )
      } else if (preSelectedSlot || waitlistEntry) {
        const effectiveClinicId = preSelectedSlot?.clinicId || clinicId
        const effectiveDoctorId = preSelectedSlot?.doctorId || doctorId
        if (!effectiveClinicId || !effectiveDoctorId) throw new Error("Missing clinic or doctor ID")

        await createAppointment({
          patientId: selectedPatient.id,
          patientName: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
          patientPhone: selectedPatient.phone,
          clinicId: effectiveClinicId,
          doctorId: effectiveDoctorId,
          startAt: selectedSlot.starts_at,
          endAt: selectedSlot.ends_at,
          appointmentType: getAppointmentTypeIdForStorage(
            selectedService.app_appointment_type_id ?? selectedService.app_appointment_type_name ?? selectedService.title
          ),
          notes: undefined,
        })
      } else {
        throw new Error("Invalid booking state")
      }
      setCurrentStep("success")
      if (onBookingComplete) setTimeout(onBookingComplete, 1500)
    } catch (error) {
      console.error("Booking failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    currentStep,
    selectedPatient,
    selectedService,
    selectedDate,
    selectedSlot,
    isSubmitting,
    services,
    isLoadingServices,
    availableDates,
    isLoadingDates,
    timeSlots,
    isLoadingSlots,
    slotContextInfo,
    handlePatientSelect,
    handleServiceSelect,
    handleDateSelect,
    handleSlotSelect,
    handleBack,
    handleConfirmBooking,
  }
}

export function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}
