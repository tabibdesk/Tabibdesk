"use client"

import { useState } from "react"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Button } from "@/components/Button"
import { RiCheckLine, RiCloseLine, RiDeleteBin6Line } from "@remixicon/react"

interface AIExtractionModalProps {
  isOpen: boolean
  onClose: () => void
  clinicalNotes: string
  onAccept?: (diagnosis: string, severity: string) => void
}

export function AIExtractionModal({
  isOpen,
  onClose,
  clinicalNotes,
  onAccept,
}: AIExtractionModalProps) {
  const [diagnosis, setDiagnosis] = useState("")
  const [severity, setSeverity] = useState("")

  const handleAccept = () => {
    onAccept?.(diagnosis, severity)
    onClose()
  }

  const handleDiscard = () => {
    setDiagnosis("")
    setSeverity("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative w-full max-w-2xl overflow-auto rounded-lg bg-white dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">AI Extracted Information</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RiCloseLine className="size-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Clinical Notes Preview */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Clinical Notes</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {clinicalNotes || "No notes provided"}
            </p>
          </div>

          {/* AI Extracted Fields */}
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
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-2">
            <Button 
              variant="primary" 
              onClick={handleAccept}
              className="flex-1"
            >
              <RiCheckLine className="mr-2 size-4" />
              Accept & Apply
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
      </div>
    </div>
  )
}

