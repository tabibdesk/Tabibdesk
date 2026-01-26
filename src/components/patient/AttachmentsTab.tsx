"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/Card"
import { Button } from "@/components/Button"
import {
  RiAttachmentLine,
  RiFileTextLine,
  RiFileImageLine,
  RiFilePdfLine,
  RiFileWordLine,
  RiFileExcelLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiUploadLine,
} from "@remixicon/react"

interface Attachment {
  id: string
  patient_id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  uploaded_at: string
  uploaded_by: string
}

interface AttachmentsTabProps {
  attachments: Attachment[]
  onUpload?: (files: FileList) => void
  onDelete?: (attachmentId: string) => void
}

export function AttachmentsTab({ attachments, onUpload, onDelete }: AttachmentsTabProps) {
  const [isDragging, setIsDragging] = useState(false)

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
      onUpload?.(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload?.(e.target.files)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) {
      return <RiFileImageLine className="size-8 text-blue-600 dark:text-blue-400" />
    }
    if (fileType.includes("pdf")) {
      return <RiFilePdfLine className="size-8 text-red-600 dark:text-red-400" />
    }
    if (fileType.includes("word") || fileType.includes("document")) {
      return <RiFileWordLine className="size-8 text-blue-700 dark:text-blue-500" />
    }
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
      return <RiFileExcelLine className="size-8 text-green-600 dark:text-green-400" />
    }
    return <RiFileTextLine className="size-8 text-gray-600 dark:text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="py-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition ${
              isDragging
                ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/10"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
            }`}
          >
            <RiUploadLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-50">
              Drag and drop files here
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              or click to browse from your computer
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <Button className="mt-4">
              <RiAttachmentLine className="mr-2 size-4" />
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attachments Grid */}
      {attachments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RiAttachmentLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">No attachments yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="group relative overflow-hidden">
              <CardContent className="p-4">
                {/* File Icon */}
                <div className="mb-3 flex items-center justify-center">
                  {getFileIcon(attachment.file_type)}
                </div>

                {/* File Name */}
                <p className="truncate text-center text-sm font-medium text-gray-900 dark:text-gray-50">
                  {attachment.file_name}
                </p>

                {/* File Info */}
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatFileSize(attachment.file_size)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDate(attachment.uploaded_at)}
                  </p>
                </div>

                {/* Actions (shown on hover) */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(attachment.file_url, "_blank")}
                  >
                    <RiDownloadLine className="size-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete?.(attachment.id)}
                  >
                    <RiDeleteBinLine className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

