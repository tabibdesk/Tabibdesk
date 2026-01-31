import type { AttachmentKind, ScanExtraction } from "@/types/attachment"

export interface Transcription {
  id: string
  patient_id: string
  audio_url: string | null
  transcription_text: string
  duration_seconds: number
  created_at: string
  status: "processing" | "completed" | "failed"
}

export const mockTranscriptions: Transcription[] = [
  {
    id: "trans-001",
    patient_id: "patient-001",
    audio_url: null,
    transcription_text:
      "Patient presents with complaint of lower back pain for the past 3 days. Pain is localized to the lumbar region, worse with movement and relieved by rest. No radiation to legs. No history of trauma. Patient reports difficulty sleeping due to pain.\n\nOn examination: Tenderness in L4-L5 region, limited range of motion in flexion and extension. No neurological deficits. Straight leg raise test negative bilaterally.\n\nAssessment: Acute mechanical lower back pain, likely muscular strain.\n\nPlan: Prescribed NSAIDs (Ibuprofen 400mg TID for 5 days), muscle relaxant (Cyclobenzaprine 5mg at bedtime), advised rest and avoid heavy lifting. Physical therapy referral for core strengthening exercises. Follow-up in 1 week if symptoms persist.",
    duration_seconds: 125,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
  },
  {
    id: "trans-002",
    patient_id: "patient-001",
    audio_url: null,
    transcription_text:
      "Follow-up visit for lower back pain. Patient reports significant improvement with prescribed treatment. Pain reduced from 8/10 to 3/10. Able to sleep better. Compliance with medications good.\n\nOn examination: Reduced tenderness in lumbar region, improved range of motion. Patient able to perform daily activities with minimal discomfort.\n\nPlan: Continue current medications for 3 more days, then switch to PRN basis. Continue physical therapy exercises. Advised to maintain good posture and avoid prolonged sitting. Return if symptoms worsen.",
    duration_seconds: 87,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
  },
  {
    id: "trans-003",
    patient_id: "patient-002",
    audio_url: null,
    transcription_text:
      "New patient consultation. Chief complaint: Persistent headaches for 2 weeks, occurring 3-4 times per week, usually in the afternoon. Pain described as throbbing, bilateral frontal region, severity 6/10. Associated symptoms include mild nausea, sensitivity to bright lights. No visual disturbances. No fever or neck stiffness.\n\nPast medical history: Hypertension controlled on medication. No known allergies.\n\nAssessment: Tension-type headaches, possibly related to stress and screen time.\n\nPlan: Lifestyle modifications - regular breaks from screen, adequate hydration, stress management techniques. Prescribed Paracetamol 500mg as needed. Advised to keep headache diary. Follow-up in 2 weeks.",
    duration_seconds: 156,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
  },
]

// Attachments
interface Attachment {
  id: string
  patient_id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  uploaded_at: string
  uploaded_by: string
  attachment_kind?: AttachmentKind
}

export const mockAttachments: Attachment[] = [
  {
    id: "attach-001",
    patient_id: "patient-001",
    file_name: "Insurance Card.pdf",
    file_type: "application/pdf",
    file_size: 245760,
    file_url: "/mock/files/samplereport.png",
    uploaded_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Dr. Ahmed Hassan",
    attachment_kind: "document",
  },
  {
    id: "attach-002",
    patient_id: "patient-001",
    file_name: "Medical History.docx",
    file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    file_size: 89600,
    file_url: "/mock/files/samplereport.png",
    uploaded_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Dr. Ahmed Hassan",
    attachment_kind: "document",
  },
  {
    id: "attach-003",
    patient_id: "patient-001",
    file_name: "X-Ray Report.jpg",
    file_type: "image/jpeg",
    file_size: 1536000,
    file_url: "/mock/files/lab.png",
    uploaded_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Dr. Ahmed Hassan",
    attachment_kind: "lab",
  },
  {
    id: "attach-004",
    patient_id: "patient-001",
    file_name: "Blood Test Results.xlsx",
    file_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    file_size: 45120,
    file_url: "/mock/files/lab.png",
    uploaded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Dr. Ahmed Hassan",
    attachment_kind: "lab",
  },
  {
    id: "attach-005",
    patient_id: "patient-002",
    file_name: "Prescription History.pdf",
    file_type: "application/pdf",
    file_size: 178240,
    file_url: "/mock/files/samplereport.png",
    uploaded_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Dr. Ahmed Hassan",
    attachment_kind: "document",
  },
  {
    id: "attach-006",
    patient_id: "patient-002",
    file_name: "CT Scan.png",
    file_type: "image/png",
    file_size: 2048000,
    file_url: "/mock/files/ct.png",
    uploaded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Dr. Ahmed Hassan",
    attachment_kind: "scan",
  },
  {
    id: "attach-007",
    patient_id: "patient-001",
    file_name: "Chest X-Ray.pdf",
    file_type: "application/pdf",
    file_size: 512000,
    file_url: "/mock/files/ct.png",
    uploaded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Dr. Ahmed Hassan",
    attachment_kind: "scan",
  },
  // ECG file for each patient (public/mock/files/ecg.jpeg)
  {
    id: "attach-008",
    patient_id: "patient-001",
    file_name: "ECG.jpeg",
    file_type: "image/jpeg",
    file_size: 256000,
    file_url: "/mock/files/ecg.jpeg",
    uploaded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Dr. Ahmed Hassan",
    attachment_kind: "ecg",
  },
  {
    id: "attach-009",
    patient_id: "patient-002",
    file_name: "ECG.jpeg",
    file_type: "image/jpeg",
    file_size: 256000,
    file_url: "/mock/files/ecg.jpeg",
    uploaded_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Dr. Ahmed Hassan",
    attachment_kind: "ecg",
  },
  {
    id: "attach-010",
    patient_id: "patient-003",
    file_name: "ECG.jpeg",
    file_type: "image/jpeg",
    file_size: 256000,
    file_url: "/mock/files/ecg.jpeg",
    uploaded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Dr. Ahmed Hassan",
    attachment_kind: "ecg",
  },
  {
    id: "attach-011",
    patient_id: "patient-004",
    file_name: "ECG.jpeg",
    file_type: "image/jpeg",
    file_size: 256000,
    file_url: "/mock/files/ecg.jpeg",
    uploaded_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Dr. Ahmed Hassan",
    attachment_kind: "ecg",
  },
  {
    id: "attach-012",
    patient_id: "patient-005",
    file_name: "ECG.jpeg",
    file_type: "image/jpeg",
    file_size: 256000,
    file_url: "/mock/files/ecg.jpeg",
    uploaded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    uploaded_by: "Dr. Ahmed Hassan",
    attachment_kind: "ecg",
  },
]

// Scan extractions (AI-extracted text note per scan attachment)
export const mockScanExtractions: ScanExtraction[] = [
  {
    id: "scan-ext-001",
    attachment_id: "attach-006",
    patient_id: "patient-002",
    text: "CT abdomen/pelvis: No acute findings. Liver, spleen, kidneys, and pancreas are unremarkable. No lymphadenopathy. No free fluid. Impression: Normal study.",
    extracted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "scan-ext-002",
    attachment_id: "attach-007",
    patient_id: "patient-001",
    text: "Chest X-Ray PA and lateral: Lungs are clear with no focal consolidation, mass, or pleural effusion. Cardiac silhouette is normal in size. Mediastinal contours are unremarkable. No pneumothorax. Bony structures show mild degenerative changes. Impression: Normal chest radiograph.",
    extracted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
