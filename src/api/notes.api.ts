/**
 * Visit Notes API - replaceable backend layer
 * Currently uses mock data, but structured for easy backend replacement
 */

import { mockData } from "@/data/mock/mock-data"
import { activate as activatePatient } from "./patients.api"
import { shouldActivatePatientFromNote } from "@/features/patients/patientLifecycle"

// In-memory store for notes (demo mode only)
// Convert mock data format to our API format
let notesStore: VisitNote[] = mockData.doctorNotes.map((note) => ({
  id: note.id,
  patientId: note.patient_id,
  note: note.note,
  createdAt: note.created_at,
}))

export interface VisitNote {
  id: string
  patientId: string
  note: string
  createdAt: string
}

export interface CreateNotePayload {
  patientId: string
  note: string
}

/**
 * Create a visit note
 * Automatically triggers patient activation if note is created
 */
export async function create(payload: CreateNotePayload): Promise<VisitNote> {
  const now = new Date().toISOString()

  const newNote: VisitNote = {
    id: `note-${Date.now()}`,
    patientId: payload.patientId,
    note: payload.note,
    createdAt: now,
  }

  notesStore.push(newNote)

  // Also add to mock data for consistency
  mockData.doctorNotes.push({
    id: newNote.id,
    patient_id: payload.patientId,
    note: payload.note,
    created_at: now,
  })

  // Trigger patient activation if note is valid
  if (shouldActivatePatientFromNote(payload.note)) {
    await activatePatient(payload.patientId, "visit_note")
  }

  return newNote
}

/**
 * Update a visit note
 */
export async function update(id: string, note: string): Promise<VisitNote> {
  const index = notesStore.findIndex((n) => n.id === id)
  if (index === -1) throw new Error("Note not found")

  notesStore[index] = { ...notesStore[index], note }

  // Update mock data
  const mockIndex = mockData.doctorNotes.findIndex((n) => n.id === id)
  if (mockIndex !== -1) {
    mockData.doctorNotes[mockIndex].note = note
  }

  return notesStore[index]
}

/**
 * Delete a visit note
 */
export async function remove(id: string): Promise<void> {
  notesStore = notesStore.filter((n) => n.id !== id)

  // Update mock data
  mockData.doctorNotes = mockData.doctorNotes.filter((n) => n.id !== id)
}

/**
 * Get notes for a patient
 */
export async function getByPatientId(patientId: string): Promise<VisitNote[]> {
  return notesStore.filter((note) => note.patientId === patientId)
}
