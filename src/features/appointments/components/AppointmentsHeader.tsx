"use client"

import { useEffect, useState, useMemo } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { Skeleton } from "@/components/Skeleton"
import { Select } from "@/components/Select"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { listDoctorsByClinic } from "../availability.api"
import { DEMO_DOCTOR_ID } from "@/lib/constants"

/** Doctor dropdown for page header (top right), used in Appointments page like Insights time-range dropdown */
export interface DoctorSelectorProps {
  clinicId: string
  selectedDoctorId: string
  onDoctorChange: (doctorId: string) => void
  className?: string
}

export function DoctorSelector({
  clinicId,
  selectedDoctorId,
  onDoctorChange,
  className,
}: DoctorSelectorProps) {
  const { currentUser, allUsers } = useUserClinic()
  const [doctorsAtClinic, setDoctorsAtClinic] = useState<string[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true)
      try {
        const doctorIds = await listDoctorsByClinic(clinicId)
        setDoctorsAtClinic(doctorIds)
      } catch (error) {
        console.error("Failed to fetch doctors for clinic:", error)
        setDoctorsAtClinic([])
      } finally {
        setLoadingDoctors(false)
      }
    }
    if (clinicId) fetchDoctors()
  }, [clinicId])

  const availableDoctors = useMemo(() => {
    return allUsers.filter(
      (user) => user.role === "doctor" && doctorsAtClinic.includes(user.id)
    )
  }, [allUsers, doctorsAtClinic])

  useEffect(() => {
    if (!loadingDoctors && availableDoctors.length > 0) {
      const isSelectedDoctorAvailable = availableDoctors.some(
        (doc) => doc.id === selectedDoctorId
      )
      if (!isSelectedDoctorAvailable) {
        if (currentUser.role === "doctor" && doctorsAtClinic.includes(currentUser.id)) {
          onDoctorChange(currentUser.id)
        } else {
          onDoctorChange(availableDoctors[0].id)
        }
      }
    }
  }, [clinicId, availableDoctors, selectedDoctorId, loadingDoctors, currentUser, doctorsAtClinic, onDoctorChange])

  const show = currentUser.role !== "doctor" || availableDoctors.length > 1
  if (!show) return null

  if (loadingDoctors) {
    return <Skeleton className={className ?? "h-9 w-40 sm:w-48"} />
  }
  if (availableDoctors.length === 0) {
    return <span className={className ?? "text-sm text-gray-500 dark:text-gray-400"}>No doctors</span>
  }

  return (
    <Select
      id="doctor-select"
      value={selectedDoctorId || availableDoctors[0]?.id || DEMO_DOCTOR_ID}
      onChange={(e) => onDoctorChange(e.target.value)}
      className={className ?? "w-40 sm:w-48"}
    >
      {availableDoctors.map((doctor) => (
        <option key={doctor.id} value={doctor.id}>
          {doctor.full_name} {doctor.specialization ? `– ${doctor.specialization}` : ""}
        </option>
      ))}
    </Select>
  )
}

interface AppointmentsHeaderProps {
  activeTab: "appointments" | "waitlist"
  onTabChange: (tab: "appointments" | "waitlist") => void
}

export function AppointmentsHeader({
  activeTab,
  onTabChange,
}: AppointmentsHeaderProps) {
  const t = useAppTranslations()
  return (
    <div className="!mt-0 space-y-3">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-4 overflow-x-auto pb-px sm:gap-8" aria-label="Appointments tabs">
          <button
            onClick={() => onTabChange("appointments")}
            className={`shrink-0 border-b-2 px-1 py-3 sm:py-4 text-sm font-medium transition-colors ${
              activeTab === "appointments"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t.appointments.title}
          </button>
          <button
            onClick={() => onTabChange("waitlist")}
            className={`shrink-0 border-b-2 px-1 py-3 sm:py-4 text-sm font-medium transition-colors ${
              activeTab === "waitlist"
                ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t.appointments.waitlist}
          </button>
        </nav>
      </div>
    </div>
  )
}
