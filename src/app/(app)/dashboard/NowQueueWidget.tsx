"use client"

import Link from "next/link"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { getBadgeColor } from "@/lib/badgeColors"
import { WidgetSkeleton } from "@/components/skeletons"
import { RiArrowRightLine, RiCalendarLine, RiCheckLine, RiUserLine } from "@remixicon/react"
import type { DashboardAppointment } from "./dashboard.types"
import { getTimeDisplay, getIconColorClass, getIconBackgroundClass } from "./useQueueActions"

interface NowQueueWidgetProps {
  loading: boolean
  appointments: DashboardAppointment[]
  onMarkDone: (appointmentId: string) => void
}

export function NowQueueWidget({ loading, appointments, onMarkDone }: NowQueueWidgetProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Now Queue</h2>
        </div>
        <WidgetSkeleton rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Now Queue</h2>
        <Link href="/appointments">
          <Button variant="ghost" className="text-[11px] font-bold tracking-wider -mr-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50">
            view all
            <RiArrowRightLine className="ml-1 size-3.5" />
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((apt, index) => {
              const isNow = index === 0
              const isNext = index === 1
              const badgeVariant = isNow ? "success" : isNext ? "default" : "neutral"
              const badgeText = isNow ? "now" : isNext ? "next" : null

              return (
                <Link
                  key={apt.id}
                  href={`/patients/${apt.patient_id}`}
                  className="widget-row cursor-pointer"
                >
                  <div className="widget-content-stack">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onMarkDone(apt.id)
                      }}
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-all group/done ${getIconBackgroundClass(index)} hover:bg-green-500 hover:text-white dark:hover:bg-green-600 cursor-pointer`}
                      title="Mark as Done"
                    >
                      <div className="group-hover/done:hidden">
                        <RiUserLine className={`size-5 ${getIconColorClass(index)}`} />
                      </div>
                      <div className="hidden group-hover/done:block">
                        <RiCheckLine className="size-6" />
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {apt.patientName}
                        </p>
                        {(isNow || isNext) ? (
                          <Badge color={getBadgeColor(badgeVariant)} size="xs">
                            {badgeText}
                          </Badge>
                        ) : (
                          <span className="shrink-0 text-[10px] font-bold tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded-sm lowercase">
                            {getTimeDisplay(apt.scheduled_at)}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate lowercase font-medium">
                          {apt.type}
                        </p>
                      </div>
                    </div>
                  </div>

                  {apt.online_call_link ? (
                    <div className="flex items-center gap-1.5 ml-4 shrink-0">
                      <Button
                        type="button"
                        variant="primary"
                        className="btn-primary-widget shadow-sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open(apt.online_call_link, "_blank")
                        }}
                      >
                        join call
                      </Button>
                    </div>
                  ) : null}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-600 dark:text-gray-400">
            <RiCalendarLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-2 text-sm">No appointments in queue</p>
          </div>
        )}
      </div>
    </div>
  )
}
