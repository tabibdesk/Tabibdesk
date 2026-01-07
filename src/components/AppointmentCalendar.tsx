"use client"

import { useState, useMemo } from "react"
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import { Badge } from "@/components/Badge"

interface Appointment {
  id: string
  patient_name: string
  patient_phone: string
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled" | "confirmed" | "in_progress" | "no_show"
  type: string
}

interface AppointmentCalendarProps {
  appointments: Appointment[]
  onAppointmentClick?: (appointment: Appointment) => void
}

export function AppointmentCalendar({ appointments, onAppointmentClick }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  }, [currentDate])

  const monthEnd = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  }, [currentDate])

  const startDate = useMemo(() => {
    const start = new Date(monthStart)
    start.setDate(start.getDate() - start.getDay())
    return start
  }, [monthStart])

  const endDate = useMemo(() => {
    const end = new Date(monthEnd)
    end.setDate(end.getDate() + (6 - end.getDay()))
    return end
  }, [monthEnd])

  const calendarDays = useMemo(() => {
    const days: Date[] = []
    const current = new Date(startDate)
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [startDate, endDate])

  const getAppointmentsForDay = (day: Date) => {
    const dayString = day.toISOString().split("T")[0]
    return appointments.filter((apt) => apt.date === dayString)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const isToday = (day: Date) => {
    const today = new Date()
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-secondary-600 dark:bg-secondary-500"
      case "scheduled":
        return "bg-primary-600 dark:bg-primary-500"
      case "completed":
        return "bg-green-600 dark:bg-green-500"
      case "cancelled":
        return "bg-red-600 dark:bg-red-500"
      case "in_progress":
        return "bg-yellow-600 dark:bg-yellow-500"
      case "no_show":
        return "bg-gray-600 dark:bg-gray-500"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="flex size-8 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RiArrowLeftSLine className="size-5" />
          </button>
          <button
            onClick={nextMonth}
            className="flex size-8 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RiArrowRightSLine className="size-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Names */}
        <div className="mb-2 grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDay(day)
            return (
              <div
                key={index}
                className={`min-h-[100px] rounded-lg border p-2 transition ${
                  isCurrentMonth(day)
                    ? "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                    : "border-gray-100 bg-gray-50 dark:border-gray-800/50 dark:bg-gray-900/50"
                } ${isToday(day) ? "ring-2 ring-primary-600 dark:ring-primary-500" : ""}`}
              >
                <div
                  className={`mb-2 text-sm ${
                    isToday(day)
                      ? "font-bold text-primary-600 dark:text-primary-400"
                      : isCurrentMonth(day)
                      ? "font-medium text-gray-900 dark:text-gray-50"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id}
                      className={`cursor-pointer rounded px-1.5 py-1 text-[10px] font-medium leading-tight text-white transition hover:opacity-80 ${getStatusColor(
                        apt.status
                      )}`}
                      title={`${apt.time} - ${apt.patient_name}`}
                      onClick={() => onAppointmentClick?.(apt)}
                    >
                      <div className="truncate">{apt.time}</div>
                      <div className="truncate">{apt.patient_name}</div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-[10px] text-gray-600 dark:text-gray-400">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-primary-600 dark:bg-primary-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-secondary-600 dark:bg-secondary-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-green-600 dark:bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-yellow-600 dark:bg-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-red-600 dark:bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  )
}

