"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { useState } from "react"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { ConfirmationModal } from "@/components/ConfirmationModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuIconWrapper,
} from "@/components/Dropdown"
import { Input } from "@/components/Input"
import { cx } from "@/lib/utils"
import {
  RiFlaskLine,
  RiAddLine,
  RiSaveLine,
  RiCloseLine,
  RiEditLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiQuillPenAiLine,
  RiArrowDownSLine,
  RiMore2Line,
  RiEyeLine,
} from "@remixicon/react"
import type { Attachment, AttachmentKind, LabResult, ScanExtraction } from "@/types/attachment"

interface FilesTabProps {
  labResults: LabResult[]
  attachments: Attachment[]
  scanExtractions?: ScanExtraction[]
  onDeleteAttachment?: (attachmentId: string) => void
  onExtractLab?: (attachmentId: string) => void
  onExtractScan?: (attachmentId: string, text: string) => void
}

function getKind(att: Attachment): AttachmentKind {
  return att.attachment_kind ?? "document"
}

function getKindLabel(att: Attachment): string {
  const k = getKind(att)
  if (k === "lab") return "Lab"
  if (k === "scan") return "Scan"
  if (k === "ecg") return "ECG"
  return "Document"
}

export function FilesTab({
  labResults,
  attachments,
  scanExtractions = [],
  onDeleteAttachment,
  onExtractLab,
  onExtractScan,
}: FilesTabProps) {
  const t = useAppTranslations()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<LabResult>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; fileName: string } | null>(null)
  const [extractConfirm, setExtractConfirm] = useState<{ type: "lab" | "scan" | "document" | "ecg"; attachmentId: string; fileName: string } | null>(null)
  const [simulatedLabResults, setSimulatedLabResults] = useState<Record<string, LabResult[]>>({})
  const [pendingNewLabRows, setPendingNewLabRows] = useState<Record<string, LabResult[]>>({})
  const [simulatedScanText, setSimulatedScanText] = useState<Record<string, string>>({})
  const [simulatedDocumentText, setSimulatedDocumentText] = useState<Record<string, string>>({})
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set())

  const toggleCardLower = (id: string) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const INITIAL_VISIBLE = 10
  const LOAD_MORE_INCREMENT = 10
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)

  const allFiles = [...attachments].sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
  const visibleFiles = allFiles.slice(0, visibleCount)
  const hasMore = visibleCount < allFiles.length

  const getLabResultsForAttachment = (attachmentId: string) =>
    labResults.filter((r) => r.lab_file_id === attachmentId)

  const getScanExtractionForAttachment = (attachmentId: string): ScanExtraction | undefined =>
    scanExtractions.find((s) => s.attachment_id === attachmentId)

  const getDisplayLabResults = (attachmentId: string): LabResult[] => {
    const fromApi = getLabResultsForAttachment(attachmentId)
    const simulated = simulatedLabResults[attachmentId] ?? []
    if (fromApi.length > 0) return [...fromApi, ...simulated]
    return simulated
  }

  const getDisplayScanText = (attachmentId: string): string | undefined => {
    const extraction = getScanExtractionForAttachment(attachmentId)
    if (extraction?.text) return extraction.text
    return simulatedScanText[attachmentId]
  }

  const getDisplayDocumentText = (attachmentId: string): string | undefined =>
    simulatedDocumentText[attachmentId]

  const handleExtractConfirm = () => {
    if (!extractConfirm) return
    const { type, attachmentId } = extractConfirm
    if (type === "lab") {
      const simulated: LabResult[] = [
        { id: `sim-lab-${attachmentId}-1`, patient_id: "", test_name: "Glucose", value: "98", unit: "mg/dL", normal_range: "70-100", status: "normal", test_date: new Date().toISOString().split("T")[0], pdf_url: null, notes: null, lab_file_id: attachmentId },
        { id: `sim-lab-${attachmentId}-2`, patient_id: "", test_name: "HbA1c", value: "5.4", unit: "%", normal_range: "<5.7", status: "normal", test_date: new Date().toISOString().split("T")[0], pdf_url: null, notes: null, lab_file_id: attachmentId },
        { id: `sim-lab-${attachmentId}-3`, patient_id: "", test_name: "Cholesterol", value: "185", unit: "mg/dL", normal_range: "<200", status: "normal", test_date: new Date().toISOString().split("T")[0], pdf_url: null, notes: "AI extracted summary", lab_file_id: attachmentId },
      ]
      setSimulatedLabResults((prev) => ({ ...prev, [attachmentId]: simulated }))
      onExtractLab?.(attachmentId)
    } else if (type === "scan" || type === "ecg") {
      const simulatedText = type === "ecg"
        ? "AI extracted summary: Sinus rhythm, rate 72 bpm. Normal axis. No ST elevation or depression. No significant arrhythmia. Impression: Normal ECG."
        : "AI extracted summary: No acute findings. Structures are within normal limits. No focal lesion or significant abnormality identified. Impression: Normal study."
      setSimulatedScanText((prev) => ({ ...prev, [attachmentId]: simulatedText }))
      onExtractScan?.(attachmentId, simulatedText)
    } else {
      const simulatedText = "AI extracted summary: Key points and findings from the document. Main topics covered. Summary generated for quick reference."
      setSimulatedDocumentText((prev) => ({ ...prev, [attachmentId]: simulatedText }))
    }
    setExpandedCardIds((prev) => new Set(prev).add(attachmentId))
    setExtractConfirm(null)
  }

  const handleEdit = (result: LabResult) => {
    setEditingId(result.id)
    setEditValues(result)
  }

  const handleSave = () => {
    const id = editingId
    if (id?.startsWith("new-") && editValues.lab_file_id) {
      const attachmentId = editValues.lab_file_id
      const saved: LabResult = {
        id: `sim-lab-${attachmentId}-${Date.now()}`,
        patient_id: editValues.patient_id ?? "",
        test_name: editValues.test_name ?? "",
        value: editValues.value ?? "",
        unit: editValues.unit ?? "",
        normal_range: editValues.normal_range ?? "",
        status: (editValues.status as LabResult["status"]) ?? "normal",
        test_date: editValues.test_date ?? new Date().toISOString().split("T")[0],
        pdf_url: editValues.pdf_url ?? null,
        notes: editValues.notes ?? null,
        lab_file_id: attachmentId,
      }
      setSimulatedLabResults((prev) => ({
        ...prev,
        [attachmentId]: [...(prev[attachmentId] ?? []), saved],
      }))
      setPendingNewLabRows((prev) => ({
        ...prev,
        [attachmentId]: (prev[attachmentId] ?? []).filter((r) => r.id !== id),
      }))
    }
    setEditingId(null)
    setEditValues({})
  }

  const handleCancel = () => {
    const id = editingId
    if (id?.startsWith("new-") && editValues.lab_file_id) {
      const attachmentId = editValues.lab_file_id
      setPendingNewLabRows((prev) => ({
        ...prev,
        [attachmentId]: (prev[attachmentId] ?? []).filter((r) => r.id !== id),
      }))
    }
    setEditingId(null)
    setEditValues({})
  }

  const handleAddTest = (attachmentId: string) => {
    const newRow: LabResult = {
      id: `new-${attachmentId}-${Date.now()}`,
      patient_id: "",
      test_name: "",
      value: "",
      unit: "",
      normal_range: "",
      status: "normal",
      test_date: new Date().toISOString().split("T")[0],
      pdf_url: null,
      notes: null,
      lab_file_id: attachmentId,
    }
    setPendingNewLabRows((prev) => ({
      ...prev,
      [attachmentId]: [...(prev[attachmentId] ?? []), newRow],
    }))
    setEditingId(newRow.id)
    setEditValues(newRow)
  }

  const handleDelete = (_id: string) => {
    // TODO: Delete from backend
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

  const hasFiles = allFiles.length > 0

  const renderLabCard = (attachment: Attachment) => {
    const id = attachment.id
    const results = [...getDisplayLabResults(id), ...(pendingNewLabRows[id] ?? [])]
    const hasExtracted = results.length > 0

    return (
      <div key={id} className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        {/* Top row: content left, dropdown right */}
        <div className="flex gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => window.open(attachment.file_url, "_blank")}
                className="max-w-full truncate text-left text-sm font-semibold text-gray-900 hover:text-primary-600 hover:underline dark:text-gray-50 dark:hover:text-primary-400"
                title="View in new tab"
              >
                {attachment.file_name}
              </button>
              <Badge color="gray" size="xs">{getKindLabel(attachment)}</Badge>
            </div>
            <p className="mt-0.5 text-xs font-medium text-gray-500">{formatDate(attachment.uploaded_at)} · {formatFileSize(attachment.file_size)}</p>
          </div>
          <div className="flex shrink-0 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex h-6 w-6 shrink-0 items-center justify-end p-0">
                  <RiMore2Line className="size-4 text-gray-500" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-36">
                <DropdownMenuItem onClick={() => setExtractConfirm({ type: "lab", attachmentId: id, fileName: attachment.file_name })}>
                  <DropdownMenuIconWrapper className="mr-2">
                    <RiQuillPenAiLine className="size-4" />
                  </DropdownMenuIconWrapper>
                  Extract with AI
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(attachment.file_url, "_blank")}>
                  <DropdownMenuIconWrapper className="mr-2">
                    <RiEyeLine className="size-4" />
                  </DropdownMenuIconWrapper>
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(attachment.file_url, "_blank")}>
                  <DropdownMenuIconWrapper className="mr-2">
                    <RiDownloadLine className="size-4" />
                  </DropdownMenuIconWrapper>
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDeleteConfirm({ id, fileName: attachment.file_name })} className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400">
                  <DropdownMenuIconWrapper className="mr-2">
                    <RiDeleteBinLine className="size-4" />
                  </DropdownMenuIconWrapper>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Full-width separator + compact collapsible row */}
        <div className="w-full border-t border-gray-200 dark:border-gray-800">
            <button
            type="button"
            onClick={() => toggleCardLower(id)}
            className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left bg-gray-50 dark:bg-gray-800/30"
            aria-label={expandedCardIds.has(id) ? "Collapse" : "Expand"}
          >
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Lab results</span>
            <RiArrowDownSLine className={cx("size-4 shrink-0 text-gray-500 transition-transform dark:text-gray-400", expandedCardIds.has(id) && "rotate-180")} />
          </button>
        </div>
        {/* Expanded content */}
        <div className={cx("bg-gray-50/50 dark:bg-gray-900/20", !expandedCardIds.has(id) && "border-t border-gray-200 dark:border-gray-800")}>
          {expandedCardIds.has(id) && (
            <div className="pb-4 pt-0">
              {hasExtracted ? (
                <>
                  <div className="w-full min-w-0 overflow-x-auto">
                    <table className="w-full min-w-0 table-fixed text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="w-[40%] ps-4 pe-3 py-2 text-start text-xs font-bold lowercase tracking-widest text-gray-400 dark:text-gray-500">{t.table.test}</th>
                          <th className="w-[30%] px-3 py-2 text-start text-xs font-bold lowercase tracking-widest text-gray-400 dark:text-gray-500">{t.table.value}</th>
                          <th className="w-[20%] px-3 py-2 text-start text-xs font-bold lowercase tracking-widest text-gray-400 dark:text-gray-500">{t.table.status}</th>
                          <th className="w-9 shrink-0 ps-2 pe-4 py-2 text-end text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500" aria-label={t.table.actions} />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {results.map((result) => (
                          <tr key={result.id}>
                            <td className="min-w-0 ps-4 pe-3 py-2.5">
                              {editingId === result.id ? (
                                <Input value={editValues.test_name ?? ""} onChange={(e) => setEditValues({ ...editValues, test_name: e.target.value })} className="h-7 text-xs" />
                              ) : (
                                <div className="truncate text-xs font-semibold text-gray-900 dark:text-gray-50" title={result.test_name}>{result.test_name}</div>
                              )}
                            </td>
                            <td className="min-w-0 px-3 py-2.5">
                              {editingId === result.id ? (
                                <div className="flex items-center gap-1">
                                  <Input value={editValues.value ?? ""} onChange={(e) => setEditValues({ ...editValues, value: e.target.value })} className="h-7 w-16 text-xs" />
                                  <span className="text-xs text-gray-500">{result.unit}</span>
                                </div>
                              ) : (
                                <div className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">
                                  {result.value} <span className="ml-0.5 font-normal text-gray-500">{result.unit}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={cx("text-xs font-bold uppercase tracking-wider", getStatusColor(result.status))}>{result.status}</span>
                            </td>
                            <td className="ps-2 pe-4 py-2.5 text-end align-middle">
                              {editingId === result.id ? (
                                <div className="flex items-center justify-end gap-0.5">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleSave}><RiSaveLine className="size-3.5" /></Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCancel}><RiCloseLine className="size-3.5" /></Button>
                                </div>
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label="Row actions">
                                      <RiMore2Line className="size-4 text-gray-500 dark:text-gray-400" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="min-w-32">
                                    <DropdownMenuItem onClick={() => handleEdit(result)}>
                                      <DropdownMenuIconWrapper className="mr-2">
                                        <RiEditLine className="size-4" />
                                      </DropdownMenuIconWrapper>
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(result.id)} className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400">
                                      <DropdownMenuIconWrapper className="mr-2">
                                        <RiDeleteBinLine className="size-4" />
                                      </DropdownMenuIconWrapper>
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 flex justify-end px-4">
                    <Button variant="link" className="text-[9px] font-medium" onClick={() => handleAddTest(id)}>
                      <RiAddLine className="mr-1 size-3" /> Add Test
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center dark:border-gray-800 dark:bg-gray-900/30">
                  <RiQuillPenAiLine className="size-10 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden />
                  <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">No lab results extracted yet</p>
                  <p className="mt-1 text-xs text-gray-500">Extract lab results from this file with AI to get started.</p>
                  <Button variant="primary" size="sm" onClick={() => setExtractConfirm({ type: "lab", attachmentId: id, fileName: attachment.file_name })} className="mt-4 gap-1.5">
                    <RiQuillPenAiLine className="size-4" /> Extract with AI
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderScanOrDocCard = (attachment: Attachment) => {
    const id = attachment.id
    const kind = getKind(attachment)
    const isScan = kind === "scan"
    const isEcg = kind === "ecg"
    const isDocument = kind === "document"
    const displayScanText = (isScan || isEcg) ? getDisplayScanText(id) : undefined
    const displayDocumentText = isDocument ? getDisplayDocumentText(id) : undefined
    const hasExpandableArea = isScan || isEcg || isDocument

    return (
      <div key={id} className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        {/* Top row: content left, dropdown right */}
        <div className="flex gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => window.open(attachment.file_url, "_blank")}
                className="max-w-full truncate text-left text-sm font-semibold text-gray-900 hover:text-primary-600 hover:underline dark:text-gray-50 dark:hover:text-primary-400"
                title="View in new tab"
              >
                {attachment.file_name}
              </button>
              <Badge color="gray" size="xs">{getKindLabel(attachment)}</Badge>
            </div>
            <p className="mt-0.5 text-xs font-medium text-gray-500">{formatDate(attachment.uploaded_at)} · {formatFileSize(attachment.file_size)}</p>
          </div>
          <div className="flex shrink-0 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex h-6 w-6 shrink-0 items-center justify-end p-0">
                  <RiMore2Line className="size-4 text-gray-500" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-36">
                <DropdownMenuItem onClick={() => setExtractConfirm({ type: isEcg ? "ecg" : isScan ? "scan" : "document", attachmentId: id, fileName: attachment.file_name })}>
                  <DropdownMenuIconWrapper className="mr-2">
                    <RiQuillPenAiLine className="size-4" />
                  </DropdownMenuIconWrapper>
                  Extract with AI
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(attachment.file_url, "_blank")}>
                  <DropdownMenuIconWrapper className="mr-2">
                    <RiEyeLine className="size-4" />
                  </DropdownMenuIconWrapper>
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(attachment.file_url, "_blank")}>
                  <DropdownMenuIconWrapper className="mr-2">
                    <RiDownloadLine className="size-4" />
                  </DropdownMenuIconWrapper>
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDeleteConfirm({ id, fileName: attachment.file_name })} className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400">
                  <DropdownMenuIconWrapper className="mr-2">
                    <RiDeleteBinLine className="size-4" />
                  </DropdownMenuIconWrapper>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Full-width separator + compact collapsible row */}
        {hasExpandableArea && (
          <div className="w-full border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => toggleCardLower(id)}
              className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left bg-gray-50 dark:bg-gray-800/30"
              aria-label={expandedCardIds.has(id) ? "Collapse" : "Expand"}
            >
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{isScan || isEcg ? "AI note" : "AI summary"}</span>
              <RiArrowDownSLine className={cx("size-4 shrink-0 text-gray-500 transition-transform dark:text-gray-400", expandedCardIds.has(id) && "rotate-180")} />
            </button>
          </div>
        )}
        {/* Expanded content for scan and document */}
        {hasExpandableArea && expandedCardIds.has(id) && (
          <div className="bg-gray-50/50 px-4 pb-4 pt-3 dark:bg-gray-900/20">
            {isScan || isEcg ? (
              displayScanText ? (
                <div className="rounded-r-lg border-l-4 border-l-primary-500 dark:border-l-primary-400 border border-gray-200/40 dark:border-gray-600/40 bg-gray-50/80 dark:bg-gray-800/30 py-3 pl-3 pr-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">AI extracted note</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{displayScanText}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center dark:border-gray-800 dark:bg-gray-900/30">
                  <RiQuillPenAiLine className="size-10 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden />
                  <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">No AI note yet</p>
                  <p className="mt-1 text-xs text-gray-500">Extract findings from this scan with AI to get started.</p>
                  <Button variant="primary" size="sm" onClick={() => setExtractConfirm({ type: isEcg ? "ecg" : "scan", attachmentId: id, fileName: attachment.file_name })} className="mt-4 gap-1.5">
                    <RiQuillPenAiLine className="size-4" /> Extract with AI
                  </Button>
                </div>
              )
            ) : (
              displayDocumentText ? (
                <div className="rounded-r-lg border-l-4 border-l-primary-500 dark:border-l-primary-400 border border-gray-200/40 dark:border-gray-600/40 bg-gray-50/80 dark:bg-gray-800/30 py-3 pl-3 pr-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">AI extracted summary</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{displayDocumentText}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center dark:border-gray-800 dark:bg-gray-900/30">
                  <RiQuillPenAiLine className="size-10 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden />
                  <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">No AI summary yet</p>
                  <p className="mt-1 text-xs text-gray-500">Extract a summary from this document with AI to get started.</p>
                  <Button variant="primary" size="sm" onClick={() => setExtractConfirm({ type: "document", attachmentId: id, fileName: attachment.file_name })} className="mt-4 gap-1.5">
                    <RiQuillPenAiLine className="size-4" /> Extract with AI
                  </Button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    )
  }

  const renderCard = (attachment: Attachment) =>
    getKind(attachment) === "lab" ? renderLabCard(attachment) : renderScanOrDocCard(attachment)

  return (
    <div className="space-y-4">
      {!hasFiles ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-12 dark:border-gray-800 dark:bg-gray-900/30">
          <RiFlaskLine className="size-10 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden />
          <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">No files yet</p>
          <p className="mt-1 text-xs text-gray-500">Upload lab reports, scans, or documents to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleFiles.map(renderCard)}
          {hasMore && (
            <div className="pt-2">
              <Button
                variant="ghost"
                onClick={() => setVisibleCount((c) => c + LOAD_MORE_INCREMENT)}
                className="w-full text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!extractConfirm}
        onClose={() => setExtractConfirm(null)}
        onConfirm={handleExtractConfirm}
        title="Extract with AI"
        description={extractConfirm ? `Read the file and extract a summary?` : ""}
        confirmText="Extract"
        cancelText="Cancel"
        variant="info"
      />

      <ConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            onDeleteAttachment?.(deleteConfirm.id)
            setDeleteConfirm(null)
          }
        }}
        title="Delete file"
        description={deleteConfirm ? `Are you sure you want to delete "${deleteConfirm.fileName}"? This action cannot be undone.` : ""}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}
