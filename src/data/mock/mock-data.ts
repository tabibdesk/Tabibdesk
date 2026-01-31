// Clean separation of mock data from app logic
// This file contains all mock data for demo mode

import type { DoctorAvailability } from "@/features/appointments/types"
import type { Prescription, PastMedication } from "@/features/prescriptions/prescriptions.types"
import type { AttachmentKind, ScanExtraction } from "@/types/attachment"

export const DEMO_DOCTOR_ID = "demo-doctor-001"
export const DEMO_CLINIC_ID = "demo-clinic-001"

export const mockDoctor = {
  id: DEMO_DOCTOR_ID,
  email: "demo@tabibdesk.com",
  full_name: "Dr. Ahmed Hassan",
  specialization: "Physical Therapy & Nutrition",
  biography: "Expert in therapeutic exercise and nutritional counseling",
  image_url: "/images/tabibdesk-logo.png",
  role: "doctor",
  doctor_id: DEMO_DOCTOR_ID,
  created_at: new Date().toISOString(),
}

export const mockClinic = {
  id: DEMO_CLINIC_ID,
  name: "TabibDesk Wellness Center",
  address: "123 Medical Street, Cairo, Egypt",
  location: "Downtown Cairo",
  phone: "+20 123 456 7890",
  created_at: new Date().toISOString(),
  tidycal_booking_type_id: "demo-booking-type",
}

export const mockDoctors = [mockDoctor]

// Extended Patient interface with all medical fields
interface Patient {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  age: number | null
  gender: string
  phone: string
  email: string | null
  address: string | null
  height: number | null
  complaint: string | null
  job: string | null
  social_status: string | null
  ai_diagnosis: string | null
  ai_diagnosis_updated_at: string | null
  // Medical conditions
  is_diabetic: boolean | null
  is_hypertensive: boolean | null
  has_pancreatitis: boolean | null
  is_pregnant: boolean | null
  is_breastfeeding: boolean | null
  glp1a_previous_exposure: boolean | null
  has_rheumatoid: boolean | null
  has_ihd: boolean | null
  has_heart_failure: boolean | null
  has_gerd: boolean | null
  has_gastritis: boolean | null
  has_hepatic: boolean | null
  has_anaemia: boolean | null
  has_bronchial_asthma: boolean | null
  thyroid_status: string | null
  history_of_operation: any | null
  doctor_id: string | null
  profile_id: string | null
  status: "inactive" | "active" | "lost"
  first_visit_at: string | null
  last_visit_at: string | null
  created_at: string
  updated_at: string
}

export const mockPatients: Patient[] = [
  {
    id: "patient-001",
    first_name: "Fatima",
    last_name: "Mohamed",
    date_of_birth: "1985-03-15",
    age: 39,
    gender: "Female",
    phone: "+20 100 1234567",
    email: "fatima.mohamed@example.com",
    address: "15 Tahrir Square, Cairo, Egypt",
    height: 165,
    complaint: "High blood pressure and occasional headaches",
    job: "Teacher",
    social_status: "Married",
    ai_diagnosis: "Hypertension Stage 1 - well controlled with medication. Patient shows good adherence to treatment plan.",
    ai_diagnosis_updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_diabetic: false,
    is_hypertensive: true,
    has_pancreatitis: false,
    is_pregnant: false,
    is_breastfeeding: false,
    glp1a_previous_exposure: false,
    has_rheumatoid: false,
    has_ihd: false,
    has_heart_failure: false,
    has_gerd: false,
    has_gastritis: false,
    has_hepatic: false,
    has_anaemia: false,
    has_bronchial_asthma: false,
    thyroid_status: "Normal",
    history_of_operation: null,
    doctor_id: DEMO_DOCTOR_ID,
    profile_id: null,
    status: "active",
    first_visit_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    last_visit_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "patient-002",
    first_name: "Ahmed",
    last_name: "Abdullah",
    date_of_birth: "1975-07-22",
    age: 49,
    gender: "Male",
    phone: "+20 100 2345678",
    email: "ahmed.abdullah@example.com",
    address: "42 Pyramid Road, Giza, Egypt",
    height: 178,
    complaint: "Type 2 Diabetes, joint pain",
    job: "Engineer",
    social_status: "Married",
    ai_diagnosis: "Type 2 Diabetes Mellitus with good glycemic control (HbA1c: 6.8%). Mild osteoarthritis in knees.",
    ai_diagnosis_updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_diabetic: true,
    is_hypertensive: false,
    has_pancreatitis: false,
    is_pregnant: false,
    is_breastfeeding: false,
    glp1a_previous_exposure: true,
    has_rheumatoid: false,
    has_ihd: false,
    has_heart_failure: false,
    has_gerd: true,
    has_gastritis: false,
    has_hepatic: false,
    has_anaemia: false,
    has_bronchial_asthma: false,
    thyroid_status: "Normal",
    history_of_operation: ["Appendectomy (2005)"],
    doctor_id: DEMO_DOCTOR_ID,
    profile_id: null,
    status: "active",
    first_visit_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    last_visit_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "patient-003",
    first_name: "Layla",
    last_name: "Ibrahim",
    date_of_birth: "1992-11-08",
    age: 32,
    gender: "Female",
    phone: "+20 100 3456789",
    email: "layla.ibrahim@example.com",
    address: "28 Nile Corniche, Alexandria, Egypt",
    height: 162,
    complaint: "Weight management and fatigue",
    job: "Pharmacist",
    social_status: "Single",
    ai_diagnosis: "Hypothyroidism with anemia. Patient requires iron supplementation and thyroid hormone optimization.",
    ai_diagnosis_updated_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    is_diabetic: false,
    is_hypertensive: false,
    has_pancreatitis: false,
    is_pregnant: false,
    is_breastfeeding: false,
    glp1a_previous_exposure: false,
    has_rheumatoid: false,
    has_ihd: false,
    has_heart_failure: false,
    has_gerd: false,
    has_gastritis: false,
    has_hepatic: false,
    has_anaemia: true,
    has_bronchial_asthma: false,
    thyroid_status: "Hypothyroid",
    history_of_operation: null,
    doctor_id: DEMO_DOCTOR_ID,
    profile_id: null,
    status: "active",
    first_visit_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    last_visit_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "patient-004",
    first_name: "Omar",
    last_name: "Khalil",
    date_of_birth: "1988-05-30",
    age: 36,
    gender: "Male",
    phone: "+20 100 4567890",
    email: "omar.khalil@example.com",
    address: "67 University Street, Cairo, Egypt",
    height: 180,
    complaint: "Asthma and seasonal allergies",
    job: "Accountant",
    social_status: "Married",
    ai_diagnosis: "Bronchial Asthma - moderate persistent. Well controlled with current inhaler regimen.",
    ai_diagnosis_updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_diabetic: false,
    is_hypertensive: false,
    has_pancreatitis: false,
    is_pregnant: false,
    is_breastfeeding: false,
    glp1a_previous_exposure: false,
    has_rheumatoid: false,
    has_ihd: false,
    has_heart_failure: false,
    has_gerd: false,
    has_gastritis: false,
    has_hepatic: false,
    has_anaemia: false,
    has_bronchial_asthma: true,
    thyroid_status: "Normal",
    history_of_operation: null,
    doctor_id: DEMO_DOCTOR_ID,
    profile_id: null,
    status: "active",
    first_visit_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    last_visit_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "patient-005",
    first_name: "Nour",
    last_name: "Amin",
    date_of_birth: "1998-09-14",
    age: 26,
    gender: "Female",
    phone: "+20 100 5678901",
    email: "nour.amin@example.com",
    address: "89 Heliopolis, Cairo, Egypt",
    height: 168,
    complaint: "GERD symptoms and weight management",
    job: "Marketing Specialist",
    social_status: "Single",
    ai_diagnosis: "Gastroesophageal Reflux Disease (GERD). Recommend dietary modifications and PPI therapy.",
    ai_diagnosis_updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    is_diabetic: false,
    is_hypertensive: false,
    has_pancreatitis: false,
    is_pregnant: false,
    is_breastfeeding: false,
    glp1a_previous_exposure: false,
    has_rheumatoid: false,
    has_ihd: false,
    has_heart_failure: false,
    has_gerd: true,
    has_gastritis: true,
    has_hepatic: false,
    has_anaemia: false,
    has_bronchial_asthma: false,
    thyroid_status: "Normal",
    history_of_operation: null,
    doctor_id: DEMO_DOCTOR_ID,
    profile_id: null,
    status: "inactive",
    first_visit_at: null,
    last_visit_at: null,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Weight Logs
interface WeightLog {
  id: string
  patient_id: string
  weight: number
  recorded_date: string
  notes: string | null
}

export const mockWeightLogs: WeightLog[] = [
  // Fatima Mohamed (patient-001)
  {
    id: "weight-001",
    patient_id: "patient-001",
    weight: 72,
    recorded_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Initial weight",
  },
  {
    id: "weight-002",
    patient_id: "patient-001",
    weight: 70,
    recorded_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Good progress",
  },
  {
    id: "weight-003",
    patient_id: "patient-001",
    weight: 69,
    recorded_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Steady decrease",
  },
  {
    id: "weight-004",
    patient_id: "patient-001",
    weight: 68.5,
    recorded_date: new Date().toISOString().split("T")[0],
    notes: "Target almost reached",
  },
  // Ahmed Abdullah (patient-002)
  {
    id: "weight-005",
    patient_id: "patient-002",
    weight: 95,
    recorded_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Starting weight",
  },
  {
    id: "weight-006",
    patient_id: "patient-002",
    weight: 92,
    recorded_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Diet and exercise showing results",
  },
  {
    id: "weight-007",
    patient_id: "patient-002",
    weight: 90,
    recorded_date: new Date().toISOString().split("T")[0],
    notes: "Excellent progress",
  },
]

// Injections
interface Injection {
  id: string
  patient_id: string
  medication_name: string
  dose: string
  injection_date: string
  next_suggested_date: string | null
  next_suggested_dose: string | null
  notes: string | null
  appointment_id: string | null
}

export const mockInjections: Injection[] = [
  {
    id: "inj-001",
    patient_id: "patient-002",
    medication_name: "Ozempic (Semaglutide)",
    dose: "0.5mg",
    injection_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    next_suggested_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    next_suggested_dose: "0.5mg",
    notes: "Patient tolerated well, no side effects",
    appointment_id: "apt-002",
  },
  {
    id: "inj-002",
    patient_id: "patient-002",
    medication_name: "Ozempic (Semaglutide)",
    dose: "0.25mg",
    injection_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    next_suggested_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    next_suggested_dose: "0.5mg",
    notes: "Initial dose, monitor for side effects",
    appointment_id: null,
  },
]

// Medications
interface Medication {
  id: string
  patient_id: string
  name: string
  status: string
  notes: string | null
  created_at: string
}

export const mockMedications: Medication[] = [
  {
    id: "med-001",
    patient_id: "patient-001",
    name: "Amlodipine 5mg",
    status: "active",
    notes: "Take once daily in the morning",
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "med-002",
    patient_id: "patient-001",
    name: "Aspirin 81mg",
    status: "active",
    notes: "Take once daily with food",
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "med-003",
    patient_id: "patient-002",
    name: "Metformin 1000mg",
    status: "active",
    notes: "Take twice daily with meals",
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "med-004",
    patient_id: "patient-002",
    name: "Ozempic 0.5mg",
    status: "active",
    notes: "Weekly injection",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "med-005",
    patient_id: "patient-003",
    name: "Levothyroxine 75mcg",
    status: "active",
    notes: "Take on empty stomach in the morning",
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "med-006",
    patient_id: "patient-003",
    name: "Ferrous Sulfate 325mg",
    status: "active",
    notes: "Take with vitamin C for better absorption",
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "med-007",
    patient_id: "patient-004",
    name: "Albuterol Inhaler",
    status: "active",
    notes: "Use as needed for shortness of breath",
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "med-008",
    patient_id: "patient-005",
    name: "Omeprazole 20mg",
    status: "active",
    notes: "Take 30 minutes before breakfast",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Doctor Notes
interface DoctorNote {
  id: string
  patient_id: string
  note: string
  created_at: string
}

export const mockDoctorNotes: DoctorNote[] = [
  {
    id: "note-001",
    patient_id: "patient-001",
    note: "Patient reports feeling better. Blood pressure under control. Continue current medication.",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-002",
    patient_id: "patient-001",
    note: "Started on Amlodipine 5mg. Discussed lifestyle modifications including reduced sodium intake.",
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-003",
    patient_id: "patient-002",
    note: "HbA1c improved from 7.8% to 6.8%. Patient shows excellent adherence. Started Ozempic.",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-004",
    patient_id: "patient-003",
    note: "Thyroid levels improving. Continue levothyroxine. Iron supplementation showing results.",
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-005",
    patient_id: "patient-001",
    note: "Follow-up visit. Blood pressure readings stable at 130/85. Patient reports no side effects from medication. Advised to continue current regimen and return in 3 months.",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-006",
    patient_id: "patient-002",
    note: "Routine diabetes checkup. Fasting glucose levels within target range. Patient maintaining good diet and exercise routine. No adjustments needed to medication.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-007",
    patient_id: "patient-003",
    note: "Thyroid function test results reviewed. TSH levels normalized. Patient feeling more energetic. Continue current levothyroxine dosage.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-008",
    patient_id: "patient-004",
    note: "Asthma management review. Patient reports improved breathing with current inhaler regimen. Peak flow measurements improved. Continue preventive medication.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-009",
    patient_id: "patient-005",
    note: "GERD follow-up. Patient reports significant improvement in symptoms with omeprazole. Dietary modifications discussed. Continue medication for another month.",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-010",
    patient_id: "patient-001",
    note: "Initial consultation for hypertension. Comprehensive history taken. Ordered baseline labs including lipid panel and kidney function tests. Started on lifestyle modifications.",
    created_at: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-011",
    patient_id: "patient-002",
    note: "Diabetes management plan established. Patient educated on glucose monitoring, diet, and exercise. Started on metformin 500mg twice daily. Follow-up scheduled in 2 weeks.",
    created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-012",
    patient_id: "patient-003",
    note: "Hypothyroidism diagnosis confirmed. Started on levothyroxine 50mcg daily. Patient counseled on importance of medication adherence. Recheck TSH in 6 weeks.",
    created_at: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-013",
    patient_id: "patient-004",
    note: "Asthma assessment completed. Spirometry shows mild obstruction. Prescribed albuterol rescue inhaler and started on maintenance therapy. Peak flow meter provided.",
    created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-014",
    patient_id: "patient-005",
    note: "GERD evaluation. Patient reports frequent heartburn and acid reflux. Started on omeprazole 20mg daily. Advised to avoid trigger foods and elevate head of bed.",
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-015",
    patient_id: "patient-001",
    note: "Medication review. Patient tolerating amlodipine well. Blood pressure consistently below 140/90. Discussed importance of regular monitoring and lifestyle factors.",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-016",
    patient_id: "patient-002",
    note: "Weight management discussion. Patient has lost 3kg since last visit. Encouraged continued progress. Reviewed meal planning strategies and exercise routine.",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-017",
    patient_id: "patient-003",
    note: "Iron deficiency anemia follow-up. Hemoglobin levels improved from 9.5 to 11.2. Continue iron supplementation. Advised to take with vitamin C for better absorption.",
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-018",
    patient_id: "patient-004",
    note: "Asthma control assessment. Patient reports using rescue inhaler less frequently. Peak flow values stable. Continue current treatment plan. Review in 3 months.",
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-019",
    patient_id: "patient-005",
    note: "GERD symptoms improved significantly. Patient reports only occasional mild symptoms. Continue omeprazole. Discussed long-term management and potential for dose reduction.",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "note-020",
    patient_id: "patient-001",
    note: "Annual physical examination. Overall health status good. Blood pressure well controlled. Lipid panel within normal limits. Patient encouraged to maintain healthy lifestyle.",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Tasks
interface Task {
  id: string
  patient_id: string
  title: string
  description: string | null
  type: string
  status: string
  due_date: string
  completed_at: string | null
  ignored_at: string | null
  created_at: string
  updated_at: string | null
}

export const mockTasks: Task[] = [
  {
    id: "task-001",
    patient_id: "patient-001",
    title: "Follow-up Blood Pressure Check",
    description: "Schedule appointment to monitor blood pressure after medication adjustment",
    type: "follow_up",
    status: "pending",
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    completed_at: null,
    ignored_at: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
  },
  {
    id: "task-002",
    patient_id: "patient-002",
    title: "HbA1c Test",
    description: "Order HbA1c test to monitor diabetes control",
    type: "lab_test",
    status: "pending",
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    completed_at: null,
    ignored_at: null,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
  },
  {
    id: "task-003",
    patient_id: "patient-002",
    title: "Diet Plan Review",
    description: "Review and update meal plan based on recent weight loss progress",
    type: "diet_review",
    status: "completed",
    due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ignored_at: null,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-004",
    patient_id: "patient-003",
    title: "Thyroid Function Test",
    description: "Check TSH, T3, T4 levels",
    type: "lab_test",
    status: "pending",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    completed_at: null,
    ignored_at: null,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
  },
]

// Diet Plans
interface PatientDiet {
  id: string
  patient_id: string
  diet_plan: string
  created_at: string
  updated_at: string
  version: number
  is_active: boolean
}

export const mockPatientDiets: PatientDiet[] = [
  {
    id: "diet-001",
    patient_id: "patient-002",
    diet_plan: `# Diabetes Management Diet Plan

## Daily Targets
- Calories: 1800-2000 kcal
- Carbohydrates: 180-200g (distributed throughout the day)
- Protein: 80-100g
- Fats: 50-60g (focus on healthy fats)

## Meal Structure

### Breakfast (7:00 AM)
- 2 boiled eggs
- 2 slices whole grain toast
- 1 cup green tea
- Small apple

### Mid-Morning Snack (10:00 AM)
- Handful of almonds (10-12 pieces)
- Small orange

### Lunch (1:00 PM)
- Grilled chicken breast (150g)
- Large mixed salad with olive oil dressing
- 1/2 cup brown rice
- Steamed vegetables

### Afternoon Snack (4:00 PM)
- Greek yogurt (low-fat)
- 1 tablespoon chia seeds

### Dinner (7:00 PM)
- Grilled fish (150g)
- Roasted vegetables
- Small portion quinoa
- Green salad

## Guidelines
- Drink 8-10 glasses of water daily
- Avoid sugary drinks and processed foods
- Monitor blood glucose before and after meals
- Exercise 30 minutes daily after meals`,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    version: 2,
    is_active: true,
  },
  {
    id: "diet-002",
    patient_id: "patient-005",
    diet_plan: `# GERD Management Diet Plan

## Foods to Avoid
- Spicy foods
- Citrus fruits
- Tomato-based products
- Chocolate
- Caffeine
- Carbonated drinks
- Fried and fatty foods

## Recommended Foods

### Breakfast
- Oatmeal with banana
- Whole grain toast
- Herbal tea

### Lunch
- Baked chicken or turkey
- Steamed vegetables
- Brown rice or quinoa
- Green salad (no vinegar dressing)

### Dinner (Early - by 6:00 PM)
- Lean protein (fish/chicken)
- Steamed vegetables
- Small portion of pasta or rice

## Eating Guidelines
- Eat smaller, frequent meals
- Avoid eating 2-3 hours before bedtime
- Chew food thoroughly
- Stay upright after meals
- Keep a food diary to identify triggers`,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    version: 1,
    is_active: true,
  },
]

// Lab Files
interface LabFile {
  id: string
  filename: string
  original_filename: string
  file_size: number
  mime_type: string
  blob_url: string | null
  uploaded_at: string
  patient_id: string
}

export const mockLabFiles: LabFile[] = [
  {
    id: "labfile-001",
    filename: "lab-report-001.pdf",
    original_filename: "Blood_Test_Results_Jan2025.pdf",
    file_size: 245678,
    mime_type: "application/pdf",
    blob_url: null,
    uploaded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    patient_id: "patient-001",
  },
  {
    id: "labfile-002",
    filename: "lab-report-002.pdf",
    original_filename: "HbA1c_Test_Dec2024.pdf",
    file_size: 198765,
    mime_type: "application/pdf",
    blob_url: null,
    uploaded_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    patient_id: "patient-002",
  },
]

// Lab Results
interface LabResult {
  id: string
  patient_id: string
  test_name: string
  value: string
  unit: string
  normal_range: string
  status: string
  test_date: string
  pdf_url: string | null
  notes: string | null
  lab_file_id: string | null
}

export const mockLabResults: LabResult[] = [
  // Fatima Mohamed (patient-001) - Hypertension monitoring
  {
    id: "lab-001",
    patient_id: "patient-001",
    test_name: "Blood Pressure",
    value: "128/82",
    unit: "mmHg",
    normal_range: "<120/80",
    status: "borderline",
    test_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Improved from last visit",
    lab_file_id: "labfile-001",
  },
  {
    id: "lab-002",
    patient_id: "patient-001",
    test_name: "Cholesterol (Total)",
    value: "195",
    unit: "mg/dL",
    normal_range: "<200",
    status: "normal",
    test_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: null,
    lab_file_id: "labfile-001",
  },
  {
    id: "lab-003",
    patient_id: "patient-001",
    test_name: "LDL",
    value: "115",
    unit: "mg/dL",
    normal_range: "<100",
    status: "borderline",
    test_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Continue dietary modifications",
    lab_file_id: "labfile-001",
  },
  // Lab results linked to X-Ray (attach-003) - AI-extracted from image
  {
    id: "lab-attach-003-a",
    patient_id: "patient-001",
    test_name: "Chest X-Ray - Lung fields",
    value: "Clear",
    unit: "",
    normal_range: "Clear",
    status: "normal",
    test_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "No consolidation or pleural effusion",
    lab_file_id: "attach-003",
  },
  {
    id: "lab-attach-003-b",
    patient_id: "patient-001",
    test_name: "Cardiac silhouette",
    value: "Normal",
    unit: "",
    normal_range: "Normal",
    status: "normal",
    test_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: null,
    lab_file_id: "attach-003",
  },
  {
    id: "lab-attach-003-c",
    patient_id: "patient-001",
    test_name: "Bone structures",
    value: "No acute fracture",
    unit: "",
    normal_range: "Intact",
    status: "normal",
    test_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Degenerative changes noted",
    lab_file_id: "attach-003",
  },
  // Lab results linked to attachment (Blood Test Results.xlsx - attach-004)
  {
    id: "lab-attach-001",
    patient_id: "patient-001",
    test_name: "Glucose",
    value: "95",
    unit: "mg/dL",
    normal_range: "70-100",
    status: "normal",
    test_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: null,
    lab_file_id: "attach-004",
  },
  {
    id: "lab-attach-002",
    patient_id: "patient-001",
    test_name: "HbA1c",
    value: "5.6",
    unit: "%",
    normal_range: "<5.7",
    status: "normal",
    test_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: null,
    lab_file_id: "attach-004",
  },
  // Ahmed Abdullah (patient-002) - Diabetes monitoring
  {
    id: "lab-004",
    patient_id: "patient-002",
    test_name: "HbA1c",
    value: "6.8",
    unit: "%",
    normal_range: "<5.7",
    status: "abnormal",
    test_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Good control, improved from 7.8%",
    lab_file_id: "labfile-002",
  },
  {
    id: "lab-005",
    patient_id: "patient-002",
    test_name: "Fasting Glucose",
    value: "118",
    unit: "mg/dL",
    normal_range: "70-100",
    status: "borderline",
    test_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: null,
    lab_file_id: "labfile-002",
  },
  {
    id: "lab-006",
    patient_id: "patient-002",
    test_name: "Creatinine",
    value: "0.9",
    unit: "mg/dL",
    normal_range: "0.7-1.3",
    status: "normal",
    test_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Kidney function normal",
    lab_file_id: "labfile-002",
  },
  // Layla Ibrahim (patient-003) - Thyroid and anemia
  {
    id: "lab-007",
    patient_id: "patient-003",
    test_name: "TSH",
    value: "8.2",
    unit: "mIU/L",
    normal_range: "0.4-4.0",
    status: "abnormal",
    test_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Hypothyroidism confirmed, adjust medication",
    lab_file_id: null,
  },
  {
    id: "lab-008",
    patient_id: "patient-003",
    test_name: "Hemoglobin",
    value: "10.5",
    unit: "g/dL",
    normal_range: "12-16 (F)",
    status: "abnormal",
    test_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Anemia present, continue iron supplementation",
    lab_file_id: null,
  },
  {
    id: "lab-009",
    patient_id: "patient-003",
    test_name: "Ferritin",
    value: "15",
    unit: "ng/mL",
    normal_range: "20-200",
    status: "abnormal",
    test_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Low iron stores",
    lab_file_id: null,
  },
  // Additional labs for patient-001 (30 days ago)
  {
    id: "lab-010",
    patient_id: "patient-001",
    test_name: "Blood Pressure",
    value: "135/88",
    unit: "mmHg",
    normal_range: "<120/80",
    status: "abnormal",
    test_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Medication adjustment needed",
    lab_file_id: null,
  },
  {
    id: "lab-011",
    patient_id: "patient-001",
    test_name: "Cholesterol (Total)",
    value: "215",
    unit: "mg/dL",
    normal_range: "<200",
    status: "borderline",
    test_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: null,
    lab_file_id: null,
  },
  {
    id: "lab-012",
    patient_id: "patient-001",
    test_name: "HDL",
    value: "45",
    unit: "mg/dL",
    normal_range: ">40",
    status: "normal",
    test_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: null,
    lab_file_id: null,
  },
  {
    id: "lab-013",
    patient_id: "patient-001",
    test_name: "Triglycerides",
    value: "165",
    unit: "mg/dL",
    normal_range: "<150",
    status: "borderline",
    test_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Monitor diet",
    lab_file_id: null,
  },
  // Additional labs for patient-001 (60 days ago)
  {
    id: "lab-014",
    patient_id: "patient-001",
    test_name: "Complete Blood Count",
    value: "Normal",
    unit: "",
    normal_range: "Within range",
    status: "normal",
    test_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: "/labs/cbc-report.pdf",
    notes: "All parameters within normal limits",
    lab_file_id: null,
  },
  {
    id: "lab-015",
    patient_id: "patient-001",
    test_name: "Liver Function Test",
    value: "Normal",
    unit: "",
    normal_range: "Within range",
    status: "normal",
    test_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: "/labs/lft-report.pdf",
    notes: null,
    lab_file_id: null,
  },
  // Additional labs for patient-002 (recent comprehensive panel)
  {
    id: "lab-016",
    patient_id: "patient-002",
    test_name: "Hemoglobin",
    value: "14.2",
    unit: "g/dL",
    normal_range: "13-17 (M)",
    status: "normal",
    test_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: null,
    lab_file_id: "labfile-002",
  },
  {
    id: "lab-017",
    patient_id: "patient-002",
    test_name: "Platelets",
    value: "245",
    unit: "K/µL",
    normal_range: "150-400",
    status: "normal",
    test_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: null,
    lab_file_id: "labfile-002",
  },
  {
    id: "lab-018",
    patient_id: "patient-002",
    test_name: "ALT",
    value: "28",
    unit: "U/L",
    normal_range: "7-56",
    status: "normal",
    test_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Liver function good",
    lab_file_id: "labfile-002",
  },
  // Additional labs for patient-002 (45 days ago)
  {
    id: "lab-019",
    patient_id: "patient-002",
    test_name: "HbA1c",
    value: "7.8",
    unit: "%",
    normal_range: "<5.7",
    status: "abnormal",
    test_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Significant improvement needed",
    lab_file_id: null,
  },
  {
    id: "lab-020",
    patient_id: "patient-002",
    test_name: "Fasting Glucose",
    value: "145",
    unit: "mg/dL",
    normal_range: "70-100",
    status: "abnormal",
    test_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: "Started on metformin",
    lab_file_id: null,
  },
  {
    id: "lab-021",
    patient_id: "patient-002",
    test_name: "Cholesterol (Total)",
    value: "198",
    unit: "mg/dL",
    normal_range: "<200",
    status: "normal",
    test_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    pdf_url: null,
    notes: null,
    lab_file_id: null,
  },
]

// Appointments (extended from existing)
interface Appointment {
  id: string
  patient_id: string
  patient_name: string
  scheduled_at: string
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show" | "arrived"
  type: string
  notes: string | null
  created_at: string
  doctor_id: string | null
  doctor_full_name: string | null
  clinic_id: string | null
  clinic_name: string | null
  online_call_link?: string
}

// Helper function to get fresh appointments with current timestamps
// Distributes appointments across all doctors (user-001, user-002) and all clinics (clinic-001, clinic-002, clinic-003)
const generateMockAppointments = (): Appointment[] => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // Get start of current week (Sunday)
  const dayOfWeek = today.getDay()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - dayOfWeek)
  weekStart.setHours(9, 0, 0, 0) // Start at 9 AM
  
  // Helper to create date for a specific day of week (0=Sunday, 6=Saturday) and hour
  const getWeekDate = (dayOffset: number, hour: number, minute: number = 0) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + dayOffset)
    date.setHours(hour, minute, 0, 0)
    return date
  }
  
  // Doctor and clinic assignments
  // user-001 = "أحمد حسن" (العلاج الطبيعي والتغذية)
  // user-002 = "فاطمة علي" (الطب الباطني)
  // clinic-001 = "المعادي"
  // clinic-002 = "مدينة نصر"
  // clinic-003 = "الزمالك"
  
  return [
    // ========== CLINIC-001 (المعادي) ==========
    // Doctor user-001 (أحمد حسن) - Sunday
    {
      id: "apt-001",
      patient_id: "patient-001",
      patient_name: "Fatima Mohamed",
      scheduled_at: getWeekDate(0, 10, 0).toISOString(),
      status: "confirmed",
      type: "Follow-up",
      notes: "Check blood pressure levels",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
      online_call_link: "https://meet.google.com/abc-defg-hij",
    },
    // Doctor user-002 (فاطمة علي) - Sunday
    {
      id: "apt-002",
      patient_id: "patient-002",
      patient_name: "Ahmed Abdullah",
      scheduled_at: getWeekDate(0, 14, 0).toISOString(),
      status: "scheduled",
      type: "Consultation",
      notes: "Initial consultation for back pain",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Doctor user-001 - Sunday
    {
      id: "apt-003",
      patient_id: "patient-003",
      patient_name: "Layla Ibrahim",
      scheduled_at: getWeekDate(0, 16, 0).toISOString(),
      status: "confirmed",
      type: "Check-up",
      notes: "Regular check-up appointment",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Monday - Doctor user-001
    {
      id: "apt-004",
      patient_id: "patient-004",
      patient_name: "Omar Khalil",
      scheduled_at: getWeekDate(1, 9, 30).toISOString(),
      status: "scheduled",
      type: "Follow-up",
      notes: "Review test results",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Monday - Doctor user-002
    {
      id: "apt-005",
      patient_id: "patient-005",
      patient_name: "Nour Amin",
      scheduled_at: getWeekDate(1, 11, 0).toISOString(),
      status: "confirmed",
      type: "Consultation",
      notes: "Discussed treatment plan",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Monday - Doctor user-001
    {
      id: "apt-006",
      patient_id: "patient-001",
      patient_name: "Fatima Mohamed",
      scheduled_at: getWeekDate(1, 15, 0).toISOString(),
      status: "scheduled",
      type: "Check-up",
      notes: "Blood pressure monitoring",
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Tuesday - Doctor user-002
    {
      id: "apt-007",
      patient_id: "patient-002",
      patient_name: "Ahmed Abdullah",
      scheduled_at: getWeekDate(2, 10, 0).toISOString(),
      status: "scheduled",
      type: "Procedure",
      notes: "Physical therapy session",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Tuesday - Doctor user-001
    {
      id: "apt-008",
      patient_id: "patient-003",
      patient_name: "Layla Ibrahim",
      scheduled_at: getWeekDate(2, 13, 30).toISOString(),
      status: "confirmed",
      type: "Consultation",
      notes: "Thyroid check-up",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Tuesday - Doctor user-002
    {
      id: "apt-009",
      patient_id: "patient-004",
      patient_name: "Omar Khalil",
      scheduled_at: getWeekDate(2, 16, 0).toISOString(),
      status: "scheduled",
      type: "Check-up",
      notes: "Asthma follow-up",
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
      online_call_link: "https://zoom.us/j/123456789",
    },
    // Wednesday - Doctor user-001
    {
      id: "apt-010",
      patient_id: "patient-005",
      patient_name: "Nour Amin",
      scheduled_at: getWeekDate(3, 9, 0).toISOString(),
      status: "confirmed",
      type: "Follow-up",
      notes: "GERD management",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Wednesday - Doctor user-002
    {
      id: "apt-011",
      patient_id: "patient-001",
      patient_name: "Fatima Mohamed",
      scheduled_at: getWeekDate(3, 11, 30).toISOString(),
      status: "scheduled",
      type: "Follow-up",
      notes: "Blood pressure check",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Wednesday - Doctor user-001
    {
      id: "apt-012",
      patient_id: "patient-002",
      patient_name: "Ahmed Abdullah",
      scheduled_at: getWeekDate(3, 14, 0).toISOString(),
      status: "confirmed",
      type: "Consultation",
      notes: "Diabetes management review",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Thursday - Doctor user-002
    {
      id: "apt-013",
      patient_id: "patient-003",
      patient_name: "Layla Ibrahim",
      scheduled_at: getWeekDate(4, 10, 0).toISOString(),
      status: "scheduled",
      type: "Check-up",
      notes: "Regular check-up appointment",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Thursday - Doctor user-001
    {
      id: "apt-014",
      patient_id: "patient-004",
      patient_name: "Omar Khalil",
      scheduled_at: getWeekDate(4, 13, 0).toISOString(),
      status: "confirmed",
      type: "Follow-up",
      notes: "Review test results",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Thursday - Doctor user-002
    {
      id: "apt-015",
      patient_id: "patient-005",
      patient_name: "Nour Amin",
      scheduled_at: getWeekDate(4, 15, 30).toISOString(),
      status: "scheduled",
      type: "Procedure",
      notes: "Physical therapy session",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Friday - Doctor user-001
    {
      id: "apt-016",
      patient_id: "patient-001",
      patient_name: "Fatima Mohamed",
      scheduled_at: getWeekDate(5, 9, 0).toISOString(),
      status: "confirmed",
      type: "Check-up",
      notes: "Annual health screening",
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Friday - Doctor user-002
    {
      id: "apt-017",
      patient_id: "patient-002",
      patient_name: "Ahmed Abdullah",
      scheduled_at: getWeekDate(5, 11, 0).toISOString(),
      status: "scheduled",
      type: "Consultation",
      notes: "Follow-up consultation",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Friday - Doctor user-001
    {
      id: "apt-018",
      patient_id: "patient-003",
      patient_name: "Layla Ibrahim",
      scheduled_at: getWeekDate(5, 14, 0).toISOString(),
      status: "confirmed",
      type: "Follow-up",
      notes: "Thyroid check-up",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Saturday - Doctor user-001
    {
      id: "apt-019",
      patient_id: "patient-004",
      patient_name: "Omar Khalil",
      scheduled_at: getWeekDate(6, 10, 0).toISOString(),
      status: "scheduled",
      type: "Check-up",
      notes: "Asthma follow-up",
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Saturday - Doctor user-001
    {
      id: "apt-020",
      patient_id: "patient-005",
      patient_name: "Nour Amin",
      scheduled_at: getWeekDate(6, 12, 0).toISOString(),
      status: "confirmed",
      type: "Consultation",
      notes: "GERD management",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    
    // ========== CLINIC-002 (مدينة نصر) ==========
    // Doctor user-001 - Monday
    {
      id: "apt-021",
      patient_id: "patient-001",
      patient_name: "Fatima Mohamed",
      scheduled_at: getWeekDate(1, 10, 0).toISOString(),
      status: "confirmed",
      type: "Follow-up",
      notes: "Physical therapy follow-up",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-002",
      clinic_name: "مدينة نصر",
    },
    // Doctor user-002 - Monday
    {
      id: "apt-022",
      patient_id: "patient-002",
      patient_name: "Ahmed Abdullah",
      scheduled_at: getWeekDate(1, 14, 0).toISOString(),
      status: "scheduled",
      type: "Consultation",
      notes: "Internal medicine consultation",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-002",
      clinic_name: "مدينة نصر",
    },
    // Doctor user-001 - Wednesday
    {
      id: "apt-023",
      patient_id: "patient-003",
      patient_name: "Layla Ibrahim",
      scheduled_at: getWeekDate(3, 10, 0).toISOString(),
      status: "confirmed",
      type: "Check-up",
      notes: "Nutrition consultation",
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-002",
      clinic_name: "مدينة نصر",
    },
    // Doctor user-002 - Wednesday
    {
      id: "apt-024",
      patient_id: "patient-004",
      patient_name: "Omar Khalil",
      scheduled_at: getWeekDate(3, 15, 0).toISOString(),
      status: "scheduled",
      type: "Follow-up",
      notes: "Cardiology follow-up",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-002",
      clinic_name: "مدينة نصر",
    },
    // Doctor user-001 - Friday
    {
      id: "apt-025",
      patient_id: "patient-005",
      patient_name: "Nour Amin",
      scheduled_at: getWeekDate(5, 10, 0).toISOString(),
      status: "confirmed",
      type: "Consultation",
      notes: "Physical therapy assessment",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-002",
      clinic_name: "مدينة نصر",
    },
    
    // ========== CLINIC-003 (الزمالك) ==========
    // Doctor user-002 - Tuesday
    {
      id: "apt-026",
      patient_id: "patient-001",
      patient_name: "Fatima Mohamed",
      scheduled_at: getWeekDate(2, 11, 0).toISOString(),
      status: "scheduled",
      type: "Consultation",
      notes: "Internal medicine consultation",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-003",
      clinic_name: "الزمالك",
    },
    // Doctor user-001 - Thursday
    {
      id: "apt-027",
      patient_id: "patient-002",
      patient_name: "Ahmed Abdullah",
      scheduled_at: getWeekDate(4, 11, 0).toISOString(),
      status: "confirmed",
      type: "Follow-up",
      notes: "Physical therapy progress check",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-003",
      clinic_name: "الزمالك",
    },
    // Doctor user-002 - Thursday
    {
      id: "apt-028",
      patient_id: "patient-003",
      patient_name: "Layla Ibrahim",
      scheduled_at: getWeekDate(4, 14, 0).toISOString(),
      status: "scheduled",
      type: "Check-up",
      notes: "General health check",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-003",
      clinic_name: "الزمالك",
    },
    
    // ========== PAST APPOINTMENTS (for history) ==========
    {
      id: "apt-029",
      patient_id: "patient-001",
      patient_name: "Fatima Mohamed",
      scheduled_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Check-up",
      notes: "Previous week appointment",
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    {
      id: "apt-030",
      patient_id: "patient-003",
      patient_name: "Layla Ibrahim",
      scheduled_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: "no_show",
      type: "Follow-up",
      notes: "Patient did not attend",
      created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-002",
      clinic_name: "مدينة نصر",
    },
    // Additional historical appointments for patient-001
    {
      id: "apt-031",
      patient_id: "patient-001",
      patient_name: "Fatima Mohamed",
      scheduled_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Follow-up",
      notes: "Blood pressure check - stable",
      created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    {
      id: "apt-032",
      patient_id: "patient-001",
      patient_name: "Fatima Mohamed",
      scheduled_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Check-up",
      notes: "Routine check-up",
      created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    {
      id: "apt-033",
      patient_id: "patient-001",
      patient_name: "Fatima Mohamed",
      scheduled_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Consultation",
      notes: "Initial consultation",
      created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Additional historical appointments for patient-002
    {
      id: "apt-034",
      patient_id: "patient-002",
      patient_name: "Ahmed Abdullah",
      scheduled_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Follow-up",
      notes: "Diabetes management review",
      created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    {
      id: "apt-035",
      patient_id: "patient-002",
      patient_name: "Ahmed Abdullah",
      scheduled_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Check-up",
      notes: "Regular check-up",
      created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    {
      id: "apt-036",
      patient_id: "patient-002",
      patient_name: "Ahmed Abdullah",
      scheduled_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Consultation",
      notes: "Initial consultation for diabetes",
      created_at: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Additional historical appointments for patient-003
    {
      id: "apt-037",
      patient_id: "patient-003",
      patient_name: "Layla Ibrahim",
      scheduled_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Follow-up",
      notes: "Thyroid function review",
      created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-002",
      clinic_name: "مدينة نصر",
    },
    {
      id: "apt-038",
      patient_id: "patient-003",
      patient_name: "Layla Ibrahim",
      scheduled_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Check-up",
      notes: "Weight management consultation",
      created_at: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-002",
      clinic_name: "مدينة نصر",
    },
    {
      id: "apt-039",
      patient_id: "patient-003",
      patient_name: "Layla Ibrahim",
      scheduled_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Consultation",
      notes: "Initial consultation",
      created_at: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-002",
      clinic_name: "مدينة نصر",
    },
    {
      id: "apt-040",
      patient_id: "patient-003",
      patient_name: "Layla Ibrahim",
      scheduled_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Follow-up",
      notes: "First follow-up visit",
      created_at: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-002",
      clinic_name: "مدينة نصر",
    },
    // Additional historical appointments for patient-004
    {
      id: "apt-041",
      patient_id: "patient-004",
      patient_name: "Omar Khalil",
      scheduled_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Follow-up",
      notes: "Asthma control assessment",
      created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    {
      id: "apt-042",
      patient_id: "patient-004",
      patient_name: "Omar Khalil",
      scheduled_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Check-up",
      notes: "Routine check-up",
      created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    {
      id: "apt-043",
      patient_id: "patient-004",
      patient_name: "Omar Khalil",
      scheduled_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Consultation",
      notes: "Initial consultation for asthma",
      created_at: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-001",
      doctor_full_name: "أحمد حسن",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    // Additional historical appointments for patient-005
    {
      id: "apt-044",
      patient_id: "patient-005",
      patient_name: "Nour Amin",
      scheduled_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Follow-up",
      notes: "GERD symptoms review",
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    {
      id: "apt-045",
      patient_id: "patient-005",
      patient_name: "Nour Amin",
      scheduled_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Check-up",
      notes: "Weight management consultation",
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
    {
      id: "apt-046",
      patient_id: "patient-005",
      patient_name: "Nour Amin",
      scheduled_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      type: "Consultation",
      notes: "Initial consultation",
      created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      doctor_id: "user-002",
      doctor_full_name: "فاطمة علي",
      clinic_id: "clinic-001",
      clinic_name: "المعادي",
    },
  ]
}

// Generate fresh appointments
const generatedAppointments = generateMockAppointments()

// Add past appointments with "arrived" or "completed" status for accounting demo
const now = new Date()
const pastAppointments: Appointment[] = [
  // Past appointments from last week - arrived/completed
  {
    id: "apt-past-001",
    patient_id: "patient-001",
    patient_name: "Fatima Mohamed",
    scheduled_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    status: "completed",
    type: "Consultation",
    notes: "Blood pressure check",
    created_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    doctor_id: "user-001",
    doctor_full_name: "أحمد حسن",
    clinic_id: "clinic-001",
    clinic_name: "المعادي",
  },
  {
    id: "apt-past-002",
    patient_id: "patient-002",
    patient_name: "Ahmed Abdullah",
    scheduled_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    status: "completed",
    type: "Follow-up",
    notes: "Diabetes follow-up",
    created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    doctor_id: "user-001",
    doctor_full_name: "أحمد حسن",
    clinic_id: "clinic-001",
    clinic_name: "المعادي",
  },
  {
    id: "apt-past-003",
    patient_id: "patient-003",
    patient_name: "Layla Ibrahim",
    scheduled_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: "arrived",
    type: "Check-up",
    notes: "Thyroid check",
    created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    doctor_id: "user-002",
    doctor_full_name: "فاطمة علي",
    clinic_id: "clinic-001",
    clinic_name: "المعادي",
  },
  {
    id: "apt-past-004",
    patient_id: "patient-004",
    patient_name: "Omar Khalil",
    scheduled_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    status: "completed",
    type: "Consultation",
    notes: "Asthma consultation",
    created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    doctor_id: "user-001",
    doctor_full_name: "أحمد حسن",
    clinic_id: "clinic-001",
    clinic_name: "المعادي",
  },
  {
    id: "apt-past-005",
    patient_id: "patient-005",
    patient_name: "Nour Amin",
    scheduled_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: "arrived",
    type: "Follow-up",
    notes: "GERD follow-up",
    created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    doctor_id: "user-002",
    doctor_full_name: "فاطمة علي",
    clinic_id: "clinic-001",
    clinic_name: "المعادي",
  },
  {
    id: "apt-past-006",
    patient_id: "patient-001",
    patient_name: "Fatima Mohamed",
    scheduled_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: "completed",
    type: "Follow-up",
    notes: "Hypertension follow-up",
    created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    doctor_id: "user-001",
    doctor_full_name: "أحمد حسن",
    clinic_id: "clinic-001",
    clinic_name: "المعادي",
  },
  {
    id: "apt-past-007",
    patient_id: "patient-002",
    patient_name: "Ahmed Abdullah",
    scheduled_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    status: "arrived",
    type: "Consultation",
    notes: "Diabetes consultation",
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    doctor_id: "user-001",
    doctor_full_name: "أحمد حسن",
    clinic_id: "clinic-001",
    clinic_name: "المعادي",
  },
]

// Export fresh appointments + past appointments
export const mockAppointments: Appointment[] = [...generatedAppointments, ...pastAppointments]

// Export all mock data
// Transcriptions
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

// Leads
interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  status: "new" | "contacted" | "qualified" | "converted" | "lost"
  source: string
  quality: "hot" | "warm" | "cold"
  next_action_due: string | null
  created_at: string
  converted_at: string | null
}

export const mockLeads: Lead[] = [
  {
    id: "lead-001",
    name: "Ahmed Mohamed",
    phone: "+20 100 123 4567",
    email: "ahmed@example.com",
    status: "new",
    source: "Website",
    quality: "hot",
    next_action_due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    converted_at: null,
  },
  {
    id: "lead-002",
    name: "Fatima Ali",
    phone: "+20 100 234 5678",
    email: "fatima@example.com",
    status: "contacted",
    source: "Referral",
    quality: "hot",
    next_action_due: new Date().toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    converted_at: null,
  },
  {
    id: "lead-003",
    name: "Omar Hassan",
    phone: "+20 100 345 6789",
    email: null,
    status: "qualified",
    source: "Social Media",
    quality: "warm",
    next_action_due: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    converted_at: null,
  },
  {
    id: "lead-004",
    name: "Layla Ibrahim",
    phone: "+20 100 456 7890",
    email: "layla@example.com",
    status: "converted",
    source: "Website",
    quality: "hot",
    next_action_due: null,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    converted_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "lead-005",
    name: "Nour Khalil",
    phone: "+20 100 567 8901",
    email: "nour@example.com",
    status: "new",
    source: "Referral",
    quality: "hot",
    next_action_due: new Date().toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    converted_at: null,
  },
  {
    id: "lead-006",
    name: "Mohamed Amin",
    phone: "+20 100 678 9012",
    email: "mohamed@example.com",
    status: "contacted",
    source: "Website",
    quality: "warm",
    next_action_due: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    converted_at: null,
  },
]

// Waiting List Entries
export interface WaitingListEntry {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  patientPhone: string
  requestedDoctorId?: string
  appointmentType?: "new" | "followup" | "online"
  earliestDate?: string
  latestDate?: string
  preferredTimeWindow?: "any" | "morning" | "afternoon" | "evening"
  preferredDays?: string[]
  status: "active" | "offered" | "booked" | "snoozed" | "removed"
  priority: "low" | "normal" | "high"
  notes?: string
  nextActionAt?: string
  createdAt: string
  updatedAt: string
}

export const mockWaitingListEntries: WaitingListEntry[] = [
  {
    id: "waitlist-001",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-001",
    patientName: "Fatima Mohamed",
    patientPhone: "+20 100 1234567",
    requestedDoctorId: DEMO_DOCTOR_ID,
    appointmentType: "followup",
    earliestDate: new Date().toISOString().split("T")[0],
    latestDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    preferredTimeWindow: "morning",
    preferredDays: ["monday", "wednesday", "friday"],
    status: "active",
    priority: "high",
    notes: "Patient prefers morning appointments",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-002",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-002",
    patientName: "Ahmed Abdullah",
    patientPhone: "+20 100 2345678",
    appointmentType: "followup",
    preferredTimeWindow: "afternoon",
    preferredDays: ["tuesday", "thursday"],
    status: "active",
    priority: "normal",
    notes: "Flexible with timing",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-003",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-003",
    patientName: "Layla Ibrahim",
    patientPhone: "+20 100 3456789",
    requestedDoctorId: DEMO_DOCTOR_ID,
    appointmentType: "new",
    preferredTimeWindow: "evening",
    preferredDays: ["monday", "wednesday", "friday"],
    status: "active",
    priority: "normal",
    notes: "Evening appointments preferred",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-004",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-004",
    patientName: "Omar Khalil",
    patientPhone: "+20 100 4567890",
    appointmentType: "online",
    preferredTimeWindow: "any",
    status: "active",
    priority: "low",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-005",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-005",
    patientName: "Mariam Hassan",
    patientPhone: "+20 100 5678901",
    requestedDoctorId: DEMO_DOCTOR_ID,
    appointmentType: "followup",
    earliestDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    latestDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    preferredTimeWindow: "morning",
    preferredDays: ["saturday", "sunday"],
    status: "active",
    priority: "high",
    notes: "Weekend morning preferred",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-006",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-006",
    patientName: "Youssef Ali",
    patientPhone: "+20 100 6789012",
    appointmentType: "new",
    preferredTimeWindow: "afternoon",
    status: "active",
    priority: "normal",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-007",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-007",
    patientName: "Nour Mahmoud",
    patientPhone: "+20 100 7890123",
    appointmentType: "followup",
    preferredTimeWindow: "any",
    preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    status: "offered",
    priority: "normal",
    notes: "Already offered a slot, waiting for response",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-008",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-008",
    patientName: "Sara Mohamed",
    patientPhone: "+20 100 8901234",
    requestedDoctorId: DEMO_DOCTOR_ID,
    appointmentType: "online",
    preferredTimeWindow: "evening",
    status: "active",
    priority: "high",
    notes: "Urgent online consultation needed",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Appointment Approval Requests
export interface AppointmentApprovalRequest {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  patientPhone: string
  doctorId?: string
  appointmentType: string
  requestedStartAt: string
  requestedEndAt: string
  source: "integration" | "online_booking"
  status: "pending" | "approved" | "rejected"
  notes?: string
  createdAt: string
}

export const mockApprovalRequests: AppointmentApprovalRequest[] = [
  {
    id: "approval-001",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-009",
    patientName: "Khaled Farid",
    patientPhone: "+20 100 9012345",
    doctorId: DEMO_DOCTOR_ID,
    appointmentType: "new",
    requestedStartAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    requestedEndAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    source: "integration",
    status: "pending",
    notes: "Booked via TidyCal integration",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "approval-002",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-010",
    patientName: "Rania Taha",
    patientPhone: "+20 100 0123456",
    appointmentType: "followup",
    requestedStartAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    requestedEndAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    source: "online_booking",
    status: "pending",
    notes: "Booked via website",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "approval-003",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-011",
    patientName: "Tamer Soliman",
    patientPhone: "+20 100 1234567",
    doctorId: DEMO_DOCTOR_ID,
    appointmentType: "online",
    requestedStartAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    requestedEndAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    source: "integration",
    status: "pending",
    notes: "Booked via Calendly integration",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

// Doctor Availability
// Note: 
// - doctorId should match user IDs from users-clinics.ts ("user-001", "user-002")
// - clinicId should match clinic IDs from users-clinics.ts ("clinic-001", "clinic-002", "clinic-003")
// Distributing availability across all doctors and clinics so appointments are visible everywhere
export const mockDoctorAvailability: DoctorAvailability[] = [
  // ========== DOCTOR user-001 (أحمد حسن) ==========
  // Clinic-001 (المعادي) - Weekdays
  {
    id: "avail-001",
    doctorId: "user-001",
    clinicId: "clinic-001",
    daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
    appointmentTypeDurations: {
      "new": 60,
      "Consultation": 60,
      "followup": 30,
      "Follow-up": 30,
      "Followup": 30,
      "online": 45,
      "Check-up": 60,
      "Checkup": 60,
      "Procedure": 45,
    },
    breaks: [
      { startTime: "12:00", endTime: "13:00" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Clinic-001 (المعادي) - Saturday
  {
    id: "avail-002",
    doctorId: "user-001",
    clinicId: "clinic-001",
    daysOfWeek: ["saturday"],
    startTime: "09:00",
    endTime: "13:00",
    slotDuration: 30,
    appointmentTypeDurations: {
      "new": 60,
      "Consultation": 60,
      "followup": 30,
      "Follow-up": 30,
      "Followup": 30,
    },
    breaks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Clinic-002 (مدينة نصر) - Monday, Wednesday, Friday
  {
    id: "avail-003",
    doctorId: "user-001",
    clinicId: "clinic-002",
    daysOfWeek: ["monday", "wednesday", "friday"],
    startTime: "09:00",
    endTime: "15:00",
    slotDuration: 30,
    appointmentTypeDurations: {
      "new": 60,
      "Consultation": 60,
      "followup": 30,
      "Follow-up": 30,
      "Followup": 30,
    },
    breaks: [
      { startTime: "12:00", endTime: "13:00" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Clinic-003 (الزمالك) - Thursday
  {
    id: "avail-004",
    doctorId: "user-001",
    clinicId: "clinic-003",
    daysOfWeek: ["thursday"],
    startTime: "09:00",
    endTime: "16:00",
    slotDuration: 30,
    appointmentTypeDurations: {
      "new": 60,
      "Consultation": 60,
      "followup": 30,
      "Follow-up": 30,
      "Followup": 30,
    },
    breaks: [
      { startTime: "12:00", endTime: "13:00" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  
  // ========== DOCTOR user-002 (فاطمة علي) ==========
  // Clinic-001 (المعادي) - Weekdays
  {
    id: "avail-005",
    doctorId: "user-002",
    clinicId: "clinic-001",
    daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    startTime: "10:00",
    endTime: "16:00",
    slotDuration: 30,
    appointmentTypeDurations: {
      "new": 45,
      "Consultation": 45,
      "followup": 30,
      "Follow-up": 30,
      "Followup": 30,
    },
    breaks: [
      { startTime: "13:00", endTime: "14:00" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Clinic-002 (مدينة نصر) - Monday, Wednesday
  {
    id: "avail-006",
    doctorId: "user-002",
    clinicId: "clinic-002",
    daysOfWeek: ["monday", "wednesday"],
    startTime: "09:00",
    endTime: "15:00",
    slotDuration: 30,
    appointmentTypeDurations: {
      "new": 45,
      "Consultation": 45,
      "followup": 30,
      "Follow-up": 30,
      "Followup": 30,
    },
    breaks: [
      { startTime: "12:00", endTime: "13:00" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Clinic-003 (الزمالك) - Tuesday, Thursday
  {
    id: "avail-007",
    doctorId: "user-002",
    clinicId: "clinic-003",
    daysOfWeek: ["tuesday", "thursday"],
    startTime: "09:00",
    endTime: "16:00",
    slotDuration: 30,
    appointmentTypeDurations: {
      "new": 45,
      "Consultation": 45,
      "followup": 30,
      "Follow-up": 30,
      "Followup": 30,
    },
    breaks: [
      { startTime: "12:00", endTime: "13:00" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Prescriptions
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

export const mockData = {
  doctors: mockDoctors,
  patients: mockPatients,
  appointments: mockAppointments,
  weightLogs: mockWeightLogs,
  injections: mockInjections,
  medications: mockMedications,
  doctorNotes: mockDoctorNotes,
  tasks: mockTasks,
  patientDiets: mockPatientDiets,
  labFiles: mockLabFiles,
  labResults: mockLabResults,
  transcriptions: mockTranscriptions,
  attachments: mockAttachments,
  scanExtractions: mockScanExtractions,
  leads: mockLeads,
  waitingListEntries: mockWaitingListEntries,
  approvalRequests: mockApprovalRequests,
  doctorAvailability: mockDoctorAvailability,
  prescriptions: mockPrescriptions,
  pastMedications: mockPastMedications,
}
