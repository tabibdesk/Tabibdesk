/**
 * Attachments API - patient file uploads and scan/lab extraction.
 *
 * Endpoint shapes (implementation can follow later):
 * - POST .../patients/:patientId/attachments  Body: FormData or CreateAttachmentPayload  Response: Attachment
 * - POST .../attachments/:attachmentId/extract-scan  Body: { text: string }  Response: ScanExtraction
 * - POST .../attachments/:attachmentId/extract-lab  (optional)  Response: LabResult[] (creates rows with lab_file_id = attachmentId)
 */

import type { Attachment, AttachmentKind, CreateAttachmentPayload, ExtractScanPayload, ScanExtraction } from "@/types/attachment"

/**
 * Create attachment for a patient (upload file with kind).
 * API: POST .../patients/:patientId/attachments
 * Body should include attachment_kind: "lab" | "scan" | "document" | "ecg".
 */
export async function createAttachment(
  _patientId: string,
  _payload: CreateAttachmentPayload | FormData,
  _kind?: AttachmentKind
): Promise<Attachment> {
  // TODO: Implement when backend is ready
  throw new Error("createAttachment not implemented")
}

/**
 * Extract scan note for an attachment (AI or manual text).
 * API: POST .../attachments/:attachmentId/extract-scan
 * Body: { text: string }
 */
export async function extractScan(
  _attachmentId: string,
  _payload: ExtractScanPayload
): Promise<ScanExtraction> {
  // TODO: Implement when backend is ready
  throw new Error("extractScan not implemented")
}

/**
 * List scan extractions for a patient (e.g. GET .../patients/:patientId/scan-extractions).
 */
export async function listScanExtractionsByPatient(_patientId: string): Promise<ScanExtraction[]> {
  // TODO: Implement when backend is ready
  return []
}
