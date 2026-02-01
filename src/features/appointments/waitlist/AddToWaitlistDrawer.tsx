"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { useLocale } from "@/contexts/locale-context"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"
import { AddToWaitlistFlow } from "./AddToWaitlistFlow"
import { RiUserAddLine } from "@remixicon/react"
import { useUserClinic } from "@/contexts/user-clinic-context"

interface AddToWaitlistDrawerProps {
  open: boolean
  onClose: () => void
  onComplete?: () => void
}

export function AddToWaitlistDrawer({
  open,
  onClose,
  onComplete,
}: AddToWaitlistDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const { currentClinic } = useUserClinic()

  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    }
    onClose()
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>{t.appointments.addToWaitlist}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-6">
            {/* Banner */}
            <div className="rounded-xl bg-gray-50/50 border border-gray-100 p-3 dark:bg-gray-900/50 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <RiUserAddLine className="size-5 text-primary-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
                    <span>{t.appointments.waitingList}</span>
                    <span className="text-gray-300">•</span>
                    <span>{currentClinic?.name || t.common.clinic}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">
                    {t.appointments.addingPatientEarliest}
                  </p>
                </div>
              </div>
            </div>

            <AddToWaitlistFlow
              onCancel={onClose}
              onComplete={handleComplete}
            />
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
