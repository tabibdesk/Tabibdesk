import type { Prescription } from "@/features/prescriptions/prescriptions.types"

export interface CreatePrescriptionPayload {
  patient_id: string
  doctor_id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  notes?: string
}

export interface IPrescriptionsRepository {
  list(patientId: string): Promise<Prescription[]>
  getById(id: string): Promise<Prescription | null>
  create(payload: CreatePrescriptionPayload): Promise<Prescription>
  update(id: string, updates: Partial<Prescription>): Promise<Prescription>
  delete(id: string): Promise<void>
}
