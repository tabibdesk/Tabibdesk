"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Badge } from "@/components/Badge"
import { RiFlaskLine, RiAddLine, RiFileDownloadLine, RiSaveLine, RiCloseLine, RiEditLine, RiDeleteBinLine, RiArrowDownSLine, RiArrowRightSLine, RiAttachmentLine, RiCloseFill } from "@remixicon/react"
import Image from "next/image"
import { PatientEmptyState } from "@/components/patient/PatientEmptyState"

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

interface LabResultsTabProps {
  labResults: LabResult[]
}

export function LabResultsTab({ labResults }: LabResultsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<LabResult>>({})
  const [addingToDate, setAddingToDate] = useState<string | null>(null)
  const [newRow, setNewRow] = useState<Partial<LabResult>>({})
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [viewingFile, setViewingFile] = useState<string | null>(null)

  // Group results by test date
  const groupedResults = labResults.reduce((acc, result) => {
    const date = result.test_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(result)
    return acc
  }, {} as Record<string, LabResult[]>)

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
    setEditingId(null)
    setEditValues({})
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

  const handleDelete = (_id: string) => {
    // TODO: Delete from backend
  }

  const handleAddRow = (date: string) => {
    setAddingToDate(date)
    setNewRow({ test_date: date, status: "normal" })
  }

  const handleSaveNewRow = () => {
    // TODO: Save to backend
    setAddingToDate(null)
    setNewRow({})
  }

  const handleCancelNewRow = () => {
    setAddingToDate(null)
    setNewRow({})
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

  return (
    <div className="space-y-6">
      {labResults.length === 0 ? (
        <PatientEmptyState
          icon={RiFlaskLine}
          title="No lab results yet"
          description="Upload lab reports or add entries to get started."
        />
      ) : (
        <div className="space-y-3">
          {sortedDates.map((date) => (
            <Card key={date}>
              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50" onClick={() => toggleDate(date)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded(date) ? (
                      <RiArrowDownSLine className="size-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <RiArrowRightSLine className="size-5 text-gray-600 dark:text-gray-400" />
                    )}
                    <CardTitle>
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardTitle>
                    <Badge color="gray" size="xs">
                      {groupedResults[date].length} {groupedResults[date].length === 1 ? "test" : "tests"}
                    </Badge>
                  </div>
                  <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                    {!isExpanded(date) && groupedResults[date][0].pdf_url && (
                      <button
                        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        onClick={() => setViewingFile("/mock/samplereport.png")}
                      >
                        <RiAttachmentLine className="size-4" />
                        <span>Lab Report.pdf</span>
                      </button>
                    )}
                    {isExpanded(date) && groupedResults[date][0].pdf_url && (
                      <Button variant="ghost" size="sm">
                        <RiFileDownloadLine className="mr-2 size-4" />
                        Download Report
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {isExpanded(date) && (
                <CardContent>
                <div className="overflow-x-auto pt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                          Test Name
                        </th>
                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                          Value
                        </th>
                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                          Unit
                        </th>
                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                          Normal Range
                        </th>
                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                          Status
                        </th>
                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                          Notes
                        </th>
                        <th className="pb-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedResults[date].map((result) => (
                        <tr
                          key={result.id}
                          className="border-b border-gray-100 last:border-0 dark:border-gray-900"
                        >
                          {editingId === result.id ? (
                            <>
                              <td className="py-3">
                                <Input
                                  value={editValues.test_name || ""}
                                  onChange={(e) =>
                                    setEditValues({ ...editValues, test_name: e.target.value })
                                  }
                                  className="h-8 text-sm"
                                />
                              </td>
                              <td className="py-3">
                                <Input
                                  value={editValues.value || ""}
                                  onChange={(e) =>
                                    setEditValues({ ...editValues, value: e.target.value })
                                  }
                                  className="h-8 w-20 text-sm"
                                />
                              </td>
                              <td className="py-3">
                                <Input
                                  value={editValues.unit || ""}
                                  onChange={(e) =>
                                    setEditValues({ ...editValues, unit: e.target.value })
                                  }
                                  className="h-8 w-20 text-sm"
                                />
                              </td>
                              <td className="py-3">
                                <Input
                                  value={editValues.normal_range || ""}
                                  onChange={(e) =>
                                    setEditValues({ ...editValues, normal_range: e.target.value })
                                  }
                                  className="h-8 text-sm"
                                />
                              </td>
                              <td className="py-3">
                                <select
                                  value={editValues.status || "normal"}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      status: e.target.value as "normal" | "abnormal" | "borderline",
                                    })
                                  }
                                  className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                                >
                                  <option value="normal">Normal</option>
                                  <option value="abnormal">Abnormal</option>
                                  <option value="borderline">Borderline</option>
                                </select>
                              </td>
                              <td className="py-3">
                                <Input
                                  value={editValues.notes || ""}
                                  onChange={(e) =>
                                    setEditValues({ ...editValues, notes: e.target.value })
                                  }
                                  className="h-8 text-sm"
                                  placeholder="Optional"
                                />
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" onClick={handleSave}>
                                    <RiSaveLine className="size-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                                    <RiCloseLine className="size-4" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 text-sm font-medium text-gray-900 dark:text-gray-50">
                                {result.test_name}
                              </td>
                              <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                                {result.value}
                              </td>
                              <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                                {result.unit}
                              </td>
                              <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                                {result.normal_range}
                              </td>
                              <td className="py-3">
                                <span className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                                  {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                                </span>
                              </td>
                              <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                                {result.notes || "-"}
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(result)}
                                  >
                                    <RiEditLine className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(result.id)}
                                  >
                                    <RiDeleteBinLine className="size-4" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      {addingToDate === date && (
                        <tr className="border-b border-gray-100 bg-blue-50/50 dark:border-gray-900 dark:bg-blue-900/10">
                          <td className="py-3">
                            <Input
                              value={newRow.test_name || ""}
                              onChange={(e) => setNewRow({ ...newRow, test_name: e.target.value })}
                              className="h-8 text-sm"
                              placeholder="Test name"
                            />
                          </td>
                          <td className="py-3">
                            <Input
                              value={newRow.value || ""}
                              onChange={(e) => setNewRow({ ...newRow, value: e.target.value })}
                              className="h-8 w-20 text-sm"
                              placeholder="Value"
                            />
                          </td>
                          <td className="py-3">
                            <Input
                              value={newRow.unit || ""}
                              onChange={(e) => setNewRow({ ...newRow, unit: e.target.value })}
                              className="h-8 w-20 text-sm"
                              placeholder="Unit"
                            />
                          </td>
                          <td className="py-3">
                            <Input
                              value={newRow.normal_range || ""}
                              onChange={(e) => setNewRow({ ...newRow, normal_range: e.target.value })}
                              className="h-8 text-sm"
                              placeholder="Range"
                            />
                          </td>
                          <td className="py-3">
                            <select
                              value={newRow.status || "normal"}
                              onChange={(e) =>
                                setNewRow({
                                  ...newRow,
                                  status: e.target.value as "normal" | "abnormal" | "borderline",
                                })
                              }
                              className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-950"
                            >
                              <option value="normal">Normal</option>
                              <option value="abnormal">Abnormal</option>
                              <option value="borderline">Borderline</option>
                            </select>
                          </td>
                          <td className="py-3">
                            <Input
                              value={newRow.notes || ""}
                              onChange={(e) => setNewRow({ ...newRow, notes: e.target.value })}
                              className="h-8 text-sm"
                              placeholder="Optional"
                            />
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={handleSaveNewRow}>
                                <RiSaveLine className="size-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={handleCancelNewRow}>
                                <RiCloseLine className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleAddRow(date)}>
                    <RiAddLine className="mr-2 size-4" />
                    Add Entry
                  </Button>
                </div>
              </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setViewingFile(null)}>
          <div className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-lg bg-white dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Lab Report</h3>
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
