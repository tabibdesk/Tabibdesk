/**
 * Suppliers API - Mock implementation, backend-replaceable
 * When backend is ready, replace the implementation with fetch/Supabase calls.
 */

import type { Supplier } from "@/features/suppliers/suppliers.types"
import type { ListSuppliersParams } from "@/features/suppliers/suppliers.types"
import { MOCK_SUPPLIERS } from "@/features/suppliers/suppliers.data"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function listSuppliers(params: ListSuppliersParams): Promise<Supplier[]> {
  await delay(100)

  let filtered = [...MOCK_SUPPLIERS]

  if (params.specialty) {
    filtered = filtered.filter((s) => s.specialty === params.specialty)
  }

  if (params.query?.trim()) {
    const q = params.query.trim().toLowerCase()
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.specialty.toLowerCase().includes(q) ||
        s.supplies.toLowerCase().includes(q)
    )
  }

  return filtered.sort((a, b) => a.name.localeCompare(b.name))
}
