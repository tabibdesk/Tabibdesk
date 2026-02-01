/**
 * Pricing API - Doctor pricing per clinic per appointment type
 * Mock implementation, backend-replaceable
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory stores
const clinicAppointmentTypesStore: Record<string, string[]> = {}
const doctorPricingStore: Record<string, Record<string, number>> = {} // key: `${clinicId}:${doctorId}`

/**
 * Initialize mock pricing data.
 * Uses type IDs (lowercase) for storage consistency.
 */
function initializeMockPricing() {
  // Set appointment types for clinic-001 (type IDs)
  clinicAppointmentTypesStore["clinic-001"] = [
    "consultation",
    "followup",
    "checkup",
    "procedure",
  ]

  // Set pricing for user-001 (Dr. Ahmed Hassan) at clinic-001
  doctorPricingStore["clinic-001:user-001"] = {
    consultation: 500,
    followup: 300,
    checkup: 400,
    procedure: 600,
  }

  // Set pricing for user-002 (Dr. Fatima Ali) at clinic-001
  doctorPricingStore["clinic-001:user-002"] = {
    consultation: 500,
    followup: 300,
    checkup: 400,
    procedure: 600,
  }
}

// Initialize on module load
initializeMockPricing()

/**
 * Get appointment types for a clinic
 */
export async function getClinicAppointmentTypes(clinicId: string): Promise<string[]> {
  await delay(100)
  
  if (!clinicAppointmentTypesStore[clinicId]) {
    // Default appointment types (type IDs)
    clinicAppointmentTypesStore[clinicId] = [
      "consultation",
      "followup",
      "checkup",
      "procedure",
    ]
  }
  
  return [...clinicAppointmentTypesStore[clinicId]]
}

/**
 * Set appointment types for a clinic
 */
export async function setClinicAppointmentTypes(
  clinicId: string,
  types: string[]
): Promise<string[]> {
  await delay(200)
  
  clinicAppointmentTypesStore[clinicId] = [...types]
  return [...types]
}

/**
 * Get doctor pricing for a clinic
 * Returns map: { [appointmentType]: amount }
 */
export async function getDoctorPricing(params: {
  clinicId: string
  doctorId: string
}): Promise<Record<string, number>> {
  await delay(100)
  
  const key = `${params.clinicId}:${params.doctorId}`
  
  if (!doctorPricingStore[key]) {
    // Return empty object if no pricing set
    return {}
  }
  
  return { ...doctorPricingStore[key] }
}

/**
 * Set doctor pricing for a clinic
 */
export async function setDoctorPricing(params: {
  clinicId: string
  doctorId: string
  pricingByType: Record<string, number>
}): Promise<Record<string, number>> {
  await delay(200)
  
  const key = `${params.clinicId}:${params.doctorId}`
  doctorPricingStore[key] = { ...params.pricingByType }
  
  return { ...doctorPricingStore[key] }
}

/**
 * Normalize appointment type for pricing lookup (supports both ids and legacy names)
 */
function normalizeTypeForPricing(type: string): string {
  const lower = type.toLowerCase()
  const map: Record<string, string> = {
    consultation: "consultation",
    "follow-up": "followup",
    followup: "followup",
    "check-up": "checkup",
    checkup: "checkup",
    procedure: "procedure",
  }
  return map[lower] ?? lower
}

/**
 * Get price for a specific appointment type
 * Returns null if pricing not set
 */
export async function getPriceForAppointmentType(params: {
  clinicId: string
  doctorId: string
  appointmentType: string
}): Promise<number | null> {
  const pricing = await getDoctorPricing({
    clinicId: params.clinicId,
    doctorId: params.doctorId,
  })
  const typeKey = normalizeTypeForPricing(params.appointmentType)
  return pricing[typeKey] ?? pricing[params.appointmentType] ?? null
}
