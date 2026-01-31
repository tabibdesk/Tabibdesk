"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
import { format } from "date-fns"

// Types
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

interface WaitlistEntry {
  id: string
  patientId: string
  patientName: string
  patientPhone: string
  appointmentType?: string
  notes?: string
}

interface BookAppointmentFlowProps {
  initialPatient?: Patient | null
  showBackButton?: boolean
  showTitle?: boolean
  showHeader?: boolean
  isEmbedded?: boolean
  preSelectedSlot?: PreSelectedSlot | null
  rescheduleAppointmentId?: string | null
  waitlistEntry?: WaitlistEntry | null
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
  waitlistEntry = null,
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
      else if (preSelectedSlot || waitlistEntry) {
        const effectiveClinicId = preSelectedSlot?.clinicId || clinicId
        const effectiveDoctorId = preSelectedSlot?.doctorId || doctorId

        if (!effectiveClinicId || !effectiveDoctorId) {
          throw new Error('Missing clinic or doctor ID')
        }

        await createAppointment({
          patientId: selectedPatient.id,
          patientName: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
          patientPhone: selectedPatient.phone,
          clinicId: effectiveClinicId,
          doctorId: effectiveDoctorId,
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
    <div className="space-y-4">
      {/* Header */}
      {showTitle && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Book Appointment</h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Schedule a new appointment for a patient
          </p>
        </div>
      )}

      {/* Slot Context Banner - redesigned to be professional and on-theme */}
      {preSelectedSlot && slotContextInfo && currentStep !== "success" && (
        <div className="rounded-xl bg-gray-50/50 border border-gray-100 p-3 dark:bg-gray-900/50 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <RiCalendarLine className="size-5 text-primary-600 dark:text-primary-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
                <span>{format(new Date(preSelectedSlot.startAt), "EEEE, MMM d")}</span>
                <span className="text-gray-300">•</span>
                <span>{formatTime(preSelectedSlot.startAt)} – {formatTime(preSelectedSlot.endAt)}</span>
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                {slotContextInfo.clinicName} <span className="mx-1 text-gray-300">•</span> {slotContextInfo.doctorName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps - Compact Numbered Stepper */}
      <div className="py-2">
        <div className="flex items-center justify-center max-w-sm mx-auto">
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
                {index < array.length - 1 && (
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

      {/* Step Content */}
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
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">
                Choose Service Type
              </Label>
              {isLoadingServices ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"></div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="group relative rounded-xl border border-gray-100 p-3 text-left transition-all hover:border-primary-200 hover:bg-primary-50/30 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-primary-800 shadow-sm"
                    >
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50">{service.title}</h3>
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
          )}

          {/* STEP 3: Date & Time Selection */}
          {currentStep === "datetime" && (
            <div className="space-y-4">
              {/* Date Selection */}
              <div>
                <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">Select Date</Label>
                {isLoadingDates ? (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="h-16 w-14 shrink-0 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"></div>
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
                          onClick={() => handleDateSelect(dateObj.date)}
                          className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border transition-all ${
                            isSelected
                              ? "border-primary-600 bg-primary-600 text-white shadow-md shadow-primary-200"
                              : "border-gray-100 bg-white hover:border-primary-200 dark:border-gray-800 dark:bg-gray-950"
                          }`}
                        >
                          <span className={`text-[10px] font-bold uppercase ${isSelected ? "text-primary-100" : "text-gray-400"}`}>
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className={`text-base font-bold ${isSelected ? "text-white" : "text-gray-900 dark:text-gray-50"}`}>
                            {date.getDate()}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">Select Time</Label>
                  {isLoadingSlots ? (
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.starts_at}
                          onClick={() => handleSlotSelect(slot)}
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
          )}

          {/* STEP 4: Confirmation */}
          {currentStep === "confirmation" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-primary-50/50 border border-primary-100 p-3 dark:bg-primary-900/10 dark:border-primary-800">
                <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-1.5">
                  <RiCheckLine className="size-4" />
                  Review details before confirming
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                    <RiUserLine className="size-4.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Patient</p>
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Service</p>
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Date & Time</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
                      {selectedDate && format(new Date(selectedDate), "EEEE, MMMM d")}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-bold">
                      {selectedSlot && formatTime(selectedSlot.starts_at)} – {selectedSlot && formatTime(selectedSlot.ends_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="secondary" 
                  className="flex-1 text-[11px] h-11 px-2.5 font-bold border-gray-200 dark:border-gray-800" 
                  onClick={handleBack} 
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-[2] text-[11px] h-11 px-2.5 font-bold bg-gray-900 shadow-lg active:scale-[0.98] transition-all" 
                  onClick={handleConfirmBooking} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}

      {/* Back/Cancel Navigation - below step content */}
      {currentStep !== "success" && currentStep !== "confirmation" && (
        <div className="flex items-center -ml-1 pt-2">
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

          {/* SUCCESS */}
          {currentStep === "success" && (
            <div className="py-12 text-center animate-in fade-in zoom-in duration-300">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 border-4 border-white dark:border-gray-900 shadow-sm">
                <RiCheckLine className="size-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-gray-50">
                {rescheduleAppointmentId ? "Rescheduled!" : "Booking Confirmed!"}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                The appointment has been successfully updated in the system.
              </p>
            </div>
          )}
    </div>
  )
}
