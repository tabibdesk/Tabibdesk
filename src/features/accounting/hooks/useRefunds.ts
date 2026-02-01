import { useState, useEffect } from "react"
import type { ListRefundsParams, ListRefundsResponse } from "@/features/accounting/accounting.types"
import { listRefunds } from "@/api/accounting.api"

export function useRefunds(params: ListRefundsParams) {
  const [data, setData] = useState<ListRefundsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchRefunds() {
      setLoading(true)
      setError(null)
      const todayStr = new Date().toISOString().split("T")[0]
      const dateToIncludingToday =
        params.dateTo && params.dateTo < todayStr ? todayStr : params.dateTo
      const effectParams = {
        clinicId: params.clinicId,
        dateFrom: params.dateFrom,
        dateTo: dateToIncludingToday ?? params.dateTo,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      }
      try {
        const result = await listRefunds(effectParams)
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch refunds"))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchRefunds()

    return () => {
      cancelled = true
    }
  }, [
    params.clinicId,
    params.dateFrom,
    params.dateTo,
    params.page,
    params.pageSize,
  ])

  return {
    data,
    loading,
    error,
    refetch: () => {
      setLoading(true)
      setError(null)
      const todayStr = new Date().toISOString().split("T")[0]
      const dateToIncludingToday =
        params.dateTo && params.dateTo < todayStr ? todayStr : params.dateTo
      const refetchParams = {
        clinicId: params.clinicId,
        dateFrom: params.dateFrom,
        dateTo: dateToIncludingToday ?? params.dateTo,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      }
      const promise = listRefunds(refetchParams)
      promise
        .then((result) => {
          setData(result)
        })
        .catch((err) => setError(err instanceof Error ? err : new Error("Failed to fetch refunds")))
        .finally(() => setLoading(false))
      return promise
    },
  }
}
