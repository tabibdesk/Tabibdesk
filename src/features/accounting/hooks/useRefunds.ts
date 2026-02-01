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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/14d1a666-454e-4d19-a0b7-b746072205fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useRefunds.ts:refetch',message:'refetch called',data:{...refetchParams,dateToIncludingToday},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5',runId:'post-fix'})}).catch(()=>{});
      // #endregion
      const promise = listRefunds(refetchParams)
      promise
        .then((result) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/14d1a666-454e-4d19-a0b7-b746072205fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useRefunds.ts:refetch.then',message:'setData with result',data:{refundsCount:result?.refunds?.length,total:result?.total},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
          // #endregion
          setData(result)
        })
        .catch((err) => setError(err instanceof Error ? err : new Error("Failed to fetch refunds")))
        .finally(() => setLoading(false))
      return promise
    },
  }
}
