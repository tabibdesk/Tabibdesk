/**
 * Slots API - provides available slots for booking/rescheduling
 * Uses doctor availability and respects buffer times
 */

import { getAppointmentSettings } from "@/api/settings.api"
import { listDoctorSchedules } from "./availability.api"
import { listByDay } from "./appointments.api"
import { generateSlotsFromAvailability, mergeAppointmentsIntoSlots } from "./utils/slotGeneration"
import type { Slot } from "./types"

/**
 * Get available slots for a specific date range
 * This is used for booking/rescheduling appointments
 */
export async function getAvailableSlots(params: {
  clinicId: string
  doctorId: string
  startDate: Date
  endDate: Date
  excludeAppointmentId?: string // For rescheduling, exclude the appointment being rescheduled
}): Promise<{
  [date: string]: Slot[] // Key is YYYY-MM-DD, value is array of available slots
}> {
  const { clinicId, doctorId, startDate, endDate, excludeAppointmentId } = params
  
  // Fetch settings
  const apptSettings = await getAppointmentSettings(clinicId)
  const bufferMinutes = apptSettings.bufferMinutes || 5
  const slotDurationMinutes = apptSettings.slotDurationMinutes || 30
  
  // Fetch doctor availability
  const availability = await listDoctorSchedules({ doctorId, clinicId })
  
  if (availability.length === 0) {
    console.warn(`No availability found for doctor ${doctorId} in clinic ${clinicId}`)
    return {}
  }
  
  const slotsByDate: { [date: string]: Slot[] } = {}
  
  // Generate slots for each day in the range
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0]
    
    // Generate all slots for this day
    const generatedSlots = generateSlotsFromAvailability(
      availability,
      currentDate,
      bufferMinutes,
      slotDurationMinutes
    )
    
    // Get appointments for this day
    const appointments = await listByDay({
      clinicId,
      doctorId,
      date: dateStr,
    })
    
    // Filter out the appointment being rescheduled if specified
    const filteredAppointments = excludeAppointmentId
      ? appointments.filter((apt) => apt.id !== excludeAppointmentId)
      : appointments
    
    // Merge appointments into slots
    const slotsWithAppointments = mergeAppointmentsIntoSlots(generatedSlots, filteredAppointments)
    
    // Filter to only show empty slots (available for booking)
    const availableSlots = slotsWithAppointments.filter((slot) => slot.state === "empty")
    
    slotsByDate[dateStr] = availableSlots
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return slotsByDate
}

/**
 * Get available dates with at least one open slot
 * Used for date picker in booking flow
 */
export async function getAvailableDates(params: {
  clinicId: string
  doctorId: string
  startDate: Date
  endDate: Date
  excludeAppointmentId?: string
}): Promise<string[]> {
  const slotsByDate = await getAvailableSlots(params)
  
  // Return only dates that have at least one available slot
  return Object.keys(slotsByDate).filter((date) => slotsByDate[date].length > 0)
}
