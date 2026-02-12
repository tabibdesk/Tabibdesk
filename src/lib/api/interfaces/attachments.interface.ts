import type { Attachment } from "@/types/attachment"

export interface CreateAttachmentPayload {
  patient_id: string
  file_name: string
  file_type: string
  file_size: number
  file_path: string
  uploaded_by: string
}

export interface IAttachmentsRepository {
  list(patientId: string): Promise<Attachment[]>
  getById(id: string): Promise<Attachment | null>
  create(payload: CreateAttachmentPayload): Promise<Attachment>
  delete(id: string): Promise<void>
}
