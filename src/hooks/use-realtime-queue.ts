import { useEffect, useState, useCallback, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import {
  subscribeToRealtimeChanges,
  unsubscribeFromRealtime,
  RealtimeEvent,
  RealtimeCheckInEvent,
} from '@/lib/realtime'

interface UseRealtimeQueueOptions {
  clinicId: string
  table: string
  filter?: string
  event?: RealtimeEvent | '*'
  onError?: (error: Error) => void
}

interface QueueUpdate {
  id: string
  status: 'waiting' | 'called' | 'checked-in' | 'completed'
  position?: number
  estimatedWaitTime?: number
  timestamp: string
}

export function useRealtimeQueue(options: UseRealtimeQueueOptions) {
  const [updates, setUpdates] = useState<QueueUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channel = subscribeToRealtimeChanges({
      table: options.table,
      filter: options.filter || `clinic_id=eq.${options.clinicId}`,
      event: options.event || '*',
      onMessage: (payload) => {
        console.log('[v0] Queue update:', payload)
        const update: QueueUpdate = {
          id: payload.new?.id || payload.old?.id,
          status: payload.new?.status || 'waiting',
          position: payload.new?.position,
          estimatedWaitTime: payload.new?.estimated_wait_time,
          timestamp: new Date().toISOString(),
        }
        setUpdates((prev) => [...prev, update])
      },
      onError: (err) => {
        setError(err)
        options.onError?.(err)
      },
    })

    channelRef.current = channel
    setIsConnected(!!channel)

    return () => {
      if (channelRef.current) {
        unsubscribeFromRealtime(channelRef.current).catch(console.error)
      }
    }
  }, [options.clinicId, options.table, options.filter, options.event, options])

  const clearUpdates = useCallback(() => {
    setUpdates([])
  }, [])

  return {
    updates,
    isConnected,
    error,
    clearUpdates,
  }
}

// Hook for real-time check-in events
export function useRealtimeCheckIn(clinicId: string) {
  const [checkInEvents, setCheckInEvents] = useState<RealtimeCheckInEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channel = subscribeToRealtimeChanges({
      table: 'appointments',
      filter: `clinic_id=eq.${clinicId}`,
      event: 'UPDATE',
      onMessage: (payload) => {
        const event: RealtimeCheckInEvent = {
          type: 'checked-in',
          entry: payload.new,
          timestamp: new Date().toISOString(),
        }
        setCheckInEvents((prev) => [...prev, event])

        // Auto-clear old events after 10 seconds
        setTimeout(() => {
          setCheckInEvents((prev) =>
            prev.filter((e) => {
              const age = Date.now() - new Date(e.timestamp).getTime()
              return age < 10000
            })
          )
        }, 10000)
      },
    })

    channelRef.current = channel
    setIsConnected(!!channel)

    return () => {
      if (channelRef.current) {
        unsubscribeFromRealtime(channelRef.current).catch(console.error)
      }
    }
  }, [clinicId])

  const clearEvents = useCallback(() => {
    setCheckInEvents([])
  }, [])

  return {
    checkInEvents,
    isConnected,
    clearEvents,
  }
}

// Hook for real-time appointment status
export function useRealtimeAppointments(clinicId: string) {
  const [appointments, setAppointments] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channel = subscribeToRealtimeChanges({
      table: 'appointments',
      filter: `clinic_id=eq.${clinicId}`,
      event: '*',
      onMessage: (payload) => {
        console.log('[v0] Appointment update:', payload)

        setAppointments((prev) => {
          const updated = [...prev]
          const index = updated.findIndex((a) => a.id === payload.new?.id || a.id === payload.old?.id)

          if (payload.eventType === 'DELETE') {
            return updated.filter((a) => a.id !== payload.old?.id)
          } else if (index >= 0) {
            updated[index] = payload.new
          } else {
            updated.push(payload.new)
          }

          return updated
        })

        setLastUpdate(new Date())
      },
    })

    channelRef.current = channel
    setIsConnected(!!channel)

    return () => {
      if (channelRef.current) {
        unsubscribeFromRealtime(channelRef.current).catch(console.error)
      }
    }
  }, [clinicId])

  return {
    appointments,
    isConnected,
    lastUpdate,
  }
}
