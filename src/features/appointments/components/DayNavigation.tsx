"use client"

import { useState } from "react"
import { Button } from "@/components/Button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover"
import { Calendar } from "@/components/Calendar"
import { RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine } from "@remixicon/react"
import { format } from "date-fns"

interface DayNavigationProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

export function DayNavigation({ currentDate, onDateChange }: DayNavigationProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  
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
    if (date) {
      onDateChange(date)
      setIsCalendarOpen(false)
    }
  }
  
  const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      {/* Previous Day */}
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPreviousDay}
        className="shrink-0"
      >
        <RiArrowLeftSLine className="size-5" />
      </Button>
      
      {/* Date Display & Calendar Popup */}
      <div className="flex flex-1 items-center justify-center">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-50 dark:hover:bg-gray-800"
            >
              <RiCalendarLine className="size-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {format(currentDate, "EEEE, MMMM d, yyyy")}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={handleDateSelect}
              initialFocus
              enableYearNavigation
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Today Button */}
      {!isToday && (
        <Button
          variant="secondary"
          size="sm"
          onClick={goToToday}
          className="shrink-0"
        >
          Today
        </Button>
      )}
      
      {/* Next Day */}
      <Button
        variant="ghost"
        size="sm"
        onClick={goToNextDay}
        className="shrink-0"
      >
        <RiArrowRightSLine className="size-5" />
      </Button>
    </div>
  )
}
