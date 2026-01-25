import { useState, useEffect, useCallback } from "react"
import { list as listWaitlist } from "../waitlist/waitingList.api"
import { useDebounce } from "@/lib/useDebounce"
import type { WaitlistEntry } from "../types"

interface UseWaitlistParams {
  clinicId: string
  status?: WaitlistEntry["status"]
  priority?: WaitlistEntry["priority"]
  type?: WaitlistEntry["appointmentType"]
  timeWindow?: WaitlistEntry["preferredTimeWindow"]
  query?: string
  page?: number
  pageSize?: number
}

export function useWaitlist(params: UseWaitlistParams) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  
  const debouncedQuery = useDebounce(params.query || "", 250)
  
  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await listWaitlist({
        clinicId: params.clinicId,
        status: params.status,
        priority: params.priority,
        type: params.type,
        preferredTimeWindow: params.timeWindow,
        query: debouncedQuery || undefined,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
      })
      setEntries(response.entries)
      setTotal(response.total)
      setHasMore(response.hasMore)
    } catch (error) {
      console.error("Failed to fetch waitlist:", error)
    } finally {
      setLoading(false)
    }
  }, [
    params.clinicId,
    params.status,
    params.priority,
    params.type,
    params.timeWindow,
    debouncedQuery,
    params.page,
    params.pageSize,
  ])
  
  useEffect(() => {
    fetch()
  }, [fetch])
  
  return { entries, loading, total, hasMore, refetch: fetch }
}
