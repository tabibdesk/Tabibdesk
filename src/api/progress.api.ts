/**
 * Progress API — simulates AI-detection of progress metrics.
 * Returns key-value pairs (metric id → date/value points) ready for charting.
 * Aggregates from weight logs, lab results (numeric for mock), injections, and note-extracted points.
 */

import type { ProgressMetric, ProgressPoint, ProgressResponse } from "@/types/progress"
import { mockData } from "@/data/mock/mock-data"

/** Parse numeric value from lab result string (mock only). "128/82" → 128, "195" → 195. */
function parseLabNumeric(value: string): number | null {
  const trimmed = value.trim()
  if (/^\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed)
  const parts = trimmed.split("/")
  if (parts.length >= 1 && /^\d+$/.test(parts[0].trim())) return parseFloat(parts[0].trim())
  return null
}

/** Parse dose number from string like "0.5mg" (mock only). */
function parseDoseNumeric(dose: string): number | null {
  const match = dose.match(/^([\d.]+)\s*mg/i)
  return match ? parseFloat(match[1]) : null
}

/** Map lab test_name to progress metric id. */
function labTestToMetricId(testName: string): string {
  const lower = testName.toLowerCase()
  if (lower.includes("blood pressure")) return "bp"
  if (lower.includes("bmi") || lower.includes("body mass index")) return "bmi"
  if (lower.includes("hba1c") || lower.includes("a1c")) return "hba1c"
  if (lower.includes("ldl")) return "ldl"
  if (lower.includes("hdl")) return "hdl"
  if (lower.includes("cholesterol") && lower.includes("total")) return "cholesterol_total"
  if (lower.includes("triglyceride")) return "triglycerides"
  if (lower.includes("tsh")) return "tsh"
  if (lower.includes("creatinine") || lower.includes("creat")) return "creatinine"
  if (lower.includes("egfr") || lower.includes("gfr")) return "egfr"
  if (lower.includes("hemoglobin") || lower.includes("hgb") || lower.includes(" hb ")) return "hemoglobin"
  if (lower.includes("wbc") || lower.includes("white blood") || lower.includes("leukocyte")) return "wbc"
  if (lower.includes("platelet") || lower.includes(" plt ")) return "platelets"
  if (lower.includes("inr") || lower.includes("pt/inr")) return "inr"
  if (lower.includes("blood sugar") || lower.includes("glucose") || lower.includes("fasting")) return "blood_sugar"
  if (lower.includes("peak flow") || lower.includes("pefr")) return "pefr"
  if (lower.includes("fev1") && lower.includes("fvc")) return "fev1_fvc"
  if (lower.includes("pulse") || lower.includes("heart rate")) return "pulse"
  if (lower.includes("spo2") || lower.includes("oxygen") || lower.includes("saturation")) return "oxygen"
  if (lower.includes("temp") || lower.includes("temperature")) return "temp"
  if (lower.includes("respiratory") || lower.includes("resp rate")) return "respiratory_rate"
  if (lower.includes("height")) return "height"
  if (lower.includes("weight")) return "weight"
  if (lower.includes("waist")) return "waist_cm"
  if (lower.includes("head circumference") || lower.includes("ofc")) return "head_cm"
  return testName.replace(/\s+/g, "_").toLowerCase().replace(/[^a-z0-9_]/g, "")
}

/** Get display label for lab-based metric. */
function labTestToLabel(testName: string): string {
  const lower = testName.toLowerCase()
  if (lower.includes("blood pressure")) return "Blood Pressure"
  if (lower.includes("creatinine")) return "Serum Creatinine"
  if (lower.includes("egfr") || lower.includes("gfr")) return "eGFR"
  if (lower.includes("hemoglobin") || lower.includes("hgb")) return "Hemoglobin"
  if (lower.includes("inr")) return "INR"
  if (lower.includes("peak flow") || lower.includes("pefr")) return "Peak Flow (PEFR)"
  return testName
}

/**
 * Get progress metrics for a patient (simulated — as if AI-detection API were available).
 */
export async function getProgressByPatientId(patientId: string): Promise<ProgressResponse> {
  await new Promise((r) => setTimeout(r, 80))

  const metrics: ProgressMetric[] = []

  // 1. Weight from weight logs
  const weightLogs = mockData.weightLogs.filter((w) => w.patient_id === patientId)
  if (weightLogs.length >= 2) {
    const points: ProgressPoint[] = [...weightLogs]
      .sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime())
      .map((log) => ({ date: log.recorded_date, value: log.weight, sourceId: log.id }))
    metrics.push({
      id: "weight",
      label: "Weight",
      unit: "kg",
      source: "weight",
      points,
    })
  }

  // 2. Lab results — one metric per test with numeric values (mock parsing)
  const labResults = mockData.labResults.filter((r) => r.patient_id === patientId)
  const labByTest = new Map<string, { date: string; value: number; id: string }[]>()
  for (const lab of labResults) {
    const num = parseLabNumeric(lab.value)
    if (num == null) continue
    const id = labTestToMetricId(lab.test_name)
    if (!labByTest.has(id)) labByTest.set(id, [])
    labByTest.get(id)!.push({ date: lab.test_date, value: num, id: lab.id })
  }
  for (const [id, pts] of labByTest) {
    if (pts.length >= 2) {
      const sorted = [...pts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const firstLab = labResults.find((r) => r.id === pts[0].id)
      const label = firstLab ? labTestToLabel(firstLab.test_name) : id
      const unit = firstLab?.unit ?? ""
      metrics.push({
        id,
        label,
        unit,
        source: "lab",
        points: sorted.map((p) => ({ date: p.date, value: p.value, sourceId: p.id })),
      })
    }
  }

  // 3. Medication dosage from injections (e.g. Ozempic dose over time)
  const injections = mockData.injections.filter((i) => i.patient_id === patientId)
  const injByMed = new Map<string, { date: string; value: number }[]>()
  for (const inj of injections) {
    const num = parseDoseNumeric(inj.dose)
    if (num == null) continue
    const key = inj.medication_name.toLowerCase().includes("ozempic") ? "ozempic_dose" : inj.medication_name
    if (!injByMed.has(key)) injByMed.set(key, [])
    injByMed.get(key)!.push({ date: inj.injection_date, value: num })
  }
  for (const [key, pts] of injByMed) {
    if (pts.length >= 2) {
      const sorted = [...pts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const label = key === "ozempic_dose" ? "Ozempic dose" : key
      metrics.push({
        id: key === "ozempic_dose" ? "ozempic_dose" : key.replace(/\s+/g, "_").toLowerCase(),
        label,
        unit: "mg",
        source: "medication",
        points: sorted.map((p) => ({ date: p.date, value: p.value })),
      })
    }
  }

  // 4. Note-extracted (mock): synthetic HbA1c from note "HbA1c improved from 7.8% to 6.8%"
  const notes = mockData.doctorNotes.filter((n) => n.patient_id === patientId)
  const hba1cNote = notes.find((n) => n.note.includes("HbA1c") && n.note.includes("7.8") && n.note.includes("6.8"))
  if (hba1cNote && !metrics.some((m) => m.id === "hba1c")) {
    const created = new Date(hba1cNote.created_at)
    const points: ProgressPoint[] = [
      { date: new Date(created.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], value: 7.8, sourceId: hba1cNote.id },
      { date: created.toISOString().split("T")[0], value: 6.8, sourceId: hba1cNote.id },
    ]
    metrics.push({
      id: "hba1c_note",
      label: "HbA1c (from notes)",
      unit: "%",
      source: "note",
      points,
    })
  }

  return { metrics }
}
