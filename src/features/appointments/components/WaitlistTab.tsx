"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/Button"
import { SearchInput } from "@/components/SearchInput"
import { useWaitlist } from "../hooks/useWaitlist"
import { RiAddLine, RiPhoneLine, RiCalendarLine, RiUserLine } from "@remixicon/react"
import { ListSkeleton } from "@/components/skeletons"
import type { WaitlistEntry } from "../types"

interface WaitlistTabProps {
  clinicId: string
  doctorId?: string
  onBook?: (entry: WaitlistEntry) => void
  onAddToWaitlist?: () => void
}

function WaitlistTable({
  entries,
  loading,
  onBook,
}: {
  entries: WaitlistEntry[]
  loading: boolean
  onBook: (entry: WaitlistEntry) => void
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800 dark:bg-gray-950">
        <ListSkeleton rows={6} />
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
          className="card-surface flex items-center gap-4 px-5 py-4"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <RiUserLine className="size-5 text-gray-500 dark:text-gray-400" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/patients/${entry.patientId}`}
                className="font-medium text-gray-900 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400"
              >
                {entry.patientName}
              </Link>
              {entry.appointmentType && (
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {entry.appointmentType}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <RiPhoneLine className="size-4 shrink-0" aria-hidden />
              <span>{entry.patientPhone}</span>
            </div>
            {(entry.preferredTimeWindow && entry.preferredTimeWindow !== "any") || (entry.preferredDays && entry.preferredDays.length > 0) ? (
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                {entry.preferredTimeWindow && entry.preferredTimeWindow !== "any" && (
                  <span className="flex items-center gap-1">
                    <RiCalendarLine className="size-3 shrink-0" />
                    Prefers: {entry.preferredTimeWindow}
                  </span>
                )}
                {entry.preferredDays && entry.preferredDays.length > 0 && (
                  <>
                    {entry.preferredTimeWindow && entry.preferredTimeWindow !== "any" && <span className="text-gray-300 dark:text-gray-600">·</span>}
                    <span>Days: {entry.preferredDays.join(", ")}</span>
                  </>
                )}
              </div>
            ) : null}
            {entry.notes && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <span className="line-clamp-1 overflow-hidden text-ellipsis italic">&quot;{entry.notes}&quot;</span>
              </div>
            )}
          </div>
          <div className="shrink-0">
            <Button variant="primary" size="sm" onClick={() => onBook(entry)} className="btn-card-action">
              Book
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function WaitlistTab({ clinicId, doctorId, onBook, onAddToWaitlist }: WaitlistTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const { entries, loading } = useWaitlist({
    clinicId,
    status: "active", // Always show only active entries
    query: searchQuery,
  })
  
  const handleBook = (entry: WaitlistEntry) => {
    if (onBook) {
      onBook(entry)
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
        <SearchInput
          placeholder="Search by name or phone..."
          value={searchQuery}
          onSearchChange={setSearchQuery}
          className="flex-1 min-w-0"
        />
        {onAddToWaitlist && (
          <Button
            onClick={onAddToWaitlist}
            variant="secondary"
            className="shrink-0"
          >
            <RiAddLine className="mr-2 size-4" />
            Add to Waitlist
          </Button>
        )}
      </div>
      
      <WaitlistTable 
        entries={entries} 
        loading={loading} 
        onBook={handleBook} 
      />
    </div>
  )
}
