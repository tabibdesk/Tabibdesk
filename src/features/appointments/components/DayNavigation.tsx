"use client"

import { useState } from "react"
import { Button } from "@/components/Button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover"
import { Calendar } from "@/components/Calendar"
import { RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine } from "@remixicon/react"
import { format, isBefore, startOfDay } from "date-fns"
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
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date && !isBeforeToday(date)) {
      onDateChange(date)
      setIsCalendarOpen(false)
    }
  }
  
  const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  const cannotGoToPast = isToday
  
  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPreviousDay}
        disabled={cannotGoToPast}
        className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 shrink-0"
      >
        <RiArrowLeftSLine className="size-5 rtl:rotate-180" />
      </Button>
      
      <div className="flex items-center justify-center flex-1">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="bg-primary-50 dark:bg-primary-900/30 p-1.5 sm:p-2 rounded-xl text-primary-600 dark:text-primary-400 shrink-0">
                <RiCalendarLine className="size-4 sm:size-5" />
              </div>
              <h2 className="font-bold text-sm sm:text-lg text-gray-800 dark:text-gray-100 whitespace-nowrap">
                <span className="sm:hidden">{format(currentDate, "MMM d, yyyy", { locale: DATEPICKER_LOCALE })}</span>
                <span className="hidden sm:inline">{format(currentDate, "EEEE, MMMM d, yyyy", { locale: DATEPICKER_LOCALE })}</span>
              </h2>
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
      
      <Button
        variant="ghost"
        size="sm"
        onClick={goToNextDay}
        className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 shrink-0"
      >
        <RiArrowRightSLine className="size-5 rtl:rotate-180" />
      </Button>
    </div>
  )
}
