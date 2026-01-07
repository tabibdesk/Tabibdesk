"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RiListCheck, RiFolderLine, RiArchiveLine, RiArrowRightSLine } from "@remixicon/react"
import { cx, focusRing } from "@/lib/utils"

interface ListsDropdownProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement>
}

const listItems = [
  { name: "My Lists", href: "/lists/my", icon: RiListCheck },
  { name: "Shared Lists", href: "/lists/shared", icon: RiFolderLine },
  { name: "Archived", href: "/lists/archived", icon: RiArchiveLine },
]

export function ListsDropdown({ isOpen, onClose, triggerRef }: ListsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose, triggerRef])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className={cx(
        "absolute left-full top-0 z-[60] ml-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900",
        "animate-in fade-in-0 slide-in-from-left-1 duration-150"
      )}
      role="menu"
      aria-orientation="vertical"
    >
      <div className="py-1">
        {listItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cx(
                "flex items-center gap-x-3 px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50",
                focusRing
              )}
              role="menuitem"
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

interface MobileListsProps {
  isExpanded: boolean
  onToggle: () => void
}

export function MobileLists({ isExpanded, onToggle }: MobileListsProps) {
  const pathname = usePathname()

  return (
    <div>
      <button
        onClick={onToggle}
        className={cx(
          "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-900",
          focusRing
        )}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-x-2.5">
          <RiListCheck className="size-4 shrink-0" aria-hidden="true" />
          <span>Lists</span>
        </div>
        <RiArrowRightSLine
          className={cx(
            "size-4 transition-transform duration-200",
            isExpanded && "rotate-90"
          )}
          aria-hidden="true"
        />
      </button>
      
      {isExpanded && (
        <div className="ml-6 mt-1 space-y-0.5">
          {listItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cx(
                  "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                  "hover:bg-gray-100 dark:hover:bg-gray-900",
                  focusRing
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

