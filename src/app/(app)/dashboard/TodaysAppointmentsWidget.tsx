"use client"

import Link from "next/link"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { getBadgeColor } from "@/lib/badgeColors"
import { RiCalendarLine, RiCheckboxCircleLine, RiCloseLine, RiMenuLine, RiMoneyDollarCircleLine } from "@remixicon/react"
import { WidgetSkeleton } from "@/components/skeletons"
import { EmptyState } from "@/components/EmptyState"
import type { DashboardAppointment } from "./dashboard.types"
import { getTimeDisplay, getIconColorClass, getIconBackgroundClass } from "./useQueueActions"

interface TodaysAppointmentsWidgetProps {
  loading: boolean
  appointments: DashboardAppointment[]
  paidAppointments: Set<string>
  draggedIndex: number | null
  dragOverIndex: number | null
  markingArrived: string | null
  markingPaid: string | null
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  onMarkArrived: (apt: DashboardAppointment) => void
  onCreateInvoice: (apt: DashboardAppointment) => void
  onNoShow: (apt: DashboardAppointment) => void
  onUnmarkArrived: (apt: DashboardAppointment) => void
  onUnmarkPaid: (apt: DashboardAppointment) => void
}

export function TodaysAppointmentsWidget({
  loading,
  appointments,
  paidAppointments,
  draggedIndex,
  dragOverIndex,
  markingArrived,
  markingPaid,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onMarkArrived,
  onCreateInvoice,
  onNoShow,
  onUnmarkArrived,
  onUnmarkPaid,
}: TodaysAppointmentsWidgetProps) {
  const t = useAppTranslations()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t.dashboard.todaysAppointments}</h2>
        </div>
        <WidgetSkeleton rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t.dashboard.todaysAppointments}</h2>
      </div>
      <div className="space-y-3">
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((apt, index) => {
              const isNow = index === 0
              const isNext = index === 1
              const badgeVariant = isNow ? "success" : isNext ? "default" : "neutral"
              const badgeText = isNow ? "now" : isNext ? "next" : null
              const isBusy = markingArrived === apt.id || markingPaid === apt.id

              return (
                <div
                  key={apt.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, index)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, index)}
                  onDragEnd={onDragEnd}
                  className={`widget-row cursor-move relative ${
                    draggedIndex === index
                      ? "opacity-50 bg-primary-50/30 dark:bg-primary-900/10"
                      : dragOverIndex === index
                      ? "bg-primary-50/50 dark:bg-primary-900/20"
                      : ""
                  } ${isBusy ? "opacity-60" : ""}`}
                >
                  {isBusy && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/40 dark:bg-black/20">
                      <div className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400" />
                    </div>
                  )}
                  <div className="widget-content-stack">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${getIconBackgroundClass(index)}`}>
                      <RiMenuLine className={`size-4 ${getIconColorClass(index)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/patients/${apt.patient_id}`}
                          className="font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {apt.patientName}
                        </Link>
                        {(isNow || isNext) ? (
                          <Badge color={getBadgeColor(badgeVariant)} size="xs">
                            {badgeText === "now" ? t.dashboard.now : t.dashboard.next}
                          </Badge>
                        ) : (
                          <span className="shrink-0 text-[10px] font-bold tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded-sm lowercase">
                            {getTimeDisplay(apt.scheduled_at)}
                          </span>
                        )}
                        {apt.status === "arrived" && (
                          <Badge
                            color="emerald"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              onUnmarkArrived(apt)
                            }}
                            title={t.dashboard.unmarkArrived}
                          >
                            {t.dashboard.arrived}
                          </Badge>
                        )}
                        {paidAppointments.has(apt.id) && (
                          <Badge
                            color="emerald"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              onUnmarkPaid(apt)
                            }}
                            title={t.dashboard.unmarkPaid}
                          >
                            {t.dashboard.paid}
                          </Badge>
                        )}
                        {apt.queueStatus === "no_show" && (
                          <Badge color="red" size="xs">
                            {t.dashboard.noShow}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate lowercase font-medium">
                          {apt.type}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-1.5 ms-2 sm:ms-4 shrink-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(apt.status === "scheduled" || apt.status === "confirmed" || apt.status === "in_progress") && (
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkArrived(apt)
                          }}
                          disabled={markingArrived === apt.id}
                          className="btn-secondary-widget bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                          title={t.dashboard.markAsArrived}
                        >
                          <RiCheckboxCircleLine className="size-4" />
                          <span className="hidden sm:inline lowercase">{t.dashboard.arrived}</span>
                        </Button>
                      )}
                      {!paidAppointments.has(apt.id) && apt.status === "arrived" && (
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            onCreateInvoice(apt)
                          }}
                          disabled={markingPaid === apt.id || markingArrived === apt.id}
                          className="btn-secondary-widget bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          title={t.dashboard.createInvoice}
                        >
                          <RiMoneyDollarCircleLine className="size-4" />
                          <span className="hidden sm:inline lowercase">{t.dashboard.createInvoice}</span>
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          onNoShow(apt)
                        }}
                        className="btn-secondary-widget bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-950/30 dark:text-gray-400 dark:hover:bg-gray-900/50"
                        title={t.dashboard.markAsNoShow}
                      >
                        <RiCloseLine className="size-4" />
                        <span className="hidden sm:inline lowercase">{t.dashboard.noShow}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            variant="card"
            icon={RiCalendarLine}
            title={t.dashboard.noAppointmentsScheduledToday}
            description={t.dashboard.todayAppointmentsDescription}
          />
        )}
      </div>
    </div>
  )
}
