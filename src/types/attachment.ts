/**
 * Attachment and scan extraction types for patient files (lab, scan, document).
 * API: attachment create/update accepts attachment_kind; scan extraction has its own endpoint shape.
 */

export type AttachmentKind = "lab" | "scan" | "document" | "ecg"

export interface Attachment {
  id: string
  patient_id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  uploaded_at: string
  uploaded_by: string
  /** Lab = lab report (AI can extract table); Scan = imaging (AI can extract text note); Document = generic file; ECG = ECG file. */
  attachment_kind?: AttachmentKind
  /** Data URL or URL of thumbnail (e.g. generated on upload for images). */
  thumbnail_url?: string
}

export interface LabResult {
  id: string
  patient_id: string
  test_name: string
  value: string
  unit: string
  normal_range: string
  status: "normal" | "abnormal" | "borderline"
  test_date: string
  pdf_url: string | null
  notes: string | null
  lab_file_id: string | null
}

/**
 * AI-extracted text explanation for a scan/imaging file (e.g. impression, findings).
 * Endpoint shape: POST .../attachments/:id/extract-scan { text? } -> ScanExtraction
 */
export interface ScanExtraction {
  id: string
  attachment_id: string
  patient_id: string
  /** AI-extracted or manually entered note (findings, impression, etc.). */
  text: string
  extracted_at: string
}

/** Create/upload attachment. API: POST .../patients/:patientId/attachments */
export interface CreateAttachmentPayload {
  patient_id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  attachment_kind: AttachmentKind
}

/** Scan extraction request. API: POST .../attachments/:attachmentId/extract-scan */
export interface ExtractScanPayload {
  text: string
}

/** Lab extraction creates LabResult rows with lab_file_id set to attachment id. API: POST .../attachments/:attachmentId/extract-lab (optional; shape TBD). */
