import { useEffect, useState, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { subscribeToRealtimeChanges, unsubscribeFromRealtime } from '@/lib/realtime'
import { createClient } from '@/lib/supabase/client'

export interface TodayAppointment {
  id: string
  patientId: string
  patientName: string
  clinicId: string
  appointmentTime: string
  duration: number
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled'
  doctorId?: string
  doctorName?: string
  reason?: string
  notes?: string
}

interface UseTodayAppointmentsOptions {
  clinicId: string
  date?: string // YYYY-MM-DD, defaults to today
  onError?: (error: Error) => void
}

export function useTodayAppointments(options: UseTodayAppointmentsOptions) {
  const [appointments, setAppointments] = useState<TodayAppointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const date = options.date || new Date().toISOString().split('T')[0]

  // Initial fetch
  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()

        // Fetch appointments for today
        const startOfDay = `${date}T00:00:00`
        const endOfDay = `${date}T23:59:59`

        const { data, error: fetchError } = await supabase
          .from('appointments')
          .select(
            `
            id,
            patient_id,
            patients (first_name, last_name),
            clinic_id,
            appointment_time,
            duration,
            status,
            doctor_id,
            reason,
            notes
          `
          )
          .eq('clinic_id', options.clinicId)
          .gte('appointment_time', startOfDay)
          .lte('appointment_time', endOfDay)
          .order('appointment_time', { ascending: true })

        if (fetchError) throw fetchError

        const formattedAppointments: TodayAppointment[] = (data || []).map(
          (apt: any) => ({
            id: apt.id,
            patientId: apt.patient_id,
            patientName: `${apt.patients?.first_name} ${apt.patients?.last_name}`,
            clinicId: apt.clinic_id,
            appointmentTime: apt.appointment_time,
            duration: apt.duration,
            status: apt.status,
            doctorId: apt.doctor_id,
            reason: apt.reason,
            notes: apt.notes,
          })
        )

        setAppointments(formattedAppointments)
        setLastUpdate(new Date())
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch appointments')
        setError(error)
        options.onError?.(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTodayAppointments()
  }, [options.clinicId, date, options])

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = subscribeToRealtimeChanges({
      table: 'appointments',
      filter: `clinic_id=eq.${options.clinicId}`,
      event: '*',
      onMessage: (payload) => {
        console.log('[v0] Today appointment update:', payload)

        // Check if update is for today
        const appointmentDate = new Date(
          payload.new?.appointment_time || payload.old?.appointment_time
        )
          .toISOString()
          .split('T')[0]

        if (appointmentDate === date) {
          setAppointments((prev) => {
            if (payload.eventType === 'DELETE') {
              return prev.filter((a) => a.id !== payload.old?.id)
            }

            const updated = [...prev]
            const index = updated.findIndex(
              (a) => a.id === payload.new?.id || a.id === payload.old?.id
            )

            if (payload.new) {
              const newApt: TodayAppointment = {
                id: payload.new.id,
                patientId: payload.new.patient_id,
                patientName: payload.new.patient_name || '',
                clinicId: payload.new.clinic_id,
                appointmentTime: payload.new.appointment_time,
                duration: payload.new.duration,
                status: payload.new.status,
                doctorId: payload.new.doctor_id,
                reason: payload.new.reason,
                notes: payload.new.notes,
              }

              if (index >= 0) {
                updated[index] = newApt
              } else {
                updated.push(newApt)
              }
            } else if (index >= 0) {
              updated.splice(index, 1)
            }

            // Sort by appointment time
            updated.sort(
              (a, b) =>
                new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()
            )

            return updated
          })

          setLastUpdate(new Date())
        }
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
  }, [options.clinicId, date, options])

  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: TodayAppointment['status']
  ) => {
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)

      if (updateError) throw updateError

      // Local update for immediate feedback
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update appointment')
      setError(error)
      options.onError?.(error)
    }
  }

  return {
    appointments,
    isLoading,
    isConnected,
    error,
    lastUpdate,
    updateAppointmentStatus,
    // Computed properties
    checkedInCount: appointments.filter((a) => a.status === 'checked-in').length,
    inProgressCount: appointments.filter((a) => a.status === 'in-progress').length,
    completedCount: appointments.filter((a) => a.status === 'completed').length,
    upcomingCount: appointments.filter((a) => a.status === 'scheduled').length,
  }
}
