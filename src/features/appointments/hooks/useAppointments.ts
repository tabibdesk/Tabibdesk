import { useState, useEffect, useCallback } from "react"
import { listAppointments } from "../appointments.api"
import type { Appointment } from "../types"

interface UseAppointmentsParams {
  clinicId: string
  doctorId?: string
  dateRange?: { start: string; end: string }
  status?: string
  query?: string
  page?: number
  pageSize?: number
}

export function useAppointments(params: UseAppointmentsParams) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  
  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Transform the response to match Appointment type
      const response = await listAppointments({
        clinicId: params.clinicId,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        query: params.query,
        status: params.status as any,
        timeFilter: params.dateRange ? "all" : undefined,
      })
      
      // Transform AppointmentListItem to Appointment
      const transformed: Appointment[] = response.appointments.map((apt) => {
        const startAt = new Date(`${apt.appointment_date}T${apt.appointment_time}:00`).toISOString()
        const endAt = new Date(new Date(startAt).getTime() + apt.duration_minutes * 60 * 1000).toISOString()
        
        return {
          id: apt.id,
          patientId: apt.patient_id,
          patientName: apt.patient_name,
          patientPhone: apt.patient_phone,
          doctorId: "", // Will need to be added from mock data
          clinicId: params.clinicId,
          startAt,
          endAt,
          durationMinutes: apt.duration_minutes,
          status: apt.status,
          type: apt.type,
          notes: apt.notes || undefined,
          createdAt: apt.created_at,
        }
      })
      
      setAppointments(transformed)
      setTotal(response.total)
      setHasMore(response.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch appointments"))
    } finally {
      setLoading(false)
    }
  }, [
    params.clinicId,
    params.doctorId,
    params.dateRange?.start,
    params.dateRange?.end,
    params.status,
    params.query,
    params.page,
    params.pageSize,
  ])
  
  useEffect(() => {
    fetch()
  }, [fetch])
  
  return { appointments, loading, error, total, hasMore, refetch: fetch }
}
