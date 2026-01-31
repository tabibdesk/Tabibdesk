import { DEMO_DOCTOR_ID } from "./constants"

export interface Patient {
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
