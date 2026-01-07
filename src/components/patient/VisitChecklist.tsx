"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Checkbox } from "@/components/Checkbox"
import { RiCheckboxCircleLine } from "@remixicon/react"

interface VisitChecklistProps {
  clinicalNotes?: string
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

export function VisitChecklist({ clinicalNotes = "" }: VisitChecklistProps) {
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

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const completedCount = Object.values(checklist).filter(Boolean).length
  const totalCount = checklistItems.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiCheckboxCircleLine className="size-5 text-primary-600 dark:text-primary-400" />
            <CardTitle>Visit Checklist</CardTitle>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {completedCount} / {totalCount} completed
          </span>
        </div>
      </CardHeader>
      <CardContent>
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
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
          Items are auto-detected from clinical notes
        </p>
      </CardContent>
    </Card>
  )
}
