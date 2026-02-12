import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

export interface RealtimeSubscriptionOptions {
  schema?: string
  table: string
  filter?: string
  event?: RealtimeEvent | '*'
  onMessage: (payload: any) => void
  onError?: (error: Error) => void
}

export interface RealtimeQueueEntry {
  id: string
  clinicId: string
  patientId: string
  checkInTime: string
  status: 'waiting' | 'called' | 'checked-in' | 'completed'
  position: number
  estimatedWaitTime: number
  notes?: string
}

export interface RealtimeCheckInEvent {
  type: 'joined' | 'called' | 'checked-in' | 'removed'
  entry: RealtimeQueueEntry
  timestamp: string
}

// Create a realtime subscription to database changes
export function subscribeToRealtimeChanges(
  options: RealtimeSubscriptionOptions
): RealtimeChannel | null {
  try {
    const supabase = createClient()

    const channel = supabase
      .channel(
        `${options.schema || 'public'}:${options.table}:${options.filter || 'all'}`
      )
      .on(
        'postgres_changes',
        {
          event: (options.event || '*') as any,
          schema: options.schema || 'public',
          table: options.table,
          filter: options.filter,
        },
        (payload) => {
          options.onMessage(payload)
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          const error = new Error('Failed to subscribe to realtime channel')
          options.onError?.(error)
        }
      })

    return channel
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Subscription failed')
    options.onError?.(err)
    return null
  }
}

// Subscribe to queue changes (appointments/queue table)
export function subscribeToQueueChanges(
  clinicId: string,
  onUpdate: (entries: RealtimeQueueEntry[]) => void,
  onError?: (error: Error) => void
): RealtimeChannel | null {
  return subscribeToRealtimeChanges({
    table: 'appointments',
    filter: `clinic_id=eq.${clinicId}`,
    event: '*',
    onMessage: (payload) => {
      console.log('[v0] Queue update received:', payload)
      onUpdate([payload.new])
    },
    onError,
  })
}

// Subscribe to check-in status changes
export function subscribeToCheckInStatus(
  clinicId: string,
  onStatusChange: (event: RealtimeCheckInEvent) => void,
  onError?: (error: Error) => void
): RealtimeChannel | null {
  return subscribeToRealtimeChanges({
    table: 'appointments',
    filter: `clinic_id=eq.${clinicId}`,
    event: 'UPDATE',
    onMessage: (payload) => {
      const event: RealtimeCheckInEvent = {
        type: 'checked-in',
        entry: payload.new,
        timestamp: new Date().toISOString(),
      }
      onStatusChange(event)
    },
    onError,
  })
}

// Unsubscribe from realtime channel
export async function unsubscribeFromRealtime(
  channel: RealtimeChannel | null
): Promise<void> {
  if (channel) {
    try {
      const supabase = createClient()
      await supabase.removeChannel(channel)
    } catch (error) {
      console.error('[v0] Failed to unsubscribe from realtime:', error)
    }
  }
}

// Subscribe to multiple tables
export function subscribeToMultipleTables(
  tables: { table: string; filter?: string; event?: RealtimeEvent }[],
  onMessage: (table: string, payload: any) => void,
  onError?: (error: Error) => void
): RealtimeChannel[] {
  const channels: RealtimeChannel[] = []

  tables.forEach(({ table, filter, event }) => {
    const channel = subscribeToRealtimeChanges({
      table,
      filter,
      event,
      onMessage: (payload) => onMessage(table, payload),
      onError,
    })

    if (channel) {
      channels.push(channel)
    }
  })

  return channels
}

// Unsubscribe from all channels
export async function unsubscribeFromAll(
  channels: RealtimeChannel[]
): Promise<void> {
  const supabase = createClient()

  for (const channel of channels) {
    try {
      await supabase.removeChannel(channel)
    } catch (error) {
      console.error('[v0] Failed to unsubscribe channel:', error)
    }
  }
}
