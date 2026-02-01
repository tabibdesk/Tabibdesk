"use client"

import { useState } from "react"
import { cx } from "@/lib/utils"
import { useAppTranslations } from "@/lib/useAppTranslations"
import {
  RiAddLine,
  RiCloseLine,
  RiFileTextLine,
  RiCapsuleLine,
  RiTaskLine,
  RiAttachmentLine,
  RiMoneyDollarCircleLine,
} from "@remixicon/react"

export interface Tab {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface HorizontalTabNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: Tab[]
  // Action callbacks
  onAddNote?: () => void
  onAddMedication?: () => void
  onAddTask?: () => void
  onAddFile?: () => void
  onAddCharge?: () => void
}

export function HorizontalTabNav({
  activeTab,
  onTabChange,
  tabs,
  onAddNote,
  onAddMedication,
  onAddTask,
  onAddFile,
  onAddCharge,
}: HorizontalTabNavProps) {
  const t = useAppTranslations()
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  const actions = [
    { label: t.patients.addNote, icon: RiFileTextLine, onClick: onAddNote },
    { label: t.patients.addTask, icon: RiTaskLine, onClick: onAddTask },
    { label: t.patients.uploadFile, icon: RiAttachmentLine, onClick: onAddFile },
    { label: t.patients.addInvoice, icon: RiMoneyDollarCircleLine, onClick: onAddCharge },
    { label: t.patients.addPrescription, icon: RiCapsuleLine, onClick: onAddMedication },
  ]

  const AddButton = () => (
    <div className="relative shrink-0">
      <button
        onClick={() => setShowActionsMenu(!showActionsMenu)}
        className={cx(
          "inline-flex items-center justify-center rounded-lg border p-2 transition-colors",
          showActionsMenu
            ? "border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-400"
            : "border-primary-600 bg-primary-600 text-white hover:bg-primary-700 dark:border-primary-500 dark:bg-primary-500 dark:text-white dark:hover:bg-primary-600"
        )}
        aria-label="Add Record"
      >
        {showActionsMenu ? (
          <RiCloseLine className="size-5" />
        ) : (
          <RiAddLine className="size-5" />
        )}
      </button>

      {showActionsMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowActionsMenu(false)}
          />

          {/* Dropdown Menu - RTL: button on left, dropdown opens right; LTR: button on right, dropdown opens left */}
          <div className="absolute end-0 z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950 rtl:end-0 rtl:start-auto">
            <div className="p-1.5">
              {actions.map((action, i) => {
                const ActionIcon = action.icon
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setShowActionsMenu(false)
                      action.onClick?.()
                    }}
                    className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
                  >
                    <ActionIcon className="size-5 text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
                    <span>{action.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between gap-0">
        {/* Tabs: full width on mobile (no + button), normal on desktop */}
        <nav
          className="-mb-px flex min-w-0 flex-1 sm:flex-initial sm:min-w-0 overflow-x-auto sm:overflow-visible"
          aria-label="Tabs"
        >
          <div className="flex w-full flex-1 gap-0 sm:w-auto sm:flex-initial sm:gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cx(
                    "group inline-flex flex-1 min-w-0 justify-center gap-2 whitespace-nowrap border-b-2 px-1 py-2.5 text-sm font-medium transition-colors sm:flex-initial sm:min-w-0 sm:justify-start sm:py-3",
                    isActive
                      ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                      : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-200"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={cx(
                      "size-5 shrink-0",
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-500 group-hover:text-gray-700 dark:text-gray-500 dark:group-hover:text-gray-300"
                    )}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Add Record Dropdown (Desktop Only) */}
        <div className="hidden shrink-0 ms-4 sm:block">
          <AddButton />
        </div>

        {/* Mobile: no button, placeholder keeps layout consistent */}
        <div id="mobile-action-button" className="w-0 overflow-hidden sm:hidden" aria-hidden />
      </div>
    </div>
  )
}

// Export the AddButton component for use in the PageHeader
export function MobileAddButton({
  onAddNote,
  onAddMedication,
  onAddTask,
  onAddFile,
  onAddCharge
}: Partial<HorizontalTabNavProps>) {
  const t = useAppTranslations()
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  const actions = [
    { label: t.patients.addNote, icon: RiFileTextLine, onClick: onAddNote },
    { label: t.patients.addTask, icon: RiTaskLine, onClick: onAddTask },
    { label: t.patients.uploadFile, icon: RiAttachmentLine, onClick: onAddFile },
    { label: t.patients.addInvoice, icon: RiMoneyDollarCircleLine, onClick: onAddCharge },
    { label: t.patients.addPrescription, icon: RiCapsuleLine, onClick: onAddMedication },
  ]

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setShowActionsMenu(!showActionsMenu)}
        className={cx(
          "inline-flex items-center justify-center rounded-lg border p-2 transition-colors",
          showActionsMenu
            ? "border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-400"
            : "border-primary-600 bg-primary-600 text-white hover:bg-primary-700 dark:border-primary-500 dark:bg-primary-500 dark:text-white dark:hover:bg-primary-600"
        )}
        aria-label="Add Record"
      >
        {showActionsMenu ? (
          <RiCloseLine className="size-5" />
        ) : (
          <RiAddLine className="size-5" />
        )}
      </button>

      {showActionsMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowActionsMenu(false)} />
          <div className="absolute end-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950 rtl:end-0 rtl:start-auto">
            <div className="p-1.5">
              {actions.map((action, i) => {
                const ActionIcon = action.icon
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setShowActionsMenu(false)
                      action.onClick?.()
                    }}
                    className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
                  >
                    <ActionIcon className="size-5 text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
                    <span>{action.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
