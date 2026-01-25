/**
 * Doctor Availability API - handles doctor schedules and slot generation
 * Currently uses mock data, but structured for easy backend replacement
 */

import { mockData, DEMO_CLINIC_ID, DEMO_DOCTOR_ID } from "@/data/mock/mock-data"
import type { DoctorAvailability } from "./types"

// In-memory store for availability (demo mode only)
let availabilityStore: DoctorAvailability[] = []

// Initialize store with mock data
function initializeStore() {
  if (availabilityStore.length === 0) {
    // Initialize from mock data if available
    if (mockData.doctorAvailability && mockData.doctorAvailability.length > 0) {
      availabilityStore = [...mockData.doctorAvailability]
    } else {
      // Fallback: Create default availability for demo doctor
      // Use "user-001" as default (first doctor from mockUsers)
      // Use "clinic-001" as default (first clinic from mockClinics)
      availabilityStore = [
        {
          id: "avail-001",
          doctorId: "user-001", // Match user IDs from users-clinics.ts
          clinicId: "clinic-001", // Match clinic IDs from users-clinics.ts
          daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          startTime: "09:00",
          endTime: "17:00",
          slotDuration: 30,
          appointmentTypeDurations: {
            "new": 60,
            "followup": 30,
            "online": 45,
          },
          breaks: [
            { startTime: "12:00", endTime: "13:00" }, // Lunch break
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
    }
  }
}

/**
 * List availability by doctor
 */
export async function listByDoctor(
  doctorId: string,
  clinicId?: string
): Promise<DoctorAvailability[]> {
  initializeStore()
  return availabilityStore.filter(
    (avail) => avail.doctorId === doctorId && (!clinicId || avail.clinicId === clinicId)
  )
}

/**
 * List doctor schedules (alias for listByDoctor, for consistency)
 */
export async function listDoctorSchedules(params: {
  doctorId: string
  clinicId?: string
}): Promise<DoctorAvailability[]> {
  return listByDoctor(params.doctorId, params.clinicId)
}

/**
 * Get all doctor IDs who have availability at a specific clinic
 */
export async function listDoctorsByClinic(clinicId: string): Promise<string[]> {
  initializeStore()
  const uniqueDoctorIds = new Set<string>()
  
  availabilityStore
    .filter((avail) => avail.clinicId === clinicId)
    .forEach((avail) => {
      uniqueDoctorIds.add(avail.doctorId)
    })
  
  return Array.from(uniqueDoctorIds)
}

/**
 * Create availability
 */
export async function create(availability: Omit<DoctorAvailability, "id" | "createdAt" | "updatedAt">): Promise<DoctorAvailability> {
  initializeStore()
  const newAvailability: DoctorAvailability = {
    ...availability,
    id: `avail-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  availabilityStore.push(newAvailability)
  return newAvailability
}

/**
 * Update availability
 */
export async function update(
  id: string,
  updates: Partial<Omit<DoctorAvailability, "id" | "createdAt">>
): Promise<DoctorAvailability> {
  initializeStore()
  const index = availabilityStore.findIndex((avail) => avail.id === id)
  if (index === -1) {
    throw new Error("Availability not found")
  }
  
  const updated: DoctorAvailability = {
    ...availabilityStore[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  availabilityStore[index] = updated
  return updated
}

/**
 * Delete availability
 */
export async function deleteAvailability(id: string): Promise<void> {
  initializeStore()
  const index = availabilityStore.findIndex((avail) => avail.id === id)
  if (index === -1) {
    throw new Error("Availability not found")
  }
  availabilityStore.splice(index, 1)
}

/**
 * Generate slots for a specific date from availability schedules
 * Pure function: takes availability + date, returns all slots
 */
export async function generateSlotsForDate(params: {
  doctorId: string
  clinicId: string
  date: Date
}): Promise<import("./types").Slot[]> {
  // Import here to avoid circular dependency
  const { generateSlotsFromAvailability } = require("./utils/slotGeneration")
  const availability = await listByDoctor(params.doctorId, params.clinicId)
  return generateSlotsFromAvailability(availability, params.date)
}
