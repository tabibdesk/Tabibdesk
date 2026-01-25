import { useState, useEffect, useMemo } from "react"
import { getAppointmentSettings } from "@/api/settings.api"
import { listDoctorSchedules } from "../availability.api"
import { listByDay } from "../appointments.api"
import { generateSlotsFromAvailability, mergeAppointmentsIntoSlots } from "../utils/slotGeneration"
import type { Slot } from "../types"

interface UseDailySlotsParams {
  clinicId: string
  doctorId: string
  date: Date
}

export function useDailySlots(params: UseDailySlotsParams) {
  const [settings, setSettings] = useState<{ bufferMinutes: number; slotDurationMinutes: number } | null>(null)
  const [availability, setAvailability] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [loadingAvailability, setLoadingAvailability] = useState(true)
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const loading = loadingSettings || loadingAvailability || loadingAppointments
  
  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingSettings(true)
      try {
        const apptSettings = await getAppointmentSettings(params.clinicId)
        setSettings({
          bufferMinutes: apptSettings.bufferMinutes,
          slotDurationMinutes: apptSettings.slotDurationMinutes,
        })
      } catch (err) {
        console.error("Failed to fetch appointment settings:", err)
        // Use defaults
        setSettings({ bufferMinutes: 5, slotDurationMinutes: 30 })
      } finally {
        setLoadingSettings(false)
      }
    }
    fetchSettings()
  }, [params.clinicId])
  
  // Fetch availability
  useEffect(() => {
    const fetch = async () => {
      setLoadingAvailability(true)
      try {
        const data = await listDoctorSchedules({
          doctorId: params.doctorId,
          clinicId: params.clinicId,
        })
        setAvailability(data)
        if (data.length === 0) {
          console.warn(`No availability found for doctor ${params.doctorId} in clinic ${params.clinicId}`)
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch availability"))
      } finally {
        setLoadingAvailability(false)
      }
    }
    fetch()
  }, [params.doctorId, params.clinicId])
  
  // Fetch appointments for the day
  const fetchAppointments = async () => {
    setLoadingAppointments(true)
    try {
      const dateStr = params.date.toISOString().split("T")[0]
      const data = await listByDay({
        clinicId: params.clinicId,
        doctorId: params.doctorId,
        date: dateStr,
      })
      setAppointments(data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch appointments:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch appointments"))
    } finally {
      setLoadingAppointments(false)
    }
  }
  
  useEffect(() => {
    fetchAppointments()
  }, [params.clinicId, params.doctorId, params.date])
  
  // Generate slots
  const slots = useMemo(() => {
    if (!settings || loading || !availability.length) return []
    
    const generatedSlots = generateSlotsFromAvailability(
      availability,
      params.date,
      settings.bufferMinutes,
      settings.slotDurationMinutes
    )
    
    return mergeAppointmentsIntoSlots(generatedSlots, appointments)
  }, [availability, appointments, params.date, settings, loading])
  
  return { slots, loading, error, refetch: fetchAppointments }
}
