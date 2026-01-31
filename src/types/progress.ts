/**
 * Progress API types — key-value pairs ready for charting.
 * Each metric has an id/label and an array of date/value points.
 */

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
  { id: "oxygen", label: "Oxygen", unit: "SpO2 %", category: "basic" },
  { id: "temp", label: "Temp", unit: "C", category: "basic" },
  { id: "bp", label: "Blood Pressure", unit: "mm Hg", category: "basic" },
  { id: "blood_sugar", label: "Blood Sugar", unit: "mg/dL", category: "basic" },
  { id: "weight", label: "Weight", unit: "kg", category: "basic" },
  { id: "bmi", label: "BMI", unit: "kg/m²", category: "basic" },
  { id: "pregnancy", label: "Pregnancy", unit: "status", category: "basic" },
  { id: "smoking", label: "Smoking", unit: "status", category: "basic" },
  // Specialty
  { id: "hba1c", label: "HbA1c", unit: "%", category: "specialty" },
  { id: "ldl", label: "LDL", unit: "mg/dL", category: "specialty" },
  { id: "cholesterol_total", label: "Cholesterol (total)", unit: "mg/dL", category: "specialty" },
  { id: "ozempic_dose", label: "Ozempic dose", unit: "mg", category: "specialty" },
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
