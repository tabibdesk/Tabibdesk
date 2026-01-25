/**
 * Slot generation utilities
 * Pure functions for generating slots from availability and merging appointments
 */

import type { Slot, DoctorAvailability, Appointment } from "../types"

/**
 * Generate all slots for a date from availability schedules
 * @param availability - Doctor availability schedules
 * @param date - Date to generate slots for
 * @param bufferMinutes - Buffer minutes between slots (default: 0)
 * @param slotDurationMinutes - Override slot duration from availability (optional, deprecated - use appointmentTypeDurations)
 */
export function generateSlotsFromAvailability(
  availability: DoctorAvailability[],
  date: Date,
  bufferMinutes: number = 0,
  slotDurationMinutes?: number
): Slot[] {
  const slots: Slot[] = []
  const dateStr = date.toISOString().split("T")[0]
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
  
  for (const avail of availability) {
    if (!avail.daysOfWeek.includes(dayName)) continue
    
    const start = new Date(`${dateStr}T${avail.startTime}:00`)
    const end = new Date(`${dateStr}T${avail.endTime}:00`)
    const bufferMs = bufferMinutes * 60 * 1000
    
    // Use default slot duration - appointment type will be selected at booking time
    const defaultDuration = slotDurationMinutes || avail.slotDuration
    const durationMs = defaultDuration * 60 * 1000
    
    let current = new Date(start)
    
    while (current.getTime() + durationMs <= end.getTime()) {
      // Check if slot overlaps with break
      const isBreak = avail.breaks?.some((br) => {
        const breakStart = new Date(`${dateStr}T${br.startTime}:00`)
        const breakEnd = new Date(`${dateStr}T${br.endTime}:00`)
        return current < breakEnd && current.getTime() + durationMs > breakStart.getTime()
      })
      
      if (!isBreak) {
        const slotEnd = new Date(current.getTime() + durationMs)
        slots.push({
          id: `slot-${avail.doctorId}-${avail.clinicId}-${current.getTime()}`,
          clinicId: avail.clinicId,
          doctorId: avail.doctorId,
          startAt: current.toISOString(),
          endAt: slotEnd.toISOString(),
          appointmentType: "flexible", // Type will be selected at booking time
          state: "empty",
        })
      }
      
      // Move to next slot: current slot end + buffer
      current = new Date(current.getTime() + durationMs + bufferMs)
    }
  }
  
  // Sort slots by start time
  slots.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  
  return slots
}

/**
 * Merge appointments into slots
 */
export function mergeAppointmentsIntoSlots(
  slots: Slot[],
  appointments: Appointment[]
): Slot[] {
  return slots.map((slot) => {
    const appointment = appointments.find((apt) => {
      const aptStart = new Date(apt.startAt)
      const slotStart = new Date(slot.startAt)
      return (
        apt.doctorId === slot.doctorId &&
        apt.clinicId === slot.clinicId &&
        Math.abs(aptStart.getTime() - slotStart.getTime()) < 60000 // 1 minute tolerance
      )
    })
    
    if (appointment) {
      return {
        ...slot,
        id: appointment.id,
        state: appointment.status === "cancelled" ? "cancelled" : "booked",
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        patientPhone: appointment.patientPhone,
      }
    }
    
    return slot
  })
}
