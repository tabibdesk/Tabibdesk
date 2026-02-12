/**
 * Appointment type registry: store by ID in DB, display translated name in UI.
 * All appointment types used in the app should be registered here.
 */

export type AppointmentTypeId =
  | "consultation"
  | "followup"
  | "checkup"
  | "procedure"
  | "new"
  | "online"
  | "flexible"

/** Translation keys for each appointment type (in appointments namespace) */
export const APPOINTMENT_TYPE_TRANSLATION_KEYS: Record<AppointmentTypeId, string> = {
  consultation: "typeConsultation",
  followup: "typeFollowup",
  checkup: "typeCheckup",
  procedure: "typeProcedure",
  new: "typeNew",
  online: "typeOnline",
  flexible: "typeFlexible",
}

/** Maps display names (legacy data) to canonical type IDs */
const NAME_TO_ID: Record<string, AppointmentTypeId> = {
  consultation: "consultation",
  "general consultation": "consultation",
  followup: "followup",
  "follow-up": "followup",
  "follow up": "followup",
  checkup: "checkup",
  "check-up": "checkup",
  "comprehensive check-up": "checkup",
  procedure: "procedure",
  "procedure consultation": "procedure",
  new: "new",
  online: "online",
  flexible: "flexible",
}

/**
 * Normalize a type value (name or id) to canonical type ID for storage.
 * Use this when saving to DB.
 */
export function toAppointmentTypeId(value: string | number | undefined): AppointmentTypeId | null {
  if (value == null || value === "") return null
  const key = String(value).toLowerCase().trim()
  if (key in APPOINTMENT_TYPE_TRANSLATION_KEYS) {
    return key as AppointmentTypeId
  }
  if (key in NAME_TO_ID) return NAME_TO_ID[key]
  // Map legacy numeric ids
  if (value === 1 || value === "1") return "consultation"
  if (value === 2 || value === "2") return "followup"
  if (value === 3 || value === "3") return "checkup"
  if (value === 4 || value === "4") return "procedure"
  return null
}

/**
 * Get type ID for storage. Returns the value as-is if it's already a valid id,
 * otherwise tries to normalize. Falls back to lowercase value for unknown types.
 */
export function getAppointmentTypeIdForStorage(value: string | number | undefined): string {
  const normalized = toAppointmentTypeId(value)
  if (normalized) return normalized
  return value != null && value !== "" ? String(value).toLowerCase() : "consultation"
}

/** Type for the appointments translation object with type labels */
export type AppointmentTypeTranslations = {
  typeConsultation: string
  typeFollowup: string
  typeCheckup: string
  typeProcedure: string
  typeNew: string
  typeOnline: string
  typeFlexible: string
}

/**
 * Get translated label for appointment type. Use when displaying in UI.
 * Pass the type_id from DB and the appointments translations.
 */
export function getAppointmentTypeLabel(
  typeId: string | undefined,
  t: AppointmentTypeTranslations
): string {
  if (!typeId || typeId === "") return ""
  const key = typeId.toLowerCase() as AppointmentTypeId
  const transKey = APPOINTMENT_TYPE_TRANSLATION_KEYS[key]
  if (transKey && transKey in t) return t[transKey as keyof AppointmentTypeTranslations]
  return typeId
}
