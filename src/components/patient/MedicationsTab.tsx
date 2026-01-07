"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { RiCapsuleLine, RiAddLine } from "@remixicon/react"

interface Medication {
  id: string
  patient_id: string
  name: string
  status: string
  notes: string | null
  created_at: string
}

interface MedicationsTabProps {
  medications: Medication[]
}

export function MedicationsTab({ medications }: MedicationsTabProps) {
  const activeMedications = medications.filter((m) => m.status === "active")
  const inactiveMedications = medications.filter((m) => m.status !== "active")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Medications</CardTitle>
          <CardDescription>Current medications being taken by the patient</CardDescription>
        </CardHeader>
        <CardContent>
          {activeMedications.length > 0 ? (
            <div className="space-y-3">
              {activeMedications.map((medication) => (
                <div
                  key={medication.id}
                  className="flex items-start justify-between rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-900/20">
                      <RiCapsuleLine className="size-5 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-50">{medication.name}</h4>
                      {medication.notes && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{medication.notes}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        Started: {new Date(medication.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <RiCapsuleLine className="mx-auto size-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-50">No active medications</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Get started by adding a medication.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {inactiveMedications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Medications</CardTitle>
            <CardDescription>Medications that are no longer active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveMedications.map((medication) => (
                <div
                  key={medication.id}
                  className="flex items-start justify-between rounded-lg border border-gray-200 p-4 opacity-60 dark:border-gray-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <RiCapsuleLine className="size-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-50">{medication.name}</h4>
                      {medication.notes && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{medication.notes}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        Started: {new Date(medication.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">{medication.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

