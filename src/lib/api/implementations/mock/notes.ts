/**
 * Mock notes repository - in-memory store, no direct mockData mutations.
 */

import { mockData } from "@/data/mock/mock-data"
import { DEMO_CLINIC_ID } from "@/lib/constants"
import type { INotesRepository, VisitNote, CreateNotePayload } from "../../interfaces/notes.interface"
import { shouldActivatePatientFromNote } from "@/features/patients/patientLifecycle"
import { MockPatientsRepository } from "./patients"

let notesStore: VisitNote[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    notesStore = mockData.doctorNotes.map((note) => ({
      id: note.id,
      patient_id: note.patient_id,
      note: note.note,
      created_at: note.created_at,
    }))
    initialized = true
  }
}

function generateId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockNotesRepository implements INotesRepository {
  async create(payload: CreateNotePayload): Promise<VisitNote> {
    initStore()
    const now = new Date().toISOString()

    const newNote: VisitNote = {
      id: generateId(),
      patient_id: payload.patient_id,
      note: payload.note,
      created_at: now,
    }

    notesStore.push(newNote)

    // Trigger patient activation if needed
    if (shouldActivatePatientFromNote(payload.note)) {
      const patientsRepo = new MockPatientsRepository()
      await (patientsRepo as any).activate(payload.patient_id, "visit_note")
    }

    return newNote
  }

  async update(id: string, note: string): Promise<VisitNote> {
    initStore()
    const index = notesStore.findIndex((n) => n.id === id)
    if (index === -1) throw new Error("Note not found")

    notesStore[index] = { ...notesStore[index], note }
    return notesStore[index]
  }

  async remove(id: string): Promise<void> {
    initStore()
    notesStore = notesStore.filter((n) => n.id !== id)
  }

  async getByPatientId(patientId: string): Promise<VisitNote[]> {
    initStore()
    return notesStore.filter((note) => note.patient_id === patientId)
  }
}
