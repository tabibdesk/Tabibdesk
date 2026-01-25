"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Badge } from "@/components/Badge"
import { useWaitlist } from "../hooks/useWaitlist"
import { AddToWaitlistModal } from "../waitlist/AddToWaitlistModal"
import { SlotPickerModal } from "./SlotPickerModal"
import { createAppointmentFromWaitlist } from "../appointments.api"
import { remove as removeWaitlistEntry } from "../waitlist/waitingList.api"
import { RiAddLine, RiUserLine, RiPhoneLine, RiCalendarLine } from "@remixicon/react"
import { cx } from "@/lib/utils"
import type { WaitlistEntry } from "../types"
import type { Slot } from "../types"

interface WaitlistTabProps {
  clinicId: string
  doctorId?: string
}

function WaitlistTable({
  entries,
  loading,
  onOfferSlot,
}: {
  entries: WaitlistEntry[]
  loading: boolean
  onOfferSlot: (entry: WaitlistEntry) => void
}) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 dark:border-gray-800 dark:border-t-primary-400"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading waitlist...</p>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm text-gray-500 dark:text-gray-400">No patients in waiting list</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={cx(
            "group relative flex items-center justify-between p-3 transition-colors bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 shadow-sm"
          )}
        >
          {/* Status Accent Line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-blue-500" />
          
          <div className="flex items-center gap-3 flex-1 min-w-0 ml-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/patients/${entry.patientId}`}
                  className="text-sm font-semibold text-gray-900 hover:text-primary-600 dark:text-gray-50 dark:hover:text-primary-400"
                >
                  {entry.patientName}
                </Link>
                {entry.appointmentType && (
                  <Badge variant="default" className="text-xs">
                    {entry.appointmentType}
                  </Badge>
                )}
              </div>
              
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <RiPhoneLine className="size-3" />
                  {entry.patientPhone}
                </div>
                {entry.preferredTimeWindow && entry.preferredTimeWindow !== "any" && (
                  <div className="flex items-center gap-1">
                    <RiCalendarLine className="size-3" />
                    Prefers: {entry.preferredTimeWindow}
                  </div>
                )}
                {entry.preferredDays && entry.preferredDays.length > 0 && (
                  <span>Days: {entry.preferredDays.join(", ")}</span>
                )}
              </div>
              
              {entry.notes && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {entry.notes}
                </p>
              )}
            </div>
            
            <Button variant="primary" size="sm" onClick={() => onOfferSlot(entry)}>
              Book
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function WaitlistTab({ clinicId, doctorId }: WaitlistTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null)
  const [showSlotPicker, setShowSlotPicker] = useState(false)
  
  const { entries, loading, refetch } = useWaitlist({
    clinicId,
    status: "active", // Always show only active entries
    query: searchQuery,
  })
  
  const handleOfferSlot = (entry: WaitlistEntry) => {
    setSelectedEntry(entry)
    setShowSlotPicker(true)
  }
  
  const handleBookNow = async (slot: Slot) => {
    if (!selectedEntry) return
    
    try {
      // Create appointment
      await createAppointmentFromWaitlist({
        waitlistEntry: selectedEntry,
        slot,
        clinicId,
        doctorId,
      })
      
      // Remove waitlist entry (it becomes an appointment)
      await removeWaitlistEntry(selectedEntry.id)
      
      // Refresh waitlist
      await refetch?.()
      
      // Close modal
      setShowSlotPicker(false)
      setSelectedEntry(null)
    } catch (error) {
      console.error("Failed to book appointment:", error)
    }
  }
  
  const handleOffer = async (slot: Slot) => {
    // Same as Book Now - create appointment and remove from waitlist
    await handleBookNow(slot)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <RiAddLine className="mr-2 size-4" />
          Add to Waitlist
        </Button>
      </div>
      
      <WaitlistTable entries={entries} loading={loading} onOfferSlot={handleOfferSlot} />
      
      <AddToWaitlistModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      
      {selectedEntry && (
        <SlotPickerModal
          open={showSlotPicker}
          onClose={() => {
            setShowSlotPicker(false)
            setSelectedEntry(null)
          }}
          waitlistEntry={selectedEntry}
          clinicId={clinicId}
          doctorId={doctorId}
          onBookNow={handleBookNow}
          onOffer={handleOffer}
        />
      )}
    </div>
  )
}
