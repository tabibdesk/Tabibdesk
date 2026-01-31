// Medical records mock data
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
