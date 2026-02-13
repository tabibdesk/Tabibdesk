/**
 * Waiting List API - replaceable backend layer
 * Currently uses mock data, but structured for easy backend replacement
 */

import { mockData } from "@/data/mock/mock-data"
import type { WaitlistEntry } from "../types"

// Helper to check if in demo mode
function isDemoMode(): boolean {
  if (typeof window !== "undefined") {
    const storedDemoMode = localStorage.getItem("demo-mode")
    return storedDemoMode === "true" || storedDemoMode === null
  }
  return true // Server-side defaults to demo mode
}

export interface ListWaitlistParams {
  clinicId: string
  doctorId?: string
  type?: "new" | "followup" | "online"
  status?: WaitlistEntry["status"]
  priority?: WaitlistEntry["priority"]
  preferredTimeWindow?: WaitlistEntry["preferredTimeWindow"]
  query?: string
  page: number
  pageSize: number
}

export interface ListWaitlistResponse {
  entries: WaitlistEntry[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface CreateWaitlistEntryPayload {
  clinicId: string
  patientId: string
  requestedDoctorId?: string
  appointmentType?: "new" | "followup" | "online"
  earliestDate?: string
  latestDate?: string
  preferredTimeWindow?: "any" | "morning" | "afternoon" | "evening"
  preferredDays?: string[]
  priority?: "low" | "normal" | "high"
  notes?: string
}

export interface SuggestCandidatesParams {
  clinicId: string
  doctorId?: string
  appointmentType?: string
  startAt: string // ISO datetime
  endAt: string // ISO datetime
  limit?: number
}

// In-memory store for waiting list entries (demo mode only)
let waitingListStore: WaitlistEntry[] = []
let isStoreInitialized = false

// Initialize store from mock data
function initializeStore() {
  if (!isStoreInitialized && mockData.waitingListEntries) {
    waitingListStore = [...mockData.waitingListEntries]
    isStoreInitialized = true
  }
}

/**
 * List waiting list entries with filtering and pagination
 */
export async function list(params: ListWaitlistParams): Promise<ListWaitlistResponse> {
  // Return empty list if not in demo mode
  if (!isDemoMode()) {
    return {
      entries: [],
      total: 0,
      page: params.page,
      pageSize: params.pageSize,
      hasMore: false,
    }
  }
  
  initializeStore()
  const { page, pageSize, query, doctorId, type, status, priority, preferredTimeWindow } = params

  let filtered = [...waitingListStore]

  // Filter by doctor
  if (doctorId) {
    filtered = filtered.filter((entry) => !entry.requestedDoctorId || entry.requestedDoctorId === doctorId)
  }

  // Filter by type
  if (type) {
    filtered = filtered.filter((entry) => entry.appointmentType === type)
  }

  // Filter by status
  if (status) {
    filtered = filtered.filter((entry) => entry.status === status)
  }

  // Filter by priority
  if (priority) {
    filtered = filtered.filter((entry) => entry.priority === priority)
  }

  // Filter by time window
  if (preferredTimeWindow) {
    filtered = filtered.filter((entry) => !entry.preferredTimeWindow || entry.preferredTimeWindow === preferredTimeWindow || entry.preferredTimeWindow === "any")
  }

  // Filter by query
  if (query && query.trim()) {
    const lowerQuery = query.toLowerCase().trim()
    filtered = filtered.filter((entry) => {
      const patientName = entry.patientName.toLowerCase()
      const phone = entry.patientPhone.toLowerCase()
      const notes = (entry.notes || "").toLowerCase()
      return patientName.includes(lowerQuery) || phone.includes(lowerQuery) || notes.includes(lowerQuery)
    })
  }

  // Paginate
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginated = filtered.slice(startIndex, endIndex)
  const total = filtered.length
  const hasMore = endIndex < total

  return {
    entries: paginated,
    total,
    page,
    pageSize,
    hasMore,
  }
}

/**
 * Create a new waiting list entry
 */
export async function create(payload: CreateWaitlistEntryPayload): Promise<WaitlistEntry> {
  initializeStore()
  const now = new Date().toISOString()

  // Get patient info from mock data
  const patient = mockData.patients.find((p) => p.id === payload.patientId)
  if (!patient) {
    throw new Error("Patient not found")
  }

  const newEntry: WaitlistEntry = {
    id: `waitlist-${Date.now()}`,
    clinicId: payload.clinicId,
    patientId: payload.patientId,
    patientName: `${patient.first_name} ${patient.last_name}`,
    patientPhone: patient.phone,
    requestedDoctorId: payload.requestedDoctorId,
    appointmentType: payload.appointmentType,
    preferredTimeWindow: payload.preferredTimeWindow || "any",
    preferredDays: payload.preferredDays || [],
    status: "active",
    priority: payload.priority || "normal",
    notes: payload.notes,
    createdAt: now,
    updatedAt: now,
  }

  waitingListStore.push(newEntry)
  return newEntry
}

/**
 * Update waiting list entry status
 */
export async function updateStatus(
  id: string,
  status: WaitlistEntry["status"]
): Promise<WaitlistEntry> {
  initializeStore()
  const entry = waitingListStore.find((e) => e.id === id)
  if (!entry) {
    throw new Error("Waiting list entry not found")
  }

  const updated = {
    ...entry,
    status,
    updatedAt: new Date().toISOString(),
  }

  const index = waitingListStore.findIndex((e) => e.id === id)
  waitingListStore[index] = updated

  return updated
}

/**
 * Get waiting list entry by ID
 */
export async function getById(id: string): Promise<WaitlistEntry | null> {
  initializeStore()
  return waitingListStore.find((e) => e.id === id) || null
}

/**
 * Remove waiting list entry (when it becomes an appointment)
 */
export async function remove(id: string): Promise<void> {
  initializeStore()
  const index = waitingListStore.findIndex((e) => e.id === id)
  if (index === -1) {
    throw new Error("Waiting list entry not found")
  }
  waitingListStore.splice(index, 1)
}

/**
 * Remove all active waitlist entries for a patient
 */
export async function removeByPatientId(patientId: string): Promise<void> {
  initializeStore()
  waitingListStore = waitingListStore.filter((entry) => entry.patientId !== patientId)
}

/**
 * Calculate match score for a candidate against a slot
 */
function calculateMatchScore(
  entry: WaitlistEntry,
  slot: {
    doctorId?: string
    appointmentType?: string
    startAt: string
    endAt: string
  }
): number {
  let score = 0

  const slotDate = new Date(slot.startAt)
  const slotHour = slotDate.getHours()
    const slotDay = slotDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()

  // Doctor match (if specified) = +10 points
  if (slot.doctorId && entry.requestedDoctorId && slot.doctorId === entry.requestedDoctorId) {
    score += 10
  }

  // Appointment type match = +5 points
  if (slot.appointmentType && entry.appointmentType) {
    const slotType = slot.appointmentType.toLowerCase()
    const entryType = entry.appointmentType.toLowerCase()
    if (slotType.includes(entryType) || entryType.includes(slotType)) {
      score += 5
    }
  }

  // Time window match = +5 points
  if (entry.preferredTimeWindow && entry.preferredTimeWindow !== "any") {
    const isMorning = slotHour >= 6 && slotHour < 12
    const isAfternoon = slotHour >= 12 && slotHour < 18
    const isEvening = slotHour >= 18 && slotHour < 21

    if (
      (entry.preferredTimeWindow === "morning" && isMorning) ||
      (entry.preferredTimeWindow === "afternoon" && isAfternoon) ||
      (entry.preferredTimeWindow === "evening" && isEvening)
    ) {
      score += 5
    }
  }

  // Day preference match = +3 points
  if (entry.preferredDays && entry.preferredDays.length > 0) {
    if (entry.preferredDays.includes(slotDay)) {
      score += 3
    }
  }

  // Date range validation removed - earliestDate/latestDate fields not in WaitlistEntry type
  // TODO: Add date preference fields to WaitlistEntry type if needed

  // Priority high = +3 points
  if (entry.priority === "high") {
    score += 3
  }

  return score
}

/**
 * Suggest candidates for a slot based on matching criteria
 */
export async function suggestCandidates(
  params: SuggestCandidatesParams
): Promise<WaitlistEntry[]> {
  initializeStore()
  const { clinicId, doctorId, appointmentType, startAt, endAt, limit = 5 } = params

  // Filter active entries for this clinic
  let candidates = waitingListStore.filter(
    (entry) => entry.clinicId === clinicId && entry.status === "active"
  )

  // Calculate match scores
  const candidatesWithScores = candidates.map((entry) => {
    const score = calculateMatchScore(entry, {
      doctorId,
      appointmentType,
      startAt,
      endAt,
    })
    return {
      ...entry,
      _matchScore: score,
    }
  })

  // Sort by score descending
  candidatesWithScores.sort((a, b) => (b._matchScore || 0) - (a._matchScore || 0))

  // Return top N candidates
  return candidatesWithScores.slice(0, limit)
}
