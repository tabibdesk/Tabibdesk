"use client"

import { useState, useEffect } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useToast } from "@/hooks/useToast"
import { getPatientBalances } from "@/api/accounting.api"
import type { PatientBalance } from "../accounting.types"
import { formatCurrency } from "../accounting.utils"
import { ListSkeleton } from "@/components/skeletons"
// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function BalancesTab() {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [balances, setBalances] = useState<PatientBalance[]>([])
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await getPatientBalances({
        clinicId: currentClinic.id,
        query: debouncedQuery,
        page: 1,
        pageSize: 50,
      })
      setBalances(response.balances)
    } catch (error) {
      console.error("Failed to load balances:", error)
      showToast("Failed to load balances", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentClinic.id, debouncedQuery])

  return (
    <div className="space-y-6">
      {/* Search */}
      <Input
        placeholder={t.accounting.searchBalances}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Loading */}
      {loading && (
        <Card className="p-6">
          <ListSkeleton rows={6} />
        </Card>
      )}

      {/* Results */}
      {!loading && balances.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No patient balances found</p>
        </Card>
      )}

      {!loading && balances.length > 0 && (
        <div className="space-y-3">
          {balances.map((balance) => (
            <Card key={balance.patientId} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-50">
                    {balance.patientName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {balance.phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-amber-600 dark:text-amber-400">
                    {formatCurrency(balance.totalDue)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
