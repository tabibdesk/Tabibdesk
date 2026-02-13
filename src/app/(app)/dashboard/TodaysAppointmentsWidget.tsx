"use client"

import Link from "next/link"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { getBadgeColor } from "@/lib/badgeColors"
import { RiArrowRightLine, RiCalendarLine, RiCheckboxCircleLine, RiCloseLine, RiMenuLine, RiMoneyDollarCircleLine } from "@remixicon/react"
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
        <Link href="/appointments">
          <Button variant="ghost" className="text-[11px] font-bold tracking-wider -mr-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50">
            {t.dashboard.viewAll}
            <RiArrowRightLine className="ml-1 size-3.5 rtl:rotate-180 rtl:ml-0 rtl:mr-1" />
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
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate lowercase font-medium">
                          {apt.type}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-1.5 ms-2 sm:ms-4 shrink-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      {apt.queueStatus === "no_show" && (
                        <Badge color="red" size="xs">
                          {t.dashboard.noShow}
                        </Badge>
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
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {(apt.status === "scheduled" || apt.status === "confirmed" || apt.status === "in_progress") && (
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkArrived(apt)
                          }}
                          disabled={markingArrived === apt.id}
                          className="btn-secondary-widget text-green-600 hover:text-green-700 hover:bg-green-50 border-green-100 shrink-0 whitespace-nowrap"
                          title={t.dashboard.markAsArrived}
                        >
                          <RiCheckboxCircleLine className="size-3.5 sm:mr-1 rtl:ml-1 rtl:mr-0" />
                          <span className="hidden sm:inline">{t.dashboard.arrived}</span>
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
                          className="btn-secondary-widget text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100 shrink-0 whitespace-nowrap"
                          title={t.dashboard.createInvoice}
                        >
                          <RiMoneyDollarCircleLine className="size-3.5 sm:mr-1 rtl:ml-1 rtl:mr-0" />
                          <span className="hidden sm:inline">{t.dashboard.createInvoice}</span>
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          onNoShow(apt)
                        }}
                        className="btn-secondary-widget text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 shrink-0 whitespace-nowrap"
                        title={t.dashboard.markAsNoShow}
                      >
                        <RiCloseLine className="size-3.5 sm:mr-1 rtl:ml-1 rtl:mr-0" />
                        <span className="hidden sm:inline">{t.dashboard.noShow}</span>
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
