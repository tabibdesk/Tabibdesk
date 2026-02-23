/**
 * Progress API types — key-value pairs ready for charting.
 * Each metric has an id/label and an array of date/value points.
 */

/** Single progress record (row) as stored in DB / used by repository. */
export interface Progress {
  id: string
  patient_id: string
  metric: string
  value: string | number
  unit?: string
  notes?: string
  created_at: string
}

export interface ProgressPoint {
  date: string // ISO date
  value: number
  sourceId?: string
}

export type ProgressSource = "weight" | "lab" | "medication" | "note"

export interface ProgressMetric {
  id: string
  label: string
  unit: string
  source: ProgressSource
  points: ProgressPoint[]
}

export interface ProgressResponse {
  metrics: ProgressMetric[]
}

/** Catalog entry for Settings and note reminder (basic + specialty). */
export interface ProgressMetricCatalogEntry {
  id: string
  label: string
  unit: string
  category: "basic" | "specialty"
}

/** Full catalog: basic metrics (vitals) + specialty metrics. */
export const PROGRESS_METRIC_CATALOG: ProgressMetricCatalogEntry[] = [
  // Basic (vitals)
  { id: "pulse", label: "Pulse", unit: "BPM", category: "basic" },
  { id: "oxygen", label: "Oxygen Saturation", unit: "SpO2 %", category: "basic" },
  { id: "temp", label: "Body Temperature", unit: "°C", category: "basic" },
  { id: "bp", label: "Blood Pressure", unit: "mmHg", category: "basic" },
  { id: "respiratory_rate", label: "Respiratory Rate", unit: "breaths/min", category: "basic" },
  { id: "pain_scale", label: "Pain Scale", unit: "0-10", category: "basic" },
  { id: "height", label: "Height", unit: "cm", category: "basic" },
  { id: "weight", label: "Weight", unit: "kg", category: "basic" },
  { id: "bmi", label: "BMI", unit: "kg/m²", category: "basic" },
  { id: "waist_cm", label: "Waist Circumference", unit: "cm", category: "basic" },
  { id: "head_cm", label: "Head Circumference", unit: "cm", category: "basic" },
  { id: "blood_sugar", label: "Blood Sugar", unit: "mg/dL", category: "basic" },
  // Specialty (Metabolic & Endocrine)
  { id: "hba1c", label: "HbA1c", unit: "%", category: "specialty" },
  { id: "ldl", label: "LDL Cholesterol", unit: "mg/dL", category: "specialty" },
  { id: "hdl", label: "HDL Cholesterol", unit: "mg/dL", category: "specialty" },
  { id: "cholesterol_total", label: "Total Cholesterol", unit: "mg/dL", category: "specialty" },
  { id: "triglycerides", label: "Triglycerides", unit: "mg/dL", category: "specialty" },
  { id: "tsh", label: "TSH", unit: "mIU/L", category: "specialty" },
  { id: "active_med_dose", label: "Active Medication Dose", unit: "mg/units", category: "specialty" },
  { id: "ozempic_dose", label: "Ozempic dose", unit: "mg", category: "specialty" },
  // Specialty (Renal & Blood Chemistry)
  { id: "creatinine", label: "Serum Creatinine", unit: "mg/dL", category: "specialty" },
  { id: "egfr", label: "eGFR", unit: "mL/min/1.73m²", category: "specialty" },
  { id: "urine_output", label: "Urine Output", unit: "mL/24h", category: "specialty" },
  { id: "hemoglobin", label: "Hemoglobin", unit: "g/dL", category: "specialty" },
  { id: "wbc", label: "WBC Count", unit: "10⁹/L", category: "specialty" },
  { id: "platelets", label: "Platelet Count", unit: "10⁹/L", category: "specialty" },
  { id: "inr", label: "INR", unit: "ratio", category: "specialty" },
  // Specialty (Respiratory & Neurology)
  { id: "pefr", label: "Peak Flow (PEFR)", unit: "L/min", category: "specialty" },
  { id: "fev1_fvc", label: "FEV1/FVC Ratio", unit: "%", category: "specialty" },
  { id: "gcs", label: "Glasgow Coma Scale", unit: "3-15", category: "specialty" },
  { id: "phq9", label: "PHQ-9 Score", unit: "0-27", category: "specialty" },
  { id: "gad7", label: "GAD-7 Score", unit: "0-21", category: "specialty" },
  { id: "cognitive_score", label: "Cognitive Score (MoCA/MMSE)", unit: "0-30", category: "specialty" },
]

export function getBasicMetrics(): ProgressMetricCatalogEntry[] {
  return PROGRESS_METRIC_CATALOG.filter((m) => m.category === "basic")
}

export function getSpecialtyMetrics(): ProgressMetricCatalogEntry[] {
  return PROGRESS_METRIC_CATALOG.filter((m) => m.category === "specialty")
}

/** Resolve enabled ids to id+label for note reminder. */
export function getMetricsToRecord(enabledIds: string[]): { id: string; label: string }[] {
  const byId = new Map(PROGRESS_METRIC_CATALOG.map((m) => [m.id, m]))
  return enabledIds.map((id) => ({ id, label: byId.get(id)?.label ?? id })).filter((m) => byId.has(m.id))
}

/** Predefined metric ids for settings (tracked metrics dropdown). */
export const PROGRESS_METRIC_IDS = PROGRESS_METRIC_CATALOG.map((m) => m.id) as readonly string[]

export type ProgressMetricId = (typeof PROGRESS_METRIC_IDS)[number]

export const PROGRESS_METRIC_LABELS: Record<string, string> = Object.fromEntries(
  PROGRESS_METRIC_CATALOG.map((m) => [m.id, m.label])
)

/** Regex patterns to auto-detect progress metrics in note text. */
export const PROGRESS_METRIC_REGEX: Record<string, RegExp> = {
  pulse: /\d+\s*bpm|pulse\s*[:=]?\s*\d+|heart rate\s*[:=]?\s*\d+/i,
  oxygen: /spo2\s*[:=]?\s*\d+|\d+\s*%\s*oxygen|oxygen\s*[:=]?\s*\d+|saturation\s*[:=]?\s*\d+/i,
  temp: /\d+(\.\d+)?\s*°?c|temp\s*[:=]?\s*\d+|temperature\s*[:=]?\s*\d+/i,
  bp: /\d+\s*\/\s*\d+|bp\s*[:=]?\s*\d+|blood pressure\s*[:=]?\s*\d+|\d+\s*\/\s*\d+\s*mmhg/i,
  respiratory_rate: /resp\s*[:=]?\s*\d+|respiratory rate\s*[:=]?\s*\d+|\d+\s*breaths/i,
  pain_scale: /pain\s*[:=]?\s*[0-9]|vasp?\s*[:=]?\s*\d+|pain scale\s*[:=]?\s*\d+/i,
  height: /\d+(\.\d+)?\s*cm|height\s*[:=]?\s*\d+/i,
  weight: /\d+(\.\d+)?\s*kg|weight\s*[:=]?\s*\d+/i,
  bmi: /bmi\s*[:=]?\s*[\d.]+|[\d.]+\s*kg\/m/i,
  waist_cm: /waist\s*[:=]?\s*[\d.]+|[\d.]+\s*cm\s*waist/i,
  head_cm: /head circumference\s*[:=]?\s*[\d.]+|ofc\s*[:=]?\s*[\d.]+/i,
  blood_sugar: /\d+\s*mg\/dl|glucose\s*[:=]?\s*\d+|blood sugar\s*[:=]?\s*\d+|fasting\s*[:=]?\s*\d+/i,
  hba1c: /hba1c\s*[:=]?\s*[\d.]+|a1c\s*[:=]?\s*[\d.]+|[\d.]+\s*%/i,
  ldl: /ldl\s*[:=]?\s*\d+|\d+\s*ldl/i,
  hdl: /hdl\s*[:=]?\s*\d+|\d+\s*hdl/i,
  cholesterol_total: /cholesterol\s*[:=]?\s*\d+|total\s*chol/i,
  triglycerides: /triglyceride\s*[:=]?\s*[\d.]+|tg\s*[:=]?\s*[\d.]+/i,
  tsh: /tsh\s*[:=]?\s*[\d.]+|thyroid\s*[:=]?\s*[\d.]+/i,
  active_med_dose: /dose\s*[:=]?\s*[\d.]+|insulin\s*[:=]?\s*\d+/i,
  ozempic_dose: /ozempic|semaglutide|dose\s*[:=]?\s*[\d.]+/i,
  creatinine: /creatinine\s*[:=]?\s*[\d.]+|creat\s*[:=]?\s*[\d.]+/i,
  egfr: /egfr\s*[:=]?\s*\d+|gfr\s*[:=]?\s*\d+/i,
  urine_output: /urine output\s*[:=]?\s*\d+|uop\s*[:=]?\s*\d+/i,
  hemoglobin: /hemoglobin\s*[:=]?\s*[\d.]+|hgb\s*[:=]?\s*[\d.]+|hb\s*[:=]?\s*[\d.]+/i,
  wbc: /wbc\s*[:=]?\s*[\d.]+|white blood\s*[:=]?\s*[\d.]+|leukocyte\s*[:=]?\s*[\d.]+/i,
  platelets: /platelet\s*[:=]?\s*\d+|plt\s*[:=]?\s*\d+/i,
  inr: /inr\s*[:=]?\s*[\d.]+|pt\/inr\s*[:=]?\s*[\d.]+/i,
  pefr: /pefr\s*[:=]?\s*[\d.]+|peak flow\s*[:=]?\s*[\d.]+/i,
  fev1_fvc: /fev1\/fvc|fev1_fvc\s*[:=]?\s*[\d.]+/i,
  gcs: /gcs\s*[:=]?\s*\d+|glasgow\s*[:=]?\s*\d+|coma scale\s*[:=]?\s*\d+/i,
  phq9: /phq-?9\s*[:=]?\s*\d+|phq9\s*[:=]?\s*\d+/i,
  gad7: /gad-?7\s*[:=]?\s*\d+|gad7\s*[:=]?\s*\d+/i,
  cognitive_score: /moca\s*[:=]?\s*\d+|mmse\s*[:=]?\s*\d+|cognitive score\s*[:=]?\s*\d+/i,
}
