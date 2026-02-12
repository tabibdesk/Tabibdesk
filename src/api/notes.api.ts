/**
 * Notes API - thin wrapper around notes repository.
 * All data access goes through getNotesRepository() - one place decides mock vs Supabase.
 */

import { getNotesRepository } from "@/lib/api/repository-factory"
import type { VisitNote, CreateNotePayload } from "@/lib/api/interfaces/notes.interface"

export async function create(payload: CreateNotePayload): Promise<VisitNote> {
  const repo = await getNotesRepository()
  return repo.create(payload)
}

export async function update(id: string, note: string): Promise<VisitNote> {
  const repo = await getNotesRepository()
  return repo.update(id, note)
}

export async function remove(id: string): Promise<void> {
  const repo = await getNotesRepository()
  return repo.remove(id)
}

export async function getByPatientId(patientId: string): Promise<VisitNote[]> {
  const repo = await getNotesRepository()
  return repo.getByPatientId(patientId)
}
