"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import { Button } from "@/components/Button"
import { Label } from "@/components/Label"
import { Textarea } from "@/components/Textarea"
import { useToast } from "@/hooks/useToast"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { create } from "./waitingList.api"
import { DEMO_CLINIC_ID } from "@/data/mock/mock-data"
import { PatientSelector, type Patient } from "@/components/shared/PatientSelector"
import { cx } from "@/lib/utils"

export function AddToWaitlistModal({
  open,
  onClose,
  preselectedPatient,
}: AddToWaitlistModalProps) {
  const { showToast } = useToast()
  const { currentUser } = useUserClinic()
  const clinicId = currentUser.clinicId || DEMO_CLINIC_ID

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    preselectedPatient
      ? {
          id: preselectedPatient.id,
          first_name: preselectedPatient.name.split(" ")[0] || "",
          last_name: preselectedPatient.name.split(" ").slice(1).join(" ") || "",
          phone: "",
          email: null,
        }
      : null
  )

  const [formData, setFormData] = useState({
    appointmentType: "" as "new" | "followup" | "online" | "",
    preferredTimeWindow: "any" as "any" | "morning" | "afternoon" | "evening",
    preferredDays: [] as string[],
    preferredTiming: "anytime" as "anytime" | "tomorrow" | "this_week" | "next_week" | "within_2_weeks",
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedPatient(
        preselectedPatient
          ? {
              id: preselectedPatient.id,
              first_name: preselectedPatient.name.split(" ")[0] || "",
              last_name: preselectedPatient.name.split(" ").slice(1).join(" ") || "",
              phone: "",
              email: null,
            }
          : null
      )
      setFormData({
        appointmentType: "",
        preferredTimeWindow: "any",
        preferredDays: [],
        preferredTiming: "anytime",
        notes: "",
      })
    }
  }, [open, preselectedPatient])

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day],
    }))
  }

  // Convert human-friendly timing to date range
  const getDateRangeFromTiming = (timing: string): { earliestDate?: string; latestDate?: string } => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    switch (timing) {
      case "tomorrow": {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return {
          earliestDate: tomorrow.toISOString().split("T")[0],
          latestDate: tomorrow.toISOString().split("T")[0],
        }
      }
      case "this_week": {
        const weekStart = new Date(today)
        const dayOfWeek = weekStart.getDay()
        weekStart.setDate(weekStart.getDate() - dayOfWeek) // Sunday
        
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6) // Saturday
        
        return {
          earliestDate: weekStart.toISOString().split("T")[0],
          latestDate: weekEnd.toISOString().split("T")[0],
        }
      }
      case "next_week": {
        const nextWeekStart = new Date(today)
        const dayOfWeek = nextWeekStart.getDay()
        nextWeekStart.setDate(nextWeekStart.getDate() - dayOfWeek + 7) // Next Sunday
        
        const nextWeekEnd = new Date(nextWeekStart)
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 6) // Next Saturday
        
        return {
          earliestDate: nextWeekStart.toISOString().split("T")[0],
          latestDate: nextWeekEnd.toISOString().split("T")[0],
        }
      }
      case "within_2_weeks": {
        const twoWeeksLater = new Date(today)
        twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)
        
        return {
          earliestDate: today.toISOString().split("T")[0],
          latestDate: twoWeeksLater.toISOString().split("T")[0],
        }
      }
      default:
        return {}
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatient) {
      showToast("Please select a patient", "error")
      return
    }

    setIsSubmitting(true)
    try {
      const dateRange = getDateRangeFromTiming(formData.preferredTiming)
      
      await create({
        clinicId,
        patientId: selectedPatient.id,
        appointmentType: formData.appointmentType || undefined,
        preferredTimeWindow: formData.preferredTimeWindow,
        preferredDays: formData.preferredDays.length > 0 ? formData.preferredDays : undefined,
        earliestDate: dateRange.earliestDate,
        latestDate: dateRange.latestDate,
        priority: "normal", // Default to normal, removed from UI
        notes: formData.notes || undefined,
      })

      showToast("Patient added to waiting list", "success")
      onClose()
    } catch (error) {
      console.error("Failed to add to waiting list:", error)
      showToast("Failed to add patient to waiting list", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cx("max-h-[90vh] overflow-y-auto", "max-sm:w-full max-sm:max-w-full")}>
        <DialogHeader>
          <DialogTitle>Add to Waiting List</DialogTitle>
          <DialogDescription>
            Add a patient to the waiting list for earlier appointment slots.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <PatientSelector
            initialPatient={selectedPatient}
            onPatientSelect={setSelectedPatient}
            showEmail={false}
            required={true}
          />

          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="appointment-type">Appointment Type</Label>
            <select
              id="appointment-type"
              value={formData.appointmentType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  appointmentType: e.target.value as "new" | "followup" | "online" | "",
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50"
            >
              <option value="">Any</option>
              <option value="new">New Patient</option>
              <option value="followup">Follow-up</option>
              <option value="online">Online</option>
            </select>
          </div>

          {/* Preferred Time Window */}
          <div className="space-y-2">
            <Label>Preferred Time Window</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["any", "morning", "afternoon", "evening"] as const).map((window) => (
                <label
                  key={window}
                  className={cx(
                    "flex cursor-pointer items-center justify-center rounded-lg border-2 p-2 text-sm transition",
                    formData.preferredTimeWindow === window
                      ? "border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-900/20 dark:text-primary-400"
                      : "border-gray-200 hover:border-primary-300 dark:border-gray-800"
                  )}
                >
                  <input
                    type="radio"
                    name="time-window"
                    value={window}
                    checked={formData.preferredTimeWindow === window}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, preferredTimeWindow: window }))
                    }
                    className="sr-only"
                  />
                  <span className="capitalize">{window}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Days */}
          <div className="space-y-2">
            <Label>Preferred Days (Optional)</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {daysOfWeek.map((day) => (
                <label
                  key={day.value}
                  className={cx(
                    "flex cursor-pointer items-center justify-center rounded-lg border-2 p-2 text-sm transition",
                    formData.preferredDays.includes(day.value)
                      ? "border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-900/20 dark:text-primary-400"
                      : "border-gray-200 hover:border-primary-300 dark:border-gray-800"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={formData.preferredDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    className="sr-only"
                  />
                  <span>{day.label.slice(0, 3)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Timing */}
          <div className="space-y-2">
            <Label htmlFor="preferred-timing">When would you like the appointment?</Label>
            <select
              id="preferred-timing"
              value={formData.preferredTiming}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  preferredTiming: e.target.value as "anytime" | "tomorrow" | "this_week" | "next_week" | "within_2_weeks",
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50"
            >
              <option value="anytime">Anytime</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this_week">This Week</option>
              <option value="next_week">Next Week</option>
              <option value="within_2_weeks">Within 2 Weeks</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="primary" disabled={isSubmitting || !selectedPatient}>
              {isSubmitting ? "Adding..." : "Add to Waiting List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
