import type { Prescription, PastMedication } from "@/features/prescriptions/prescriptions.types"

export const mockPrescriptions: Prescription[] = [
  {
    id: "prescription-001",
    clinicId: "clinic-001",
    patientId: "patient-001",
    doctorId: "doctor-001",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    visitType: "in_clinic",
    diagnosisText: "Upper respiratory tract infection",
    notesToPatient: "Take medications as prescribed. Rest and drink plenty of fluids.",
    items: [
      {
        id: "item-001",
        name: "Amoxicillin 500mg",
        strength: "500mg",
        form: "Tablets",
        sig: "Take 1 tablet three times daily after meals",
        duration: "7 days",
      },
      {
        id: "item-002",
        name: "Paracetamol 500mg",
        strength: "500mg",
        form: "Tablets",
        sig: "Take 1-2 tablets every 6 hours as needed for fever or pain",
        duration: "5 days",
      },
      {
        id: "item-003",
        name: "Cough Syrup",
        form: "Syrup",
        sig: "Take 10ml three times daily",
        duration: "7 days",
      },
    ],
  },
  {
    id: "prescription-002",
    clinicId: "clinic-001",
    patientId: "patient-001",
    doctorId: "doctor-001",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    visitType: "in_clinic",
    diagnosisText: "Hypertension follow-up",
    notesToPatient: "Continue monitoring blood pressure. Follow up in 2 weeks.",
    items: [
      {
        id: "item-004",
        name: "Amlodipine 5mg",
        strength: "5mg",
        form: "Tablets",
        sig: "Take 1 tablet once daily in the morning",
        duration: "30 days",
      },
      {
        id: "item-005",
        name: "Lisinopril 10mg",
        strength: "10mg",
        form: "Tablets",
        sig: "Take 1 tablet once daily",
        duration: "30 days",
      },
    ],
  },
  {
    id: "prescription-003",
    clinicId: "clinic-001",
    patientId: "patient-002",
    doctorId: "doctor-001",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    visitType: "in_clinic",
    diagnosisText: "Diabetes management",
    notesToPatient: "Monitor blood sugar levels regularly. Maintain healthy diet.",
    items: [
      {
        id: "item-006",
        name: "Metformin 500mg",
        strength: "500mg",
        form: "Tablets",
        sig: "Take 1 tablet twice daily with meals",
        duration: "30 days",
        notes: "Start with lower dose",
      },
    ],
  },
  {
    id: "prescription-004",
    clinicId: "clinic-001",
    patientId: "patient-002",
    doctorId: "doctor-001",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    visitType: "online",
    diagnosisText: "Acute gastritis",
    notesToPatient: "Avoid spicy foods and take medications with food.",
    items: [
      {
        id: "item-007",
        name: "Omeprazole 20mg",
        strength: "20mg",
        form: "Capsules",
        sig: "Take 1 capsule once daily before breakfast",
        duration: "14 days",
      },
      {
        id: "item-008",
        name: "Antacid",
        form: "Tablets",
        sig: "Take 1-2 tablets after meals as needed",
        duration: "7 days",
      },
    ],
  },
]

export const mockPastMedications: PastMedication[] = [
  {
    id: "past-med-001",
    patientId: "patient-001",
    name: "Metformin 500mg",
    duration: "6 months",
    takenFrom: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    takenTo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Discontinued due to improved glucose control",
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "past-med-002",
    patientId: "patient-001",
    name: "Amlodipine 5mg",
    duration: "3 months",
    takenFrom: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    takenTo: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Switched to different medication",
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "past-med-003",
    patientId: "patient-002",
    name: "Levothyroxine 50mcg",
    duration: "1 year",
    takenFrom: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    takenTo: null,
    notes: "Ongoing medication",
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
