"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { cx } from "@/lib/utils"
import {
  RiFlaskLine,
  RiAddLine,
  RiFileDownloadLine,
  RiSaveLine,
  RiCloseLine,
  RiEditLine,
  RiDeleteBinLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCloseFill,
  RiFileTextLine,
  RiFileImageLine,
  RiFilePdfLine,
  RiFileWordLine,
  RiFileExcelLine,
  RiDownloadLine,
  RiUploadLine,
} from "@remixicon/react"
import Image from "next/image"

interface LabResult {
  id: string
  patient_id: string
  test_name: string
  value: string
  unit: string
  normal_range: string
  status: "normal" | "abnormal" | "borderline"
  test_date: string
  pdf_url: string | null
  notes: string | null
  lab_file_id: string | null
}

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

interface FilesTabProps {
  labResults: LabResult[]
  attachments: Attachment[]
  onUploadAttachment?: (files: FileList) => void
  onDeleteAttachment?: (attachmentId: string) => void
}

export function FilesTab({
  labResults,
  attachments,
  onUploadAttachment,
  onDeleteAttachment,
}: FilesTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<LabResult>>({})
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [viewingFile, setViewingFile] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Group lab results by test date
  const groupedResults = labResults.reduce((acc, result) => {
    const date = result.test_date
    if (!acc[date]) {
      acc[date] = { labResults: [], attachments: [] }
    }
    acc[date].labResults.push(result)
    return acc
  }, {} as Record<string, { labResults: LabResult[]; attachments: Attachment[] }>)

  // Group attachments by upload date and merge with lab results
  attachments.forEach((attachment) => {
    const date = new Date(attachment.uploaded_at).toISOString().split('T')[0]
    if (!groupedResults[date]) {
      groupedResults[date] = { labResults: [], attachments: [] }
    }
    groupedResults[date].attachments.push(attachment)
  })

  const sortedDates = Object.keys(groupedResults).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev)
      if (next.has(date)) {
        next.delete(date)
      } else {
        next.add(date)
      }
      return next
    })
  }

  const isExpanded = (date: string) => expandedDates.has(date)

  const handleEdit = (result: LabResult) => {
    setEditingId(result.id)
    setEditValues(result)
  }

  const handleSave = () => {
    // TODO: Save to backend
    console.log("Save:", editValues)
    setEditingId(null)
    setEditValues({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

  const handleDelete = (id: string) => {
    // TODO: Delete from backend
    console.log("Delete:", id)
  }

  const handleAddRow = (_date: string) => {
    // TODO: Implement add row functionality
    console.log("Add row functionality not yet implemented")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600 dark:text-green-400"
      case "abnormal":
        return "text-red-600 dark:text-red-400"
      case "borderline":
        return "text-yellow-600 dark:text-yellow-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) {
      return <RiFileImageLine className="size-6 text-blue-600 dark:text-blue-400" />
    }
    if (fileType.includes("pdf")) {
      return <RiFilePdfLine className="size-6 text-red-600 dark:text-red-400" />
    }
    if (fileType.includes("word") || fileType.includes("document")) {
      return <RiFileWordLine className="size-6 text-blue-700 dark:text-blue-500" />
    }
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
      return <RiFileExcelLine className="size-6 text-green-600 dark:text-green-400" />
    }
    return <RiFileTextLine className="size-6 text-gray-600 dark:text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
      onUploadAttachment?.(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadAttachment?.(e.target.files)
    }
  }

  const hasFiles = labResults.length > 0 || attachments.length > 0

  return (
    <div className="space-y-4">
      {/* Upload Section - Top Row */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cx(
          "relative rounded-xl border-2 border-dashed p-6 text-center transition-all",
          isDragging
            ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/10"
            : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20"
        )}
      >
        <RiUploadLine className="mx-auto size-8 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Drop files here to upload
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Or click to browse
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>

      {!hasFiles ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RiFlaskLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">No files yet</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Upload lab reports or attachments to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
                {sortedDates.map((date) => {
                  const dateData = groupedResults[date]
                  const hasLabResults = dateData.labResults.length > 0
                  const hasAttachments = dateData.attachments.length > 0
                  const hasExpandableContent = hasLabResults
                  
                  return (
                    <div key={date} className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                      {hasExpandableContent ? (
                        <>
                          <div
                            className="group flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                            onClick={() => toggleDate(date)}
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded(date) ? (
                                <RiArrowDownSLine className="size-5 text-gray-400" />
                              ) : (
                                <RiArrowRightSLine className="size-5 text-gray-400" />
                              )}
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                                  {new Date(date).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                  {hasLabResults && `${dateData.labResults.length} ${dateData.labResults.length === 1 ? 'test' : 'tests'}`}
                                  {hasLabResults && hasAttachments && ' • '}
                                  {hasAttachments && `${dateData.attachments.length} ${dateData.attachments.length === 1 ? 'file' : 'files'}`}
                                </p>
                              </div>
                            </div>
                            {dateData.labResults[0]?.pdf_url && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setViewingFile("/mock/samplereport.png")}
                                >
                                  <RiFilePdfLine className="size-5 text-red-600 dark:text-red-400" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => window.open("/mock/samplereport.png", "_blank")}
                                >
                                  <RiFileDownloadLine className="size-5 text-gray-500" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {isExpanded(date) && (
                            <div className="bg-gray-50/50 dark:bg-gray-900/20 px-4 pb-4">
                              {/* Lab Results Table */}
                              {hasLabResults && (
                                <>
                                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                                    <table className="w-full text-sm">
                                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Test</th>
                                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Value</th>
                                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                                          <th className="px-3 py-2 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {dateData.labResults.map((result) => (
                                  <tr key={result.id}>
                                    <td className="px-3 py-2.5">
                                      {editingId === result.id ? (
                                        <Input
                                          value={editValues.test_name || ""}
                                          onChange={(e) => setEditValues({ ...editValues, test_name: e.target.value })}
                                          className="h-7 text-xs"
                                        />
                                      ) : (
                                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{result.test_name}</div>
                                      )}
                                    </td>
                                    <td className="px-3 py-2.5">
                                      {editingId === result.id ? (
                                        <div className="flex items-center gap-1">
                                          <Input
                                            value={editValues.value || ""}
                                            onChange={(e) => setEditValues({ ...editValues, value: e.target.value })}
                                            className="h-7 w-16 text-xs"
                                          />
                                          <span className="text-xs text-gray-500">{result.unit}</span>
                                        </div>
                                      ) : (
                                        <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                          {result.value} <span className="text-[11px] text-gray-500 font-normal ml-0.5">{result.unit}</span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <span className={cx("text-xs font-bold uppercase tracking-wider", getStatusColor(result.status))}>
                                        {result.status}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-right">
                                      <div className="flex justify-end gap-1">
                                        {editingId === result.id ? (
                                          <>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleSave}>
                                              <RiSaveLine className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCancel}>
                                              <RiCloseLine className="size-4" />
                                            </Button>
                                          </>
                                        ) : (
                                          <>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(result)}>
                                              <RiEditLine className="size-4 text-gray-400" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500/70 hover:text-red-500" onClick={() => handleDelete(result.id)}>
                                              <RiDeleteBinLine className="size-4" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="mt-2 flex justify-end">
                                    <Button variant="ghost" size="sm" className="h-7 text-xs font-medium" onClick={() => handleAddRow(date)}>
                                      <RiAddLine className="mr-1 size-4" />
                                      Add Test
                                    </Button>
                                  </div>
                                </>
                              )}
                              
                              {/* Attachments List */}
                              {hasAttachments && (
                                <div className={cx("mt-4", hasLabResults && "pt-4 border-t border-gray-200 dark:border-gray-800")}>
                                  <div className="space-y-2">
                                    {dateData.attachments.map((attachment) => (
                                      <div key={attachment.id} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-950 transition-colors bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                                          <div className="flex-shrink-0">
                                            {getFileIcon(attachment.file_type)}
                                          </div>
                                          <div className="overflow-hidden flex-1">
                                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
                                              {attachment.file_name}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                              <span>{formatFileSize(attachment.file_size)}</span>
                                              <span>•</span>
                                              <span>Document</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => window.open(attachment.file_url, "_blank")}
                                          >
                                            <RiDownloadLine className="size-5 text-gray-500" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500/70 hover:text-red-500"
                                            onClick={() => onDeleteAttachment?.(attachment.id)}
                                          >
                                            <RiDeleteBinLine className="size-5" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        // Date with only attachments (no lab results) - show as simple list
                        <div className="p-4">
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                              {new Date(date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">{dateData.attachments.length} {dateData.attachments.length === 1 ? 'file' : 'files'}</p>
                          </div>
                          <div className="space-y-2">
                            {dateData.attachments.map((attachment) => (
                              <div key={attachment.id} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-950 transition-colors bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                  <div className="flex-shrink-0">
                                    {getFileIcon(attachment.file_type)}
                                  </div>
                                  <div className="overflow-hidden flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
                                      {attachment.file_name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                      <span>{formatFileSize(attachment.file_size)}</span>
                                      <span>•</span>
                                      <span>Document</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => window.open(attachment.file_url, "_blank")}
                                  >
                                    <RiDownloadLine className="size-5 text-gray-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500/70 hover:text-red-500"
                                    onClick={() => onDeleteAttachment?.(attachment.id)}
                                  >
                                    <RiDeleteBinLine className="size-5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setViewingFile(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-lg bg-white dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Lab Report</h3>
              <button
                onClick={() => setViewingFile(null)}
                className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <RiCloseFill className="size-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              <Image
                src={viewingFile}
                alt="Lab Report"
                width={800}
                height={1000}
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
