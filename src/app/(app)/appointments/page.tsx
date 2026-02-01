"use client"

import { useState, useEffect, useRef } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { PageHeader } from "@/components/shared/PageHeader"
import { AppointmentsHeader, DoctorSelector } from "@/features/appointments/components/AppointmentsHeader"
import { DailyScheduleView, type DailyScheduleViewRef } from "@/features/appointments/components/DailyScheduleView"
import { WaitlistTab } from "@/features/appointments/components/WaitlistTab"
import { BookAppointmentDrawer } from "@/features/appointments/components/BookAppointmentDrawer"
import { AddToWaitlistDrawer } from "@/features/appointments/waitlist/AddToWaitlistDrawer"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useDemo } from "@/contexts/demo-context"
import { DEMO_CLINIC_ID, DEMO_DOCTOR_ID } from "@/data/mock/mock-data"
import type { Slot, WaitlistEntry } from "@/features/appointments/types"

export default function AppointmentsPage() {
  const t = useAppTranslations()
  const { currentUser, currentClinic } = useUserClinic()
  useDemo()
  
  // Use global clinic from context
  const clinicId = currentClinic?.id || DEMO_CLINIC_ID
  
  // Determine initial doctor ID
  // If current user is a doctor, use their ID; otherwise will be set by AppointmentsFilters
  const getInitialDoctorId = () => {
    if (currentUser.role === "doctor") {
      return currentUser.id
    }
    // For assistants/managers, will be set by AppointmentsFilters based on clinic
    return DEMO_DOCTOR_ID
  }
  
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(getInitialDoctorId())
  const [activeTab, setActiveTab] = useState<"appointments" | "waitlist">("appointments")
  const scheduleViewRef = useRef<DailyScheduleViewRef>(null)
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false)
  const [selectedSlotForFill, setSelectedSlotForFill] = useState<Slot | null>(null)
  const [rescheduleSlot, setRescheduleSlot] = useState<Slot | null>(null)
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string | null>(null)
  const [waitlistEntryToBook, setWaitlistEntryToBook] = useState<WaitlistEntry | null>(null)
  const [showAddToWaitlistDrawer, setShowAddToWaitlistDrawer] = useState(false)
  
  // Use selected doctor ID, or fallback to current user if they're a doctor
  const effectiveDoctorId = selectedDoctorId || (currentUser.role === "doctor" ? currentUser.id : DEMO_DOCTOR_ID)
  
  // Handle slot click - open BookAppointmentDrawer with pre-selected slot
  const handleFillSlot = (slot: Slot) => {
    setSelectedSlotForFill(slot)
    setRescheduleSlot(null)
    setWaitlistEntryToBook(null)
    setIsBookingDrawerOpen(true)
  }
  
  // Handle reschedule - open drawer with patient pre-selected but no slot
  const handleReschedule = (slot: Slot) => {
    setRescheduleSlot(slot)
    setRescheduleAppointmentId(slot.appointmentId || null)
    setSelectedSlotForFill(null)
    setWaitlistEntryToBook(null)
    setIsBookingDrawerOpen(true)
  }

  // Handle Waitlist Booking
  const handleBookFromWaitlist = (entry: WaitlistEntry) => {
    setWaitlistEntryToBook(entry)
    setRescheduleSlot(null)
    setRescheduleAppointmentId(null)
    setSelectedSlotForFill(null)
    setIsBookingDrawerOpen(true)
  }
  
  // Handle booking complete
  const handleBookingComplete = async () => {
    // Refetch appointments after booking/rescheduling
    if (scheduleViewRef.current) {
      await scheduleViewRef.current.refetch()
    }
    // Reset selected slots
    setSelectedSlotForFill(null)
    setRescheduleSlot(null)
    setRescheduleAppointmentId(null)
    setWaitlistEntryToBook(null)
  }
  
  // Handle drawer close
  const handleDrawerClose = () => {
    setIsBookingDrawerOpen(false)
    setSelectedSlotForFill(null)
    setRescheduleSlot(null)
    setRescheduleAppointmentId(null)
    setWaitlistEntryToBook(null)
  }
  
  // Reset doctor selection when clinic changes (if user is not a doctor)
  useEffect(() => {
    if (currentUser.role !== "doctor") {
      // AppointmentsFilters will handle setting the correct doctor
      // But we can reset here to trigger the effect in AppointmentsFilters
      setSelectedDoctorId(DEMO_DOCTOR_ID)
    } else {
      // If user is a doctor, keep their ID
      setSelectedDoctorId(currentUser.id)
    }
  }, [clinicId, currentUser])
  
  return (
    <div className="page-content">
      <PageHeader
        title={t.nav.appointments}
        actions={
          <DoctorSelector
            clinicId={clinicId}
            selectedDoctorId={effectiveDoctorId}
            onDoctorChange={setSelectedDoctorId}
          />
        }
      />
      <AppointmentsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {activeTab === "appointments" ? (
        <DailyScheduleView
          ref={scheduleViewRef}
          clinicId={clinicId}
          doctorId={effectiveDoctorId}
          onFillSlot={handleFillSlot}
          onReschedule={handleReschedule}
        />
      ) : (
        <WaitlistTab 
          clinicId={clinicId} 
          doctorId={effectiveDoctorId} 
          onBook={handleBookFromWaitlist}
          onAddToWaitlist={() => setShowAddToWaitlistDrawer(true)}
        />
      )}
      
      <BookAppointmentDrawer
        open={isBookingDrawerOpen}
        onClose={handleDrawerClose}
        onBookingComplete={handleBookingComplete}
        preSelectedSlot={selectedSlotForFill ? {
          clinicId: selectedSlotForFill.clinicId,
          doctorId: selectedSlotForFill.doctorId,
          startAt: selectedSlotForFill.startAt,
          endAt: selectedSlotForFill.endAt,
          appointmentType: selectedSlotForFill.appointmentType,
        } : null}
        initialPatient={
          waitlistEntryToBook ? {
            id: waitlistEntryToBook.patientId,
            first_name: waitlistEntryToBook.patientName.split(" ")[0] || "",
            last_name: waitlistEntryToBook.patientName.split(" ").slice(1).join(" ") || "",
            phone: waitlistEntryToBook.patientPhone,
            email: null,
          } :
          rescheduleSlot && rescheduleSlot.patientId ? {
            id: rescheduleSlot.patientId,
            first_name: rescheduleSlot.patientName?.split(" ")[0] || "",
            last_name: rescheduleSlot.patientName?.split(" ").slice(1).join(" ") || "",
            phone: rescheduleSlot.patientPhone || "",
            email: null,
          } : null
        }
        rescheduleAppointmentId={rescheduleAppointmentId}
        waitlistEntry={waitlistEntryToBook}
        clinicId={rescheduleSlot?.clinicId || clinicId}
        doctorId={rescheduleSlot?.doctorId || effectiveDoctorId}
      />
      
      <AddToWaitlistDrawer
        open={showAddToWaitlistDrawer}
        onClose={() => setShowAddToWaitlistDrawer(false)}
        onComplete={() => {
          setShowAddToWaitlistDrawer(false)
          // The waitlist will refetch automatically via the useWaitlist hook
        }}
      />
    </div>
  )
}
