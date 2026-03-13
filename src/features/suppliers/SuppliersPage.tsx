"use client"

import { useState, useEffect } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useDebounce } from "@/lib/useDebounce"
import { PageHeader } from "@/components/shared/PageHeader"
import { SearchInput } from "@/components/SearchInput"
import { EmptyState } from "@/components/EmptyState"
import { listSuppliers } from "@/api/suppliers.api"
import type { Supplier, SupplierSpecialty } from "./suppliers.types"
import { SuppliersCard } from "./components/SuppliersCard"
import { SuppliersFilterChips } from "./components/SuppliersFilterChips"
import { RiShoppingBagLine } from "@remixicon/react"

export function SuppliersPage() {
  const t = useAppTranslations()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSpecialty, setActiveSpecialty] = useState<SupplierSpecialty | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listSuppliers({ specialty: activeSpecialty, query: debouncedSearch })
      .then((data) => {
        if (!cancelled) setSuppliers(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeSpecialty, debouncedSearch])

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={t.suppliers.title}
        description={t.suppliers.description}
      />

      <div className="space-y-4">
        <SearchInput
          placeholder={t.suppliers.searchPlaceholder}
          value={searchQuery}
          onSearchChange={setSearchQuery}
          className="w-full"
        />
        <SuppliersFilterChips
          activeSpecialty={activeSpecialty}
          onSpecialtyChange={setActiveSpecialty}
        />

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
              />
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <EmptyState
            icon={RiShoppingBagLine}
            title={t.suppliers.noSuppliers}
            description={t.suppliers.emptyDescription}
            variant="dashed"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <SuppliersCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
