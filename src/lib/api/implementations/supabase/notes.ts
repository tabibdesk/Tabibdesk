/**
 * Supabase notes repository - queries real database.
 */

import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { INotesRepository, VisitNote, CreateNotePayload } from "../../interfaces/notes.interface"
import { shouldActivatePatientFromNote } from "@/features/patients/patientLifecycle"
import { SupabasePatientsRepository } from "./patients"
import { NotFoundError } from "../../errors"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToVisitNote(row: any): VisitNote {
  return {
    id: row.id,
    patient_id: row.patient_id,
    note: row.note,
    created_at: row.created_at,
  }
}

export class SupabaseNotesRepository implements INotesRepository {
  async create(payload: CreateNotePayload): Promise<VisitNote> {
    const { data, error } = await supabase
      .from("notes")
      .insert({
        patient_id: payload.patient_id,
        note: payload.note,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create note: ${error.message}`)

    // Trigger patient activation if needed
    if (shouldActivatePatientFromNote(payload.note)) {
      const patientsRepo = new SupabasePatientsRepository()
      await (patientsRepo as any).activate(payload.patient_id, "visit_note")
    }

    return mapRowToVisitNote(data)
  }

  async update(id: string, note: string): Promise<VisitNote> {
    const { data, error } = await supabase
      .from("notes")
      .update({ note })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update note: ${error.message}`)
    return mapRowToVisitNote(data)
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("notes").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete note: ${error.message}`)
  }

  async getByPatientId(patientId: string): Promise<VisitNote[]> {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch notes: ${error.message}`)
    return data.map(mapRowToVisitNote)
  }
}
