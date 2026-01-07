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
} from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"

// Types
interface Patient {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
}

interface AppBookableService {
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

export default function BookAppointmentPage() {
  const { isDemoMode } = useDemo()
  
  // State
  const [currentStep, setCurrentStep] = useState<"patient" | "service" | "datetime" | "confirmation" | "success">("patient")
  const [patientMode, setPatientMode] = useState<"existing" | "new">("existing")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedService, setSelectedService] = useState<AppBookableService | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // New Patient Form State
  const [newPatientForm, setNewPatientForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  })
  
  // Search & Loading States
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [services, setServices] = useState<AppBookableService[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])
  const [isLoadingDates, setIsLoadingDates] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Patient Search with Debounce
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(() => {
      searchPatients(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const searchPatients = async (term: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/patients/search?q=${encodeURIComponent(term)}&demo=${isDemoMode}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

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
    
    setIsLoadingDates(true)
    try {
      const response = await fetch(
        `/api/tidycal/available-dates?bookingTypeId=${selectedService.id}&demo=${isDemoMode}`
      )
      const data = await response.json()
      setAvailableDates(data)
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
    
    setIsLoadingSlots(true)
    try {
      const response = await fetch(
        `/api/tidycal/timeslots?bookingTypeId=${selectedService.id}&date=${selectedDate}&demo=${isDemoMode}`
      )
      const data = await response.json()
      setTimeSlots(data)
    } catch (error) {
      console.error('Failed to load time slots:', error)
    } finally {
      setIsLoadingSlots(false)
    }
  }

  // Handle Patient Selection
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setSearchTerm("")
    setSearchResults([])
    setCurrentStep("service")
  }

  // Handle New Patient Form Submit
  const handleNewPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create a temporary patient object
    const emailValue = newPatientForm.email.trim()
    const newPatient: Patient = {
      id: `temp-${Date.now()}`,
      first_name: newPatientForm.first_name,
      last_name: newPatientForm.last_name,
      phone: newPatientForm.phone,
      email: emailValue ? emailValue : null,
    }
    
    setSelectedPatient(newPatient)
    setCurrentStep("service")
  }

  // Handle Service Selection
  const handleServiceSelect = (service: AppBookableService) => {
    setSelectedService(service)
    setCurrentStep("datetime")
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
        setSelectedPatient(null)
        setNewPatientForm({
          first_name: "",
          last_name: "",
          phone: "",
          email: "",
        })
        setCurrentStep("patient")
        break
      case "datetime":
        setSelectedService(null)
        setSelectedDate(null)
        setCurrentStep("service")
        break
      case "confirmation":
        setSelectedSlot(null)
        setCurrentStep("datetime")
        break
    }
  }

  // Handle Booking Submission
  const handleConfirmBooking = async () => {
    if (!selectedPatient || !selectedService || !selectedSlot) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/tidycal/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingTypeId: selectedService.id,
          startsAt: selectedSlot.starts_at,
          patientId: selectedPatient.id,
          name: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
          email: selectedPatient.email,
          phone: selectedPatient.phone,
          isDemo: isDemoMode
        })
      })
      
      if (response.ok) {
        setCurrentStep("success")
      }
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle New Booking
  const handleNewBooking = () => {
    setSelectedPatient(null)
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedSlot(null)
    setPatientMode("existing")
    setNewPatientForm({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
    })
    setCurrentStep("patient")
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
    <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
      {/* Back Navigation */}
      <div className="mb-3">
        <Link href="/appointments">
          <Button variant="ghost" className="mb-2 -ml-2">
            <RiArrowLeftLine className="mr-2 size-4" />
            Back to Appointments
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Book Appointment</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Schedule a new appointment for a patient
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { key: "patient", label: "Patient" },
            { key: "service", label: "Service" },
            { key: "datetime", label: "Date & Time" },
            { key: "confirmation", label: "Confirm" },
          ].map((step, index) => {
            const stepIndex = ["patient", "service", "datetime", "confirmation"].indexOf(currentStep)
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
                {index < 3 && (
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {currentStep === "patient" && "Search Patient"}
                {currentStep === "service" && "Select Service"}
                {currentStep === "datetime" && "Choose Date & Time"}
                {currentStep === "confirmation" && "Confirm Booking"}
                {currentStep === "success" && "Booking Confirmed!"}
              </CardTitle>
              <CardDescription>
                {currentStep === "patient" && "Search for the patient by name or phone"}
                {currentStep === "service" && "Choose the type of appointment"}
                {currentStep === "datetime" && "Pick an available date and time slot"}
                {currentStep === "confirmation" && "Review and confirm the appointment details"}
                {currentStep === "success" && "The appointment has been successfully booked"}
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
        <CardContent>
          {/* STEP 1: Patient Selection */}
          {currentStep === "patient" && (
            <div className="space-y-6">
              {/* Patient Mode Selection */}
              <div>
                <Label>Patient Type</Label>
                <div className="mt-3 flex gap-4">
                  <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition hover:border-primary-600 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 dark:border-gray-800 dark:has-[:checked]:border-primary-600 dark:has-[:checked]:bg-primary-900/20">
                    <input
                      type="radio"
                      name="patient-mode"
                      value="existing"
                      checked={patientMode === "existing"}
                      onChange={() => setPatientMode("existing")}
                      className="size-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-50">Existing Patient</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Search from patient database</p>
                    </div>
                  </label>
                  
                  <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition hover:border-primary-600 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 dark:border-gray-800 dark:has-[:checked]:border-primary-600 dark:has-[:checked]:bg-primary-900/20">
                    <input
                      type="radio"
                      name="patient-mode"
                      value="new"
                      checked={patientMode === "new"}
                      onChange={() => setPatientMode("new")}
                      className="size-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-50">New Patient</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Create a new patient record</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Existing Patient Search */}
              {patientMode === "existing" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patient-search">Search Patient</Label>
                    <div className="relative">
                      <Input
                        id="patient-search"
                        placeholder="Type patient name or phone number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      {searchResults.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handlePatientSelect(patient)}
                          className="w-full rounded-lg border border-gray-200 p-4 text-left transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
                              <RiUserLine className="size-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-50">
                                {patient.first_name} {patient.last_name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {patient.phone} {patient.email && `• ${patient.email}`}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && (
                    <Alert variant="default">
                      No patients found matching &quot;{searchTerm}&quot;
                    </Alert>
                  )}
                </div>
              )}

              {/* New Patient Form */}
              {patientMode === "new" && (
                <form onSubmit={handleNewPatientSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="first-name"
                        required
                        value={newPatientForm.first_name}
                        onChange={(e) =>
                          setNewPatientForm({ ...newPatientForm, first_name: e.target.value })
                        }
                        placeholder="Enter first name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last-name">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="last-name"
                        required
                        value={newPatientForm.last_name}
                        onChange={(e) =>
                          setNewPatientForm({ ...newPatientForm, last_name: e.target.value })
                        }
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={newPatientForm.phone}
                      onChange={(e) =>
                        setNewPatientForm({ ...newPatientForm, phone: e.target.value })
                      }
                      placeholder="+20 100 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newPatientForm.email}
                      onChange={(e) =>
                        setNewPatientForm({ ...newPatientForm, email: e.target.value })
                      }
                      placeholder="patient@example.com"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="primary">
                      Continue to Service Selection
                    </Button>
                  </div>
                </form>
              )}
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
                Appointment Booked Successfully!
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                The patient has been notified and will receive a confirmation.
              </p>
              <Button variant="primary" onClick={handleNewBooking} className="mt-6">
                Book Another Appointment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
