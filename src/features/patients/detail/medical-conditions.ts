/** Medical condition category for settings grouping. */
export type MedicalConditionCategory =
  | "basic"
  | "cardiovascular"
  | "respiratory"
  | "neurology"
  | "renal"
  | "endocrine"
  | "musculoskeletal"
  | "infectious"
  | "oncology"
  | "other"

/** Medical condition id → label. Clinical terms kept in English. */
export interface MedicalConditionEntry {
  id: string
  label: string
  category: MedicalConditionCategory
}

export const MEDICAL_CONDITIONS: MedicalConditionEntry[] = [
  // Basic (lifestyle/demographic)
  { id: "is_pregnant", label: "Pregnancy Status", category: "basic" },
  { id: "smoking_status", label: "Smoking Status", category: "basic" },
  { id: "alcohol_use", label: "Alcohol Use", category: "basic" },
  { id: "is_breastfeeding", label: "Breastfeeding", category: "basic" },
  // Cardiovascular
  { id: "has_afib", label: "Atrial Fibrillation", category: "cardiovascular" },
  { id: "has_pad", label: "Peripheral Artery Disease", category: "cardiovascular" },
  { id: "has_stroke_tia", label: "Stroke / TIA", category: "cardiovascular" },
  { id: "has_dyslipidemia", label: "Dyslipidemia", category: "cardiovascular" },
  { id: "has_valvular_heart_disease", label: "Valvular Heart Disease", category: "cardiovascular" },
  { id: "is_hypertensive", label: "Hypertension", category: "cardiovascular" },
  { id: "has_ihd", label: "Ischemic Heart Disease", category: "cardiovascular" },
  { id: "has_heart_failure", label: "Heart Failure", category: "cardiovascular" },
  // Respiratory & ENT
  { id: "has_copd", label: "COPD", category: "respiratory" },
  { id: "has_osa", label: "Obstructive Sleep Apnea", category: "respiratory" },
  { id: "has_allergic_rhinitis", label: "Allergic Rhinitis", category: "respiratory" },
  { id: "has_chronic_sinusitis", label: "Chronic Sinusitis", category: "respiratory" },
  { id: "has_bronchial_asthma", label: "Bronchial Asthma", category: "respiratory" },
  // Neurology & Psychiatry
  { id: "has_epilepsy", label: "Epilepsy / Seizure Disorder", category: "neurology" },
  { id: "has_dementia", label: "Dementia / Alzheimer's", category: "neurology" },
  { id: "has_parkinsons", label: "Parkinson's Disease", category: "neurology" },
  { id: "has_migraine", label: "Migraine / Chronic Headache", category: "neurology" },
  { id: "has_depression", label: "Depression", category: "neurology" },
  { id: "has_gad", label: "Generalized Anxiety Disorder", category: "neurology" },
  { id: "has_bipolar", label: "Bipolar Disorder", category: "neurology" },
  // Renal & Genitourinary
  { id: "has_ckd", label: "Chronic Kidney Disease", category: "renal" },
  { id: "has_nephrolithiasis", label: "Kidney Stones", category: "renal" },
  { id: "has_bph", label: "Benign Prostatic Hyperplasia", category: "renal" },
  { id: "has_esrd", label: "ESRD / On Dialysis", category: "renal" },
  // Endocrine & Reproductive
  { id: "is_diabetic", label: "Diabetes", category: "endocrine" },
  { id: "has_hypothyroidism", label: "Hypothyroidism", category: "endocrine" },
  { id: "has_hyperthyroidism", label: "Hyperthyroidism", category: "endocrine" },
  { id: "has_pcos", label: "PCOS", category: "endocrine" },
  { id: "has_osteoporosis", label: "Osteoporosis / Osteopenia", category: "endocrine" },
  { id: "has_menopause", label: "Menopause / Post-menopausal", category: "endocrine" },
  { id: "has_infertility", label: "Infertility", category: "endocrine" },
  // Musculoskeletal & Autoimmune
  { id: "has_osteoarthritis", label: "Osteoarthritis", category: "musculoskeletal" },
  { id: "has_gout", label: "Gout", category: "musculoskeletal" },
  { id: "has_sle", label: "Systemic Lupus Erythematosus", category: "musculoskeletal" },
  { id: "has_fibromyalgia", label: "Fibromyalgia", category: "musculoskeletal" },
  { id: "has_chronic_low_back_pain", label: "Chronic Low Back Pain", category: "musculoskeletal" },
  { id: "has_rheumatoid", label: "Rheumatoid Arthritis", category: "musculoskeletal" },
  // Infectious & Immunology
  { id: "has_hiv", label: "HIV / AIDS", category: "infectious" },
  { id: "has_hepatitis_b", label: "Hepatitis B", category: "infectious" },
  { id: "has_hepatitis_c", label: "Hepatitis C", category: "infectious" },
  { id: "has_tb", label: "Tuberculosis", category: "infectious" },
  { id: "is_immunocompromised", label: "Immunocompromised", category: "infectious" },
  { id: "has_hepatic", label: "Hepatic Disease", category: "infectious" },
  // Oncology
  { id: "has_active_malignancy", label: "Active Malignancy", category: "oncology" },
  { id: "has_cancer_remission", label: "Cancer in Remission", category: "oncology" },
  // Other (existing)
  { id: "has_pancreatitis", label: "Pancreatitis", category: "other" },
  { id: "has_gerd", label: "GERD", category: "other" },
  { id: "has_gastritis", label: "Gastritis", category: "other" },
  { id: "has_anaemia", label: "Anemia", category: "other" },
  { id: "glp1a_previous_exposure", label: "GLP-1A Previous Exposure", category: "other" },
]

/** Default enabled: Pregnancy, Diabetes, Hypertension, Breastfeeding, IHD, Smoking, Alcohol */
export const DEFAULT_MEDICAL_CONDITION_IDS = [
  "is_pregnant",
  "is_diabetic",
  "is_hypertensive",
  "is_breastfeeding",
  "has_ihd",
  "smoking_status",
  "alcohol_use",
] as const

export type MedicalConditionId = (typeof MEDICAL_CONDITIONS)[number]["id"]
