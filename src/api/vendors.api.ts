/**
 * Vendors API - Smart autocomplete with fuzzy matching
 * Mock implementation, backend-replaceable
 */

import type { Vendor } from "@/types/vendor"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory store
const vendorsStore: Vendor[] = []

/**
 * Initialize mock vendors
 */
function initializeMockVendors() {
  if (vendorsStore.length > 0) return // Already initialized

  const mockVendors: Vendor[] = [
    {
      id: "vendor_001",
      clinicId: "clinic-001",
      name: "Memphis Medical Supplies",
      normalizedName: normalizeVendorName("Memphis Medical Supplies"),
      phone: "+20 2 2536 1200",
      createdAt: new Date().toISOString(),
    },
    {
      id: "vendor_002",
      clinicId: "clinic-001",
      name: "Delta Pharma",
      normalizedName: normalizeVendorName("Delta Pharma"),
      phone: "+20 2 2524 8800",
      createdAt: new Date().toISOString(),
    },
    {
      id: "vendor_003",
      clinicId: "clinic-001",
      name: "Cairo Electricity Company",
      normalizedName: normalizeVendorName("Cairo Electricity Company"),
      createdAt: new Date().toISOString(),
    },
    {
      id: "vendor_004",
      clinicId: "clinic-001",
      name: "Egyptian Gas Company",
      normalizedName: normalizeVendorName("Egyptian Gas Company"),
      phone: "0800 123 4567",
      createdAt: new Date().toISOString(),
    },
    {
      id: "vendor_005",
      clinicId: "clinic-001",
      name: "Nile Cleaning Services",
      normalizedName: normalizeVendorName("Nile Cleaning Services"),
      phone: "+20 100 123 4567",
      createdAt: new Date().toISOString(),
    },
    {
      id: "vendor_006",
      clinicId: "clinic-001",
      name: "Mokattam Properties",
      normalizedName: normalizeVendorName("Mokattam Properties"),
      createdAt: new Date().toISOString(),
    },
    {
      id: "vendor_007",
      clinicId: "clinic-001",
      name: "Alexandria Lab Supplies",
      normalizedName: normalizeVendorName("Alexandria Lab Supplies"),
      phone: "+20 3 487 2200",
      createdAt: new Date().toISOString(),
    },
    {
      id: "vendor_008",
      clinicId: "clinic-001",
      name: "Cairo Digital Marketing",
      normalizedName: normalizeVendorName("Cairo Digital Marketing"),
      createdAt: new Date().toISOString(),
    },
    {
      id: "vendor_009",
      clinicId: "clinic-001",
      name: "El Salam Medical",
      normalizedName: normalizeVendorName("El Salam Medical"),
      phone: "+20 2 2345 6789",
      createdAt: new Date().toISOString(),
    },
    {
      id: "vendor_010",
      clinicId: "clinic-001",
      name: "Telecom Egypt",
      normalizedName: normalizeVendorName("Telecom Egypt"),
      createdAt: new Date().toISOString(),
    },
  ]

  vendorsStore.push(...mockVendors)
}

// Initialize on module load
initializeMockVendors()

/**
 * Normalize vendor name for deduplication
 */
function normalizeVendorName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // Collapse spaces
    .replace(/[^\w\s]/g, "") // Remove punctuation
}

/**
 * Calculate string similarity (simple Levenshtein-based)
 * Returns value between 0 and 1
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

export interface ListVendorsParams {
  clinicId: string
  query?: string
}

export interface SuggestVendorsParams {
  clinicId: string
  input: string
}

/**
 * List vendors for a clinic
 */
export async function listVendors(params: ListVendorsParams): Promise<Vendor[]> {
  await delay(100)
  
  let filtered = vendorsStore.filter((v) => v.clinicId === params.clinicId)
  
  if (params.query) {
    const queryLower = params.query.toLowerCase()
    filtered = filtered.filter((v) => 
      v.name.toLowerCase().includes(queryLower) ||
      v.normalizedName.includes(queryLower)
    )
  }
  
  return filtered.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Suggest vendors based on input (substring match + fuzzy for ranking)
 * Returns up to 5 results: vendors whose name contains the input (case-insensitive), or first 5 when input is empty
 */
export async function suggestVendors(params: SuggestVendorsParams): Promise<Vendor[]> {
  await delay(150)

  const inputTrimmed = params.input.trim()
  const inputNormalized = normalizeVendorName(params.input)
  const clinicVendors = vendorsStore.filter((v) => v.clinicId === params.clinicId)

  if (!inputNormalized) {
    return clinicVendors.slice(0, 5)
  }

  // Substring match: include any vendor whose name or normalizedName contains the input
  const matching = clinicVendors.filter(
    (v) =>
      v.normalizedName.includes(inputNormalized) ||
      v.name.toLowerCase().includes(inputTrimmed.toLowerCase())
  )

  // Sort: prefix match first, then by position of match, then by name; take top 5
  const sorted = matching.sort((a, b) => {
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    const q = inputTrimmed.toLowerCase()
    const aStarts = aName.startsWith(q) ? 1 : 0
    const bStarts = bName.startsWith(q) ? 1 : 0
    if (bStarts !== aStarts) return bStarts - aStarts
    const aIdx = aName.indexOf(q)
    const bIdx = bName.indexOf(q)
    if (aIdx !== bIdx) return aIdx - bIdx
    return a.name.localeCompare(b.name)
  })

  return sorted.slice(0, 5)
}

/**
 * Create a new vendor (or return existing if normalized name matches)
 */
export async function createVendor(params: {
  clinicId: string
  name: string
  phone?: string
}): Promise<Vendor> {
  await delay(200)

  const normalizedName = normalizeVendorName(params.name)

  // Check if vendor with same normalized name already exists
  const existing = vendorsStore.find(
    (v) => v.clinicId === params.clinicId && v.normalizedName === normalizedName
  )

  if (existing) {
    return existing
  }

  // Create new vendor
  const newVendor: Vendor = {
    id: `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    clinicId: params.clinicId,
    name: params.name.trim(),
    normalizedName,
    phone: params.phone?.trim() || undefined,
    createdAt: new Date().toISOString(),
  }

  vendorsStore.push(newVendor)
  return newVendor
}
