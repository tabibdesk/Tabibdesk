"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/Button"
import { Label } from "@/components/Label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import {
  RiCalendarLine,
  RiTimeLine,
  RiUserLine,
  RiStethoscopeLine,
} from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"

interface Appointment {
  id: string
  patient_id: string
  patient_name: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  status: string
  type: string
}

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (appointmentId: string, newDate: string, newTime: string) => void
  appointment: Appointment | null
  isLoading?: boolean
}

interface AvailableDate {
  date: string
}

interface TimeSlot {
  starts_at: string
  ends_at: string
}

export function RescheduleModal({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  isLoading = false,
}: RescheduleModalProps) {
  const { isDemoMode } = useDemo()
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingDates, setLoadingDates] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    if (isOpen && appointment) {
      loadAvailableDates()
      setSelectedDate(appointment.appointment_date)
      setSelectedTime(appointment.appointment_time)
    }
  }, [isOpen, appointment])

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots()
    }
  }, [selectedDate])

  const loadAvailableDates = async () => {
    setLoadingDates(true)
    try {
      if (isDemoMode) {
        // Generate next 14 weekdays
        const dates: AvailableDate[] = []
        const today = new Date()
        let daysAdded = 0
        let currentDate = new Date(today)

        while (daysAdded < 14) {
          currentDate.setDate(currentDate.getDate() + 1)
          const dayOfWeek = currentDate.getDay()
          
          // Skip weekends (0 = Sunday, 6 = Saturday)
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            dates.push({
              date: currentDate.toISOString().split('T')[0]
            })
            daysAdded++
          }
        }
        
        setAvailableDates(dates)
      } else {
        // TODO: Fetch from API
      }
    } catch (error) {
      console.error('Failed to load dates:', error)
    } finally {
      setLoadingDates(false)
    }
  }

  const loadTimeSlots = async () => {
    setLoadingSlots(true)
    try {
      if (isDemoMode) {
        // Generate time slots from 9 AM to 5 PM (30-minute intervals)
        const slots: TimeSlot[] = []
        const baseDate = new Date(selectedDate)
        
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const slotDate = new Date(baseDate)
            slotDate.setHours(hour, minute, 0, 0)
            
            const endDate = new Date(slotDate)
            endDate.setMinutes(endDate.getMinutes() + 30)
            
            slots.push({
              starts_at: slotDate.toISOString(),
              ends_at: endDate.toISOString()
            })
          }
        }
        
        setAvailableSlots(slots)
      } else {
        // TODO: Fetch from API
      }
    } catch (error) {
      console.error('Failed to load time slots:', error)
    } finally {
      setLoadingSlots(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleConfirm = () => {
    if (appointment && selectedDate && selectedTime) {
      onConfirm(appointment.id, selectedDate, selectedTime)
    }
  }

  const canConfirm = selectedDate && selectedTime && 
    (selectedDate !== appointment?.appointment_date || selectedTime !== appointment?.appointment_time)

  if (!appointment) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for this appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Appointment Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
              Current Appointment
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <RiUserLine className="size-4" />
                <span>{appointment.patient_name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <RiStethoscopeLine className="size-4" />
                <span>{appointment.type}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <RiCalendarLine className="size-4" />
                <span>{formatDate(appointment.appointment_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <RiTimeLine className="size-4" />
                <span>{appointment.appointment_time}</span>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <Label htmlFor="date">Select New Date</Label>
            <div className="mt-2 grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-gray-200 p-2 dark:border-gray-800 sm:grid-cols-3">
              {loadingDates ? (
                <div className="col-span-full py-8 text-center text-sm text-gray-500">
                  Loading dates...
                </div>
              ) : (
                availableDates.map((date) => (
                  <button
                    key={date.date}
                    onClick={() => setSelectedDate(date.date)}
                    className={`rounded-lg border p-3 text-left text-sm transition ${
                      selectedDate === date.date
                        ? "border-primary-600 bg-primary-50 text-primary-900 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-50"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="font-medium">
                      {new Date(date.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <Label htmlFor="time">Select New Time</Label>
              <div className="mt-2 grid max-h-48 grid-cols-3 gap-2 overflow-y-auto rounded-lg border border-gray-200 p-2 dark:border-gray-800 sm:grid-cols-4">
                {loadingSlots ? (
                  <div className="col-span-full py-8 text-center text-sm text-gray-500">
                    Loading time slots...
                  </div>
                ) : (
                  availableSlots.map((slot) => {
                    const time = new Date(slot.starts_at).toTimeString().slice(0, 5)
                    return (
                      <button
                        key={slot.starts_at}
                        onClick={() => setSelectedTime(time)}
                        className={`rounded-lg border p-2 text-center text-sm transition ${
                          selectedTime === time
                            ? "border-primary-600 bg-primary-50 text-primary-900 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-50"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                        }`}
                      >
                        {formatTime(slot.starts_at)}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
          >
            {isLoading ? "Rescheduling..." : "Confirm Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

