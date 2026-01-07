"use client"

import React, { useState, useRef, useEffect } from "react"
import { cx } from "@/lib/utils"

interface TooltipProps {
  content: string
  children: React.ReactElement
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

export function Tooltip({ 
  content, 
  children, 
  side = "right",
  className 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      let top = 0
      let left = 0

      switch (side) {
        case "right":
          top = rect.top + rect.height / 2
          left = rect.right + 8
          break
        case "left":
          top = rect.top + rect.height / 2
          left = rect.left - 8
          break
        case "top":
          top = rect.top - 8
          left = rect.left + rect.width / 2
          break
        case "bottom":
          top = rect.bottom + 8
          left = rect.left + rect.width / 2
          break
      }

      setPosition({ top, left })
    }
  }, [isVisible, side])

  const transformClasses = {
    top: "-translate-x-1/2 -translate-y-full",
    right: "-translate-y-1/2",
    bottom: "-translate-x-1/2",
    left: "-translate-x-full -translate-y-1/2",
  }

  return (
    <>
      <div 
        ref={triggerRef}
        className="relative inline-flex"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={cx(
            "pointer-events-none fixed z-[70] whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-gray-700",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            transformClasses[side],
            className
          )}
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
          role="tooltip"
        >
          {content}
          {/* Tooltip arrow */}
          <div 
            className={cx(
              "absolute size-2 rotate-45 bg-gray-900 dark:bg-gray-700",
              side === "right" && "-left-1 top-1/2 -translate-y-1/2",
              side === "left" && "-right-1 top-1/2 -translate-y-1/2",
              side === "top" && "-bottom-1 left-1/2 -translate-x-1/2",
              side === "bottom" && "-top-1 left-1/2 -translate-x-1/2",
            )}
          />
        </div>
      )}
    </>
  )
}

