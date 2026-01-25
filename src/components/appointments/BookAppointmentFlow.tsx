"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Alert } from "@/components/Alert"
import {
  RiUserLine,
  RiArrowLeftLine,
  RiCheckLine,
  RiCalendarLine,
  RiTimeLine,
  RiHospitalLine,
} from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"
import { PatientSelector, type Patient } from "@/components/shared/PatientSelector"
import { mockUsers, mockClinics } from "@/data/mock/users-clinics"
import { createAppointment, updateAppointmentTime } from "@/features/appointments/appointments.api"
import { getAvailableDates, getAvailableSlots } from "@/features/appointments/slots.api"

// Types
export interface Patient {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
}

export interface AppBookableService {
  id: number
  title: string
  description: string
  duration_minutes: number
  app_clinic_id: string | null
  app_doctor_id: string | null
  app_appointment_type_name: string
  app_clinic_name: string | null
  app_doctor_name: string | null
}

interface TimeSlot {
  starts_at: string
  ends_at: string
}

interface AvailableDate {
  date: string
}

interface PreSelectedSlot {
  clinicId: string
  doctorId: string
  startAt: string
  endAt: string
  appointmentType?: string
}

interface BookAppointmentFlowProps {
  initialPatient?: Patient | null
  showBackButton?: boolean
  showTitle?: boolean
  showHeader?: boolean
  isEmbedded?: boolean
  preSelectedSlot?: PreSelectedSlot | null
  rescheduleAppointmentId?: string | null
  clinicId?: string
  doctorId?: string
  onBookingComplete?: () => void
  onCancel?: () => void
}

export function BookAppointmentFlow({
  initialPatient = null,
  showBackButton = true,
  showTitle = true,
  showHeader = true,
  isEmbedded = false,
  preSelectedSlot = null,
  rescheduleAppointmentId = null,
  clinicId,
  doctorId,
  onBookingComplete,
  onCancel,
}: BookAppointmentFlowProps) {
  const { isDemoMode } = useDemo()
  
  // State
  const [currentStep, setCurrentStep] = useState<"patient" | "service" | "datetime" | "confirmation" | "success">(
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
  
  // Slot context info (doctor & clinic names)
  const [slotContextInfo, setSlotContextInfo] = useState<{
    doctorName: string
    clinicName: string
  } | null>(null)

  // Load slot context info (doctor & clinic names) when preSelectedSlot is provided
  useEffect(() => {
    if (preSelectedSlot) {
      const doctor = mockUsers.find(u => u.id === preSelectedSlot.doctorId)
      const clinic = mockClinics.find(c => c.id === preSelectedSlot.clinicId)
      
      if (doctor && clinic) {
        setSlotContextInfo({
          doctorName: doctor.full_name,
          clinicName: clinic.name,
        })
      }
    }
  }, [preSelectedSlot])

  // Load Services
  useEffect(() => {
    if (currentStep === "service") {
      loadServices()
    }
  }, [currentStep])

  const loadServices = async () => {
    setIsLoadingServices(true)
    try {
      const response = await fetch(`/api/tidycal/booking-types?demo=${isDemoMode}`)
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Failed to load services:', error)
    } finally {
      setIsLoadingServices(false)
    }
  }

  // Load Available Dates
  useEffect(() => {
    if (currentStep === "datetime" && selectedService) {
      loadAvailableDates()
    }
  }, [currentStep, selectedService])

  const loadAvailableDates = async () => {
    if (!selectedService) return
    
    // Determine clinic and doctor IDs from preSelectedSlot or props
    const effectiveClinicId = preSelectedSlot?.clinicId || clinicId
    const effectiveDoctorId = preSelectedSlot?.doctorId || doctorId
    
    if (!effectiveClinicId || !effectiveDoctorId) {
      console.error('Missing clinic or doctor ID for loading available dates')
      return
    }
    
    setIsLoadingDates(true)
    try {
      // Use TabibDesk slots API which respects doctor availability and buffers
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 30) // Next 30 days
      
      const availableDates = await getAvailableDates({
        clinicId: effectiveClinicId,
        doctorId: effectiveDoctorId,
        startDate,
        endDate,
        excludeAppointmentId: rescheduleAppointmentId || undefined,
      })
      
      setAvailableDates(availableDates.map(date => ({ date })))
    } catch (error) {
      console.error('Failed to load dates:', error)
    } finally {
      setIsLoadingDates(false)
    }
  }

  // Load Time Slots
  useEffect(() => {
    if (selectedDate && selectedService) {
      loadTimeSlots()
    }
  }, [selectedDate, selectedService])

  const loadTimeSlots = async () => {
    if (!selectedService || !selectedDate) return
    
    // Determine clinic and doctor IDs from preSelectedSlot or props
    const effectiveClinicId = preSelectedSlot?.clinicId || clinicId
    const effectiveDoctorId = preSelectedSlot?.doctorId || doctorId
    
    if (!effectiveClinicId || !effectiveDoctorId) {
      console.error('Missing clinic or doctor ID for loading time slots')
      return
    }
    
    setIsLoadingSlots(true)
    try {
      // Use TabibDesk slots API which respects doctor availability and buffers
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
      
      // Transform TabibDesk Slot format to TimeSlot format
      setTimeSlots(availableSlots.map(slot => ({
        starts_at: slot.startAt,
        ends_at: slot.endAt,
      })))
    } catch (error) {
      console.error('Failed to load time slots:', error)
    } finally {
      setIsLoadingSlots(false)
    }
  }

  // Handle Patient Selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setCurrentStep("service")
  }

  // Handle Service Selection
  const handleServiceSelect = (service: AppBookableService) => {
    setSelectedService(service)
    // If we have a pre-selected slot, skip datetime and go to confirmation
    if (preSelectedSlot) {
      // Set the slot data from preSelectedSlot
      setSelectedDate(preSelectedSlot.startAt.split('T')[0])
      setSelectedSlot({
        starts_at: preSelectedSlot.startAt,
        ends_at: preSelectedSlot.endAt,
      })
      setCurrentStep("confirmation")
    } else {
      setCurrentStep("datetime")
    }
  }

  // Handle Date Selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null) // Reset slot when date changes
  }

  // Handle Slot Selection
  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setCurrentStep("confirmation")
  }

  // Handle Back Navigation
  const handleBack = () => {
    switch (currentStep) {
      case "service":
        if (initialPatient) {
          // If we started with a patient, go back to service selection
          setCurrentStep("service")
        } else {
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
        // If we have a pre-selected slot, go back to service (skip datetime)
        if (preSelectedSlot) {
          setSelectedSlot(null)
          setSelectedDate(null)
          setCurrentStep("service")
        } else {
          setSelectedSlot(null)
          setCurrentStep("datetime")
        }
        break
    }
  }

  // Handle Booking Submission
  const handleConfirmBooking = async () => {
    if (!selectedPatient || !selectedService || !selectedSlot) return
    
    setIsSubmitting(true)
    try {
      // If rescheduling, update existing appointment
      if (rescheduleAppointmentId) {
        await updateAppointmentTime(
          rescheduleAppointmentId,
          selectedSlot.starts_at,
          selectedSlot.ends_at
        )
        
        setCurrentStep("success")
        if (onBookingComplete) {
          setTimeout(() => {
            onBookingComplete()
          }, 1500)
        }
      }
      // If we have a pre-selected slot, create appointment using TabibDesk API
      else if (preSelectedSlot) {
        await createAppointment({
          patientId: selectedPatient.id,
          patientName: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
          patientPhone: selectedPatient.phone,
          clinicId: preSelectedSlot.clinicId,
          doctorId: preSelectedSlot.doctorId,
          startAt: selectedSlot.starts_at,
          endAt: selectedSlot.ends_at,
          appointmentType: selectedService.app_appointment_type_name || selectedService.title,
          notes: undefined,
        })
        
        setCurrentStep("success")
        if (onBookingComplete) {
          setTimeout(() => {
            onBookingComplete()
          }, 1500)
        }
      } else {
        // This should never happen - all bookings require either a pre-selected slot or reschedule
        console.error('Invalid booking state: missing preSelectedSlot or rescheduleAppointmentId')
        throw new Error('Invalid booking state')
      }
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle New Booking
  const handleNewBooking = () => {
    setSelectedPatient(initialPatient)
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedSlot(null)
    setCurrentStep(initialPatient ? "service" : "patient")
  }

  // Format Time
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Format Date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      {showHeader && showBackButton && currentStep !== "success" && (
        <div className="mb-3">
          {onCancel ? (
            <Button variant="ghost" onClick={onCancel} className="mb-2 -ml-2">
              <RiArrowLeftLine className="mr-2 size-4" />
              Cancel
            </Button>
          ) : (
            <Link href="/appointments">
              <Button variant="ghost" className="mb-2 -ml-2">
                <RiArrowLeftLine className="mr-2 size-4" />
                Back to Appointments
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Header */}
      {showTitle && (
        <div className="mb-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Book Appointment</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Schedule a new appointment for a patient
          </p>
        </div>
      )}

      {/* Slot Context Banner - shown when filling a specific slot */}
      {preSelectedSlot && slotContextInfo && currentStep !== "success" && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/10 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <RiHospitalLine className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium">
                Filling slot for <span className="font-semibold">{slotContextInfo.doctorName}</span> at{" "}
                <span className="font-semibold">{slotContextInfo.clinicName}</span>
              </p>
              <p className="mt-1 text-blue-700 dark:text-blue-300">
                {formatDate(preSelectedSlot.startAt.split('T')[0])} at{" "}
                {formatTime(preSelectedSlot.startAt)} - {formatTime(preSelectedSlot.endAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { key: "patient", label: "Patient" },
            { key: "service", label: "Service" },
            ...(preSelectedSlot ? [] : [{ key: "datetime", label: "Date & Time" }]),
            { key: "confirmation", label: "Confirm" },
          ].map((step, index, array) => {
            const stepKeys = array.map(s => s.key)
            const stepIndex = stepKeys.indexOf(currentStep)
            const isActive = step.key === currentStep
            const isCompleted = index < stepIndex || currentStep === "success"
            
            return (
              <div key={step.key} className="flex flex-1 items-center">
                <div className="flex items-center">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                      isCompleted
                        ? "bg-primary-600 text-white"
                        : isActive
                        ? "border-2 border-primary-600 bg-white text-primary-600 dark:bg-gray-950"
                        : "border-2 border-gray-300 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-950"
                    }`}
                  >
                    {isCompleted ? <RiCheckLine className="size-5" /> : index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      isActive || isCompleted ? "text-gray-900 dark:text-gray-50" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < array.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 flex-1 ${
                      isCompleted ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className={isEmbedded ? "border-0 shadow-none" : ""}>
        <CardHeader className={isEmbedded ? "px-0 pt-0" : ""}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {currentStep === "patient" && "Search Patient"}
                {currentStep === "service" && "Select Service"}
                {currentStep === "datetime" && "Choose Date & Time"}
                {currentStep === "confirmation" && (rescheduleAppointmentId ? "Confirm Reschedule" : "Confirm Booking")}
                {currentStep === "success" && (rescheduleAppointmentId ? "Appointment Rescheduled!" : "Booking Confirmed!")}
              </CardTitle>
              <CardDescription>
                {currentStep === "patient" && "Search for the patient by name or phone"}
                {currentStep === "service" && "Choose the type of appointment"}
                {currentStep === "datetime" && "Pick an available date and time slot"}
                {currentStep === "confirmation" && "Review and confirm the appointment details"}
                {currentStep === "success" && (rescheduleAppointmentId ? "The appointment has been successfully rescheduled" : "The appointment has been successfully booked")}
              </CardDescription>
            </div>
            {currentStep !== "patient" && currentStep !== "success" && (
              <Button variant="ghost" onClick={handleBack}>
                <RiArrowLeftLine className="mr-2 size-4" />
                Back
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className={isEmbedded ? "px-0" : ""}>
          {/* STEP 1: Patient Selection */}
          {currentStep === "patient" && (
            <div className="space-y-6">
              <PatientSelector
                initialPatient={initialPatient}
                onPatientSelect={handlePatientSelect}
                showEmail={true}
                required={true}
              />
            </div>
          )}

          {/* STEP 2: Service Selection */}
          {currentStep === "service" && (
            <div className="space-y-4">
              {selectedPatient && (
                <Alert variant="success">
                  <strong>Patient:</strong> {selectedPatient.first_name} {selectedPatient.last_name}
                </Alert>
              )}

              {isLoadingServices ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="rounded-lg border border-gray-200 p-4 text-left transition hover:border-primary-600 hover:bg-primary-50 dark:border-gray-800 dark:hover:border-primary-600 dark:hover:bg-primary-900/20"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-gray-50">{service.title}</h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                      <p className="mt-2 text-sm font-medium text-primary-600 dark:text-primary-400">
                        {service.duration_minutes} minutes
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Date & Time Selection */}
          {currentStep === "datetime" && (
            <div className="space-y-6">
              {selectedService && (
                <Alert variant="success">
                  <strong>Service:</strong> {selectedService.title} ({selectedService.duration_minutes} min)
                </Alert>
              )}

              {/* Date Selection */}
              <div>
                <Label>Select Date</Label>
                {isLoadingDates ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-7">
                    {[...Array(14)].map((_, i) => (
                      <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 grid gap-2 sm:grid-cols-7">
                    {availableDates.slice(0, 14).map((dateObj) => {
                      const date = new Date(dateObj.date)
                      const isSelected = selectedDate === dateObj.date
                      return (
                        <button
                          key={dateObj.date}
                          onClick={() => handleDateSelect(dateObj.date)}
                          className={`rounded-lg border p-3 text-center transition ${
                            isSelected
                              ? "border-primary-600 bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                              : "border-gray-200 hover:border-primary-600 dark:border-gray-800"
                          }`}
                        >
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-50">
                            {date.getDate()}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <Label>Select Time</Label>
                  {isLoadingSlots ? (
                    <div className="mt-2 grid gap-2 sm:grid-cols-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 grid gap-2 sm:grid-cols-4">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.starts_at}
                          onClick={() => handleSlotSelect(slot)}
                          className="rounded-lg border border-gray-200 p-3 text-center transition hover:border-primary-600 hover:bg-primary-50 dark:border-gray-800 dark:hover:border-primary-600 dark:hover:bg-primary-900/20"
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-50">
                            {formatTime(slot.starts_at)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Confirmation */}
          {currentStep === "confirmation" && (
            <div className="space-y-6">
              <Alert variant="default" title="Review Booking Details">
                Please confirm all details are correct before booking
              </Alert>

              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <RiUserLine className="mt-0.5 size-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Patient</p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-gray-50">
                      {selectedPatient?.first_name} {selectedPatient?.last_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPatient?.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <RiCalendarLine className="mt-0.5 size-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Service</p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-gray-50">
                      {selectedService?.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedService?.duration_minutes} minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <RiTimeLine className="mt-0.5 size-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date & Time</p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-gray-50">
                      {selectedDate && formatDate(selectedDate)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedSlot && formatTime(selectedSlot.starts_at)} - {selectedSlot && formatTime(selectedSlot.ends_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={handleBack} disabled={isSubmitting}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleConfirmBooking} disabled={isSubmitting}>
                  {isSubmitting ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {currentStep === "success" && (
            <div className="py-8 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <RiCheckLine className="size-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-gray-50">
                {rescheduleAppointmentId ? "Appointment Rescheduled Successfully!" : "Appointment Booked Successfully!"}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                The patient has been notified and will receive a confirmation.
              </p>
              <Button variant="primary" onClick={handleNewBooking} className="mt-6">
                {rescheduleAppointmentId ? "Done" : "Book Another Appointment"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
