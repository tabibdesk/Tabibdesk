/**
 * Visit Progress — clinical note checklist items shown in the Note tab.
 * Configurable in Settings > Patient tab as a list of keys (like appointment types).
 */

export interface VisitProgressChecklistItem {
  id: string
  label: string
  regex: RegExp
}

/** Catalog of preset checklist items (id, label, regex for auto-detection). */
export const VISIT_PROGRESS_CHECKLIST_CATALOG: VisitProgressChecklistItem[] = [
  { id: "history", label: "History", regex: /history|medical history|past history|hx|تاريخ/i },
  { id: "current_meds", label: "Current Meds", regex: /current med|medication|medications|meds|prescription|treatment|دواء|أدوية/i },
  { id: "conditions", label: "Conditions", regex: /condition|diagnos|disease|chronic|comorbid|حالة|تشخيص/i },
]

/** Default checklist ids when not configured. */
export const DEFAULT_CHECKLIST_IDS = VISIT_PROGRESS_CHECKLIST_CATALOG.map((c) => c.id)

/** Preset ids available to add (catalog). */
export const CHECKLIST_PRESET_IDS = [...DEFAULT_CHECKLIST_IDS]

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Build regex for a custom checklist key (matches key as word/phrase). */
function regexForCustomKey(id: string): RegExp {
  const pattern = id
    .split("_")
    .map(escapeRegex)
    .join("[\\s_-]*")
  return new RegExp(pattern, "i")
}

/** Get display label for a checklist key (catalog label or formatted id). */
export function formatChecklistDisplayLabel(id: string): string {
  const catalog = VISIT_PROGRESS_CHECKLIST_CATALOG.find((c) => c.id === id)
  if (catalog) return catalog.label
  return id
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

/** Return checklist items for the note widget from a list of keys. Empty array = no items. */
export function getChecklistItemsForNote(ids: string[]): VisitProgressChecklistItem[] {
  const effective = ids
  const byId = new Map(VISIT_PROGRESS_CHECKLIST_CATALOG.map((c) => [c.id, c]))
  return effective.map((id) => {
    const catalog = byId.get(id)
    if (catalog) return catalog
    return {
      id,
      label: formatChecklistDisplayLabel(id),
      regex: regexForCustomKey(id),
    }
  })
}

/** Normalize custom checklist key (like appointment types). */
export function normalizeChecklistId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w\u0600-\u06FF_-]/g, "")
}
