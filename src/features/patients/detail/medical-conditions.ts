/** Medical condition id → label. Clinical terms kept in English. */
export const MEDICAL_CONDITIONS = [
  { id: "is_diabetic", label: "Diabetes" },
  { id: "is_hypertensive", label: "Hypertension" },
  { id: "has_pancreatitis", label: "Pancreatitis" },
  { id: "has_gerd", label: "GERD" },
  { id: "has_gastritis", label: "Gastritis" },
  { id: "has_hepatic", label: "Hepatic Disease" },
  { id: "has_anaemia", label: "Anemia" },
  { id: "has_bronchial_asthma", label: "Bronchial Asthma" },
  { id: "has_rheumatoid", label: "Rheumatoid Arthritis" },
  { id: "has_ihd", label: "Ischemic Heart Disease" },
  { id: "has_heart_failure", label: "Heart Failure" },
  { id: "is_pregnant", label: "Pregnant" },
  { id: "is_breastfeeding", label: "Breastfeeding" },
  { id: "glp1a_previous_exposure", label: "GLP-1A Previous Exposure" },
] as const

/** Default enabled: Pregnancy, Diabetes, Hypertension, Breastfeeding, Heart disease (IHD) */
export const DEFAULT_MEDICAL_CONDITION_IDS = [
  "is_pregnant",
  "is_diabetic",
  "is_hypertensive",
  "is_breastfeeding",
  "has_ihd",
] as const

export type MedicalConditionId = (typeof MEDICAL_CONDITIONS)[number]["id"]
