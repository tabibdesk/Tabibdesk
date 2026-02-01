"use client"

import { useState } from "react"
import { Button } from "@/components/Button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover"
import { Calendar } from "@/components/Calendar"
import { RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine } from "@remixicon/react"
import { format, isBefore, startOfDay } from "date-fns"
import { useLocale } from "@/contexts/locale-context"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { DATEPICKER_LOCALE } from "@/lib/date-utils"

interface DayNavigationProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

function isBeforeToday(date: Date): boolean {
  return isBefore(startOfDay(date), startOfDay(new Date()))
}

export function DayNavigation({ currentDate, onDateChange }: DayNavigationProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const t = useAppTranslations()
  // Datepicker always uses English (no translation of month/day names)
  
  const goToPreviousDay = () => {
    const prev = new Date(currentDate)
    prev.setDate(prev.getDate() - 1)
    onDateChange(prev)
  }
  
  const goToNextDay = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + 1)
    onDateChange(next)
  }
  
  const goToToday = () => {
    onDateChange(new Date())
  }
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date && !isBeforeToday(date)) {
      onDateChange(date)
      setIsCalendarOpen(false)
    }
  }
  
  const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  const cannotGoToPast = isToday
  
  return (
    <div className="flex items-center justify-between gap-1 sm:gap-4 rounded-lg border border-gray-200 bg-white p-2 sm:p-4 dark:border-gray-800 dark:bg-gray-950">
      {/* Previous Day - disabled when on today so we never go to past */}
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPreviousDay}
        disabled={cannotGoToPast}
        className="shrink-0 h-9 w-9 p-0 sm:h-auto sm:w-auto sm:px-3"
      >
        <RiArrowLeftSLine className="size-5 rtl:rotate-180" />
      </Button>
      
      {/* Date Display & Calendar Popup */}
      <div className="flex flex-1 items-center justify-center min-w-0">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 sm:gap-2 rounded-md px-2 sm:px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-50 dark:hover:bg-gray-800 truncate"
            >
              <RiCalendarLine className="size-4 sm:size-5 text-gray-500 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                <span className="sm:hidden">{format(currentDate, "MMM d, yyyy", { locale: DATEPICKER_LOCALE })}</span>
                <span className="hidden sm:inline">{format(currentDate, "EEEE, MMMM d, yyyy", { locale: DATEPICKER_LOCALE })}</span>
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={handleDateSelect}
              disabled={isBeforeToday}
              fromDate={startOfDay(new Date())}
              initialFocus
              enableYearNavigation
              locale={DATEPICKER_LOCALE}
              weekStartsOn={0}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Today Button */}
        {!isToday && (
          <Button
            variant="secondary"
            size="sm"
            onClick={goToToday}
            className="h-8 sm:h-9 px-2 sm:px-4 text-xs sm:text-sm"
          >
            {t.appointments.today}
          </Button>
        )}
        
        {/* Next Day */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextDay}
          className="h-9 w-9 p-0 sm:h-auto sm:w-auto sm:px-3"
        >
          <RiArrowRightSLine className="size-5 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  )
}
