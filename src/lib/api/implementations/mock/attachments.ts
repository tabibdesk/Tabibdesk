import type { IAttachmentsRepository, CreateAttachmentPayload } from "../../interfaces/attachments.interface"
import type { Attachment } from "@/types/attachment"

let attachmentsStore: Attachment[] = []

function generateId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockAttachmentsRepository implements IAttachmentsRepository {
  async list(patientId: string): Promise<Attachment[]> {
    return attachmentsStore.filter((a) => a.patient_id === patientId)
  }

  async getById(id: string): Promise<Attachment | null> {
    return attachmentsStore.find((a) => a.id === id) || null
  }

  async create(payload: CreateAttachmentPayload): Promise<Attachment> {
    const now = new Date().toISOString()
    const attachment: Attachment = {
      id: generateId(),
      patient_id: payload.patient_id,
      file_name: payload.file_name,
      file_type: payload.file_type,
      file_size: payload.file_size,
      file_url: payload.file_path,
      uploaded_at: now,
      uploaded_by: payload.uploaded_by,
    }
    attachmentsStore.push(attachment)
    return attachment
  }

  async delete(id: string): Promise<void> {
    attachmentsStore = attachmentsStore.filter((a) => a.id !== id)
  }
}
