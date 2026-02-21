"use client"

import { RiTimeLine } from "@remixicon/react"
import { useAppTranslations } from "@/lib/useAppTranslations"

interface BufferGapProps {
  minutes: number
}

export function BufferGap({ minutes }: BufferGapProps) {
  const t = useAppTranslations()
  if (minutes <= 0) return null
  
  return (
    <div className="ms-0 sm:ms-12 py-1 relative flex items-center justify-center">
      <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-800 absolute" />
      <div className="relative bg-gray-50 dark:bg-gray-950 px-4">
        <div className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50">
          <RiTimeLine className="size-3 text-gray-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {t.appointments.minBuffer.replace("{n}", minutes.toString())}
          </span>
        </div>
      </div>
    </div>
  )
}
