import { useState, useEffect } from "react"
import { listPayments, type ListPaymentsParams, type ListPaymentsResponse } from "@/api/payments.api"
import type { Payment } from "@/types/payment"

export function usePayments(params: ListPaymentsParams) {
  const [data, setData] = useState<ListPaymentsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchPayments() {
      setLoading(true)
      setError(null)

      try {
        const result = await listPayments(params)
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch payments"))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPayments()

    return () => {
      cancelled = true
    }
  }, [
    params.clinicId,
    params.from,
    params.to,
    params.query,
    params.page,
    params.pageSize,
    params.patientId,
  ])

  return {
    data,
    loading,
    error,
    refetch: () => {
      setLoading(true)
      setError(null)
      const promise = listPayments(params)
        .then((result) => {
          setData(result)
          return result
        })
        .catch((err) => {
          setError(err instanceof Error ? err : new Error("Failed to fetch payments"))
          throw err
        })
        .finally(() => setLoading(false))
      return promise
    },
  }
}
