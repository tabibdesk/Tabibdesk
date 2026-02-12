export interface VisitNote {
  id: string
  patient_id: string
  note: string
  created_at: string
}

export interface CreateNotePayload {
  patient_id: string
  note: string
}

export interface INotesRepository {
  create(payload: CreateNotePayload): Promise<VisitNote>
  update(id: string, note: string): Promise<VisitNote>
  remove(id: string): Promise<void>
  getByPatientId(patientId: string): Promise<VisitNote[]>
}
