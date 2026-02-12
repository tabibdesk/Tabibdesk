import { createClient } from "@supabase/supabase-js"
import { Database } from "@/lib/supabase/types"
import type { IAttachmentsRepository, CreateAttachmentPayload } from "../../interfaces/attachments.interface"
import type { Attachment } from "@/types/attachment"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

function mapRowToAttachment(row: any): Attachment {
  return {
    id: row.id,
    patient_id: row.patient_id,
    file_name: row.file_name,
    file_type: row.file_type,
    file_size: row.file_size,
    file_path: row.file_path,
    uploaded_by: row.uploaded_by,
    created_at: row.created_at,
  }
}

export class SupabaseAttachmentsRepository implements IAttachmentsRepository {
  async list(patientId: string): Promise<Attachment[]> {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Failed to list attachments: ${error.message}`)
    return (data || []).map(mapRowToAttachment)
  }

  async getById(id: string): Promise<Attachment | null> {
    const { data, error } = await supabase.from("attachments").select("*").eq("id", id).single()

    if (error && error.code !== "PGRST116") throw error
    return data ? mapRowToAttachment(data) : null
  }

  async create(payload: CreateAttachmentPayload): Promise<Attachment> {
    const { data, error } = await supabase
      .from("attachments")
      .insert({
        patient_id: payload.patient_id,
        file_name: payload.file_name,
        file_type: payload.file_type,
        file_size: payload.file_size,
        file_path: payload.file_path,
        uploaded_by: payload.uploaded_by,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create attachment: ${error.message}`)
    return mapRowToAttachment(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("attachments").delete().eq("id", id)
    if (error) throw new Error(`Failed to delete attachment: ${error.message}`)
  }
}
