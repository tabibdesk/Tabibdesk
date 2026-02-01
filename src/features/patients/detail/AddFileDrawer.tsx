"use client"

import { useState, useRef } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useLocale } from "@/contexts/locale-context"
import { cx } from "@/lib/utils"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"
import { Button } from "@/components/Button"
import { RiUploadLine, RiFlaskLine, RiHeartPulseLine, RiFileTextLine } from "@remixicon/react"
import type { AttachmentKind } from "@/types/attachment"

const THUMB_SIZE = 64

function createImageThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Not an image"))
      return
    }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement("canvas")
      const scale = Math.min(THUMB_SIZE / img.width, THUMB_SIZE / img.height, 1)
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("No canvas context"))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/jpeg", 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }
    img.src = url
  })
}

interface AddFileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (files: FileList, kind: AttachmentKind, thumbnails?: Record<string, string>) => void
}

function getKindOptions(t: { fileUpload: { lab: string; scan: string; ecg: string; document: string } }) {
  return [
    { value: "lab" as AttachmentKind, label: t.fileUpload.lab, icon: RiFlaskLine },
    { value: "scan" as AttachmentKind, label: t.fileUpload.scan, icon: RiHeartPulseLine },
    { value: "ecg" as AttachmentKind, label: t.fileUpload.ecg, icon: RiHeartPulseLine },
    { value: "document" as AttachmentKind, label: t.fileUpload.document, icon: RiFileTextLine },
  ]
}

export function AddFileDrawer({
  open,
  onOpenChange,
  onUpload,
}: AddFileDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const KIND_OPTIONS = getKindOptions(t)
  const [isDragging, setIsDragging] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null)
  const [selectedKind, setSelectedKind] = useState<AttachmentKind>("document")
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setPendingFiles(null)
    setSelectedKind("document")
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setPendingFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingFiles(e.target.files)
    }
  }

  const handleConfirmUpload = async () => {
    if (!pendingFiles || pendingFiles.length === 0) return
    setIsGeneratingThumbnails(true)
    const thumbnails: Record<string, string> = {}
    try {
      for (const file of Array.from(pendingFiles)) {
        if (file.type.startsWith("image/")) {
          try {
            thumbnails[file.name] = await createImageThumbnail(file)
          } catch {
            // Skip thumbnail for this file
          }
        }
      }
      onUpload(pendingFiles, selectedKind, Object.keys(thumbnails).length > 0 ? thumbnails : undefined)
      reset()
      onOpenChange(false)
    } finally {
      setIsGeneratingThumbnails(false)
    }
  }

  const handleBack = () => {
    setPendingFiles(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>{t.fileUpload.uploadFiles}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          {!pendingFiles || pendingFiles.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cx(
                "relative rounded-xl border-2 border-dashed p-8 text-center transition-all",
                isDragging
                  ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/10"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20"
              )}
            >
              <RiUploadLine className="mx-auto size-10 text-gray-400" />
              <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.fileUpload.dropFilesHere}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {t.fileUpload.orClickToBrowse}
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                onChange={handleFileInput}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.fileUpload.filesSelectedMarkAs.replace("{n}", String(pendingFiles.length))}
              </p>
              <div className="flex flex-wrap gap-2">
                {KIND_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedKind(value)}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors",
                      selectedKind === value
                        ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-300"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
              <ul className="max-h-32 overflow-auto rounded-lg border border-gray-200 bg-gray-50/50 py-2 dark:border-gray-800 dark:bg-gray-900/20">
                {Array.from(pendingFiles).map((file, i) => (
                  <li key={i} className="truncate px-3 py-1 text-xs text-gray-600 dark:text-gray-400">
                    {file.name}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleBack} disabled={isGeneratingThumbnails}>
                  {t.fileUpload.back}
                </Button>
                <Button variant="primary" className="flex-1" onClick={handleConfirmUpload} disabled={isGeneratingThumbnails}>
                  <RiUploadLine className="me-2 size-4" />
                  {isGeneratingThumbnails ? t.fileUpload.preparing : t.fileUpload.upload}
                </Button>
              </div>
            </div>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
