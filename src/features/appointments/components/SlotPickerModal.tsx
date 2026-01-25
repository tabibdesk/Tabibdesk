"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import { getAppointmentSettings } from "@/api/settings.api"
import { listDoctorSchedules } from "../availability.api"
import { generateSlotsFromAvailability } from "../utils/slotGeneration"
import { formatSlotDate, formatSlotTime } from "../utils/slotFormatters"
import type { Slot } from "../types"
import type { WaitlistEntry } from "../types"

interface SlotPickerModalProps {
  open: boolean
  onClose: () => void
  waitlistEntry: WaitlistEntry
  clinicId: string
  doctorId?: string
  onBookNow: (slot: Slot) => void
  onOffer: (slot: Slot) => void
}

export function SlotPickerModal({
  open,
  onClose,
  waitlistEntry,
  clinicId,
  doctorId,
  onBookNow,
  onOffer,
}: SlotPickerModalProps) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  
  useEffect(() => {
    if (!open) return
    
    const fetchSlots = async () => {
      setLoading(true)
      try {
        // Get settings for booking range
        const settings = await getAppointmentSettings(clinicId)
        const bookingRangeDays = settings.bookingRangeDays || 14
        
        // Fetch availability
        const availability = await listDoctorSchedules({
          doctorId: doctorId || "",
          clinicId,
        })
        
        // Generate empty slots for next 7-14 days
        const allSlots: Slot[] = []
        const today = new Date()
        
        for (let i = 1; i <= bookingRangeDays; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() + i)
          
          const daySlots = generateSlotsFromAvailability(
            availability,
            date,
            settings.bufferMinutes,
            settings.slotDurationMinutes
          )
          
          // Filter to only empty slots
          const emptySlots = daySlots.filter((slot) => slot.state === "empty")
          allSlots.push(...emptySlots)
        }
        
        setSlots(allSlots)
      } catch (error) {
        console.error("Failed to fetch slots:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSlots()
  }, [open, clinicId, doctorId])
  
  const handleBookNow = (slot: Slot) => {
    onBookNow(slot)
    onClose()
  }
  
  const handleOffer = (slot: Slot) => {
    onOffer(slot)
    onClose()
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Slot</DialogTitle>
          <DialogDescription>
            <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {waitlistEntry.patientName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {waitlistEntry.patientPhone}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto size-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 dark:border-gray-800 dark:border-t-primary-400"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading available slots...</p>
            </div>
          </div>
        ) : slots.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">No available slots found</p>
          </div>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                  selectedSlot?.id === slot.id
                    ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20"
                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900"
                }`}
                onClick={() => setSelectedSlot(slot)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {formatSlotDate(slot.startAt)}
                    </span>
                    <Badge variant="neutral">Empty</Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatSlotTime(slot.startAt)} - {formatSlotTime(slot.endAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOffer(slot)
                    }}
                  >
                    Offer
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookNow(slot)
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
