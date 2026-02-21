"use client"

import { useState } from "react"
import Link from "next/link"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { getAppointmentTypeLabel } from "../appointmentTypes"
import { SearchInput } from "@/components/SearchInput"
import { EmptyState } from "@/components/EmptyState"
import { useWaitlist } from "../hooks/useWaitlist"
import { RiAddLine, RiPhoneLine, RiCalendarLine, RiUserLine, RiTimeLine } from "@remixicon/react"
import { format } from "date-fns"
import { ListSkeleton } from "@/components/skeletons"
import type { WaitlistEntry } from "../types"
import { Badge } from "@/components/Badge"

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
  onAddToWaitlist,
  t,
}: {
  entries: WaitlistEntry[]
  loading: boolean
  onBook: (entry: WaitlistEntry) => void
  onAddToWaitlist?: () => void
  t: ReturnType<typeof useAppTranslations>
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
      <EmptyState
        icon={RiUserLine}
        title={t.appointments.noWaitlist}
        description={t.appointments.waitlistDescription}
        actionLabel={onAddToWaitlist ? t.appointments.addToWaitlist : undefined}
        onAction={onAddToWaitlist}
      />
    )
  }

  return (
    <div className="relative">
      {/* Vertical Waitlist Line */}
      <div className="absolute left-[26px] top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-800 hidden sm:block" />

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="relative group"
          >
            {/* Timeline Dot */}
            <div className="absolute left-[21px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 hidden sm:block bg-amber-400 dark:border-gray-900 transition-colors" />

            <div className="ms-0 sm:ms-12 transition-all duration-300 rounded-[24px] border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between p-5 hover:ring-1 hover:ring-primary-50 dark:hover:ring-primary-900/20">
              <div className="flex items-center gap-5">
                {/* Added Metadata Section */}
                <div className="flex flex-col min-w-[75px]">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">
                    {format(new Date(entry.createdAt), "MMM d")}
                  </span>
                  <span className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wider">
                    {format(new Date(entry.createdAt), "p")}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-10 w-px bg-gray-100 dark:bg-gray-800 hidden md:block" />

                {/* Content Section */}
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
                    <RiUserLine className="size-5 text-primary-600 dark:text-primary-400" aria-hidden />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/patients/${entry.patientId}`}
                        className="text-sm font-bold text-gray-800 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400"
                      >
                        {entry.patientName}
                      </Link>
                      {entry.appointmentType && (
                        <Badge color="gray" size="xs" className="text-[10px] lowercase font-bold">
                          {getAppointmentTypeLabel(entry.appointmentType, t.appointments).toLowerCase()}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <div className="flex items-center gap-1.5">
                        <RiPhoneLine className="size-3.5 shrink-0" aria-hidden />
                        <span>{entry.patientPhone}</span>
                      </div>

                      {(entry.preferredTimeWindow && entry.preferredTimeWindow !== "any") || (entry.preferredDays && entry.preferredDays.length > 0) ? (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <div className="flex items-center gap-1.5">
                            <RiCalendarLine className="size-3.5 shrink-0" />
                            <span className="flex items-center gap-1 text-[11px]">
                              {entry.preferredTimeWindow && entry.preferredTimeWindow !== "any" && entry.preferredTimeWindow}
                              {entry.preferredDays && entry.preferredDays.length > 0 && (
                                <>
                                  {entry.preferredTimeWindow && entry.preferredTimeWindow !== "any" && " • "}
                                  {entry.preferredDays.join(", ")}
                                </>
                              )}
                            </span>
                          </div>
                        </>
                      ) : null}
                    </div>

                    {entry.notes && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 italic">
                        <RiTimeLine className="size-3.5 shrink-0" />
                        <span className="line-clamp-1 overflow-hidden text-ellipsis">&quot;{entry.notes}&quot;</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-3 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => onBook(entry)}
                  className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all shadow-sm active:scale-95"
                >
                  <RiCalendarLine className="size-4" />
                  {t.appointments.book}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WaitlistTab({ clinicId, doctorId, onBook, onAddToWaitlist }: WaitlistTabProps) {
  const t = useAppTranslations()
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <SearchInput
          placeholder={t.appointments.searchWaitlist}
          value={searchQuery}
          onSearchChange={setSearchQuery}
          className="flex-1 min-w-0"
        />
        {onAddToWaitlist && (
          <button
            type="button"
            onClick={onAddToWaitlist}
            className="btn-search-action"
          >
            <RiAddLine className="size-5 shrink-0" />
            <span>{t.appointments.addToWaitlist}</span>
          </button>
        )}
      </div>
      
      <WaitlistTable 
        entries={entries} 
        loading={loading} 
        onBook={handleBook}
        onAddToWaitlist={onAddToWaitlist}
        t={t}
      />
    </div>
  )
}
