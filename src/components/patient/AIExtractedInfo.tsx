"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { RiCheckLine, RiEditLine, RiDeleteBin6Line } from "@remixicon/react"

interface AIExtractedInfoProps {
  initialDiagnosis?: string
  initialSeverity?: string
  clinicalNotes?: string
  onAccept?: (diagnosis: string, severity: string, checklist: Record<string, boolean>) => void
  onDiscard?: () => void
}

const checklistItems = [
  { id: "vitals", label: "Vitals Recorded" },
  { id: "complaint", label: "Chief Complaint" },
  { id: "examination", label: "Physical Examination" },
  { id: "diagnosis", label: "Diagnosis" },
  { id: "treatment", label: "Treatment Plan" },
  { id: "labs", label: "Lab Orders" },
  { id: "followup", label: "Follow-up Scheduled" },
]

export function AIExtractedInfo({
  initialDiagnosis = "",
  initialSeverity = "",
  clinicalNotes = "",
  onAccept,
  onDiscard,
}: AIExtractedInfoProps) {
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis)
  const [severity, setSeverity] = useState(initialSeverity)
  const [isEditing, setIsEditing] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})

  // Auto-check items based on clinical notes
  useEffect(() => {
    if (clinicalNotes) {
      const lowerNotes = clinicalNotes.toLowerCase()
      const autoChecked: Record<string, boolean> = {}

      // Simple keyword detection
      autoChecked.vitals = /vital|bp|blood pressure|temperature|pulse|heart rate/i.test(lowerNotes)
      autoChecked.complaint = /complaint|complain|present|symptom/i.test(lowerNotes)
      autoChecked.examination = /exam|examin|inspect|palpat|auscult/i.test(lowerNotes)
      autoChecked.diagnosis = /diagnos|condition|disease/i.test(lowerNotes)
      autoChecked.treatment = /treat|prescri|medicat|therapy|plan/i.test(lowerNotes)
      autoChecked.labs = /lab|test|blood|urine|x-ray|scan/i.test(lowerNotes)
      autoChecked.followup = /follow.?up|return|revisit|next visit/i.test(lowerNotes)

      setChecklist(autoChecked)
    }
  }, [clinicalNotes])

  const handleAccept = () => {
    onAccept?.(diagnosis, severity, checklist)
    setIsEditing(false)
  }

  const handleApprove = () => {
    setIsApproved(true)
    // TODO: Save approval to backend
    console.log("AI information approved")
  }

  const handleDiscard = () => {
    setDiagnosis("")
    setSeverity("")
    setChecklist({})
    setIsEditing(false)
    setIsApproved(false)
    onDiscard?.()
  }

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          AI Extracted Information
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
          <RiEditLine className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="diagnosis" className="mb-2 block text-sm font-medium">
            Diagnosis
          </Label>
          <Input
            id="diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g., Hypertension"
            disabled={!isEditing}
            className={!isEditing ? "bg-gray-50 dark:bg-gray-900" : ""}
          />
        </div>

        <div>
          <Label htmlFor="severity" className="mb-2 block text-sm font-medium">
            Severity
          </Label>
          <Input
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            placeholder="e.g., Moderate"
            disabled={!isEditing}
            className={!isEditing ? "bg-gray-50 dark:bg-gray-900" : ""}
          />
        </div>
      </div>

      {/* Visit Checklist */}
      <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-800">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-50">
          Visit Checklist
          <span className="ml-2 text-xs font-normal text-gray-500">(Auto-detected from notes)</span>
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {checklistItems.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
            >
              <Checkbox
                checked={checklist[item.id] || false}
                onCheckedChange={() => toggleChecklistItem(item.id)}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAccept}>
            <RiCheckLine className="mr-2 size-4" />
            Accept & Save
          </Button>
        </div>
      )}

      {!isEditing && !isApproved && (
        <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
          <div className="flex gap-2">
            <Button 
              variant="primary" 
              onClick={handleApprove}
              className="flex-1"
            >
              <RiCheckLine className="mr-2 size-4" />
              Approve AI Extracted Information
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDiscard}
            >
              <RiDeleteBin6Line className="mr-2 size-4" />
              Discard
            </Button>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/10">
          <RiCheckLine className="size-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Information Approved
          </span>
        </div>
      )}
    </div>
  )
}

