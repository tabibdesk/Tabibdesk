"use client"

import { Button } from "@/components/Button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog"
import { RiAlertLine, RiCheckLine, RiCloseLine, RiInformationLine } from "@remixicon/react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  loadingText?: string
  variant?: "danger" | "warning" | "info" | "success"
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loadingText = "Processing...",
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <RiCloseLine className="size-6 text-red-600 dark:text-red-400" />
      case "warning":
        return <RiAlertLine className="size-6 text-yellow-600 dark:text-yellow-400" />
      case "success":
        return <RiCheckLine className="size-6 text-green-600 dark:text-green-400" />
      case "info":
        return <RiInformationLine className="size-6 text-blue-600 dark:text-blue-400" />
    }
  }

  const getIconBgColor = () => {
    switch (variant) {
      case "danger":
        return "bg-red-100 dark:bg-red-900/20"
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900/20"
      case "success":
        return "bg-green-100 dark:bg-green-900/20"
      case "info":
        return "bg-blue-100 dark:bg-blue-900/20"
    }
  }

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-4 rtl:flex-row-reverse">
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${getIconBgColor()}`}>
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-start">{title}</DialogTitle>
              <DialogDescription className="mt-2 text-start">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary" disabled={isLoading}>
              {cancelText}
            </Button>
          </DialogClose>
          <Button
            variant={variant === "danger" ? "destructive" : "primary"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? loadingText : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

