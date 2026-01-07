"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { RiSyringeLine, RiAddLine, RiCalendarLine, RiArrowRightLine } from "@remixicon/react"

interface Injection {
  id: string
  patient_id: string
  medication_name: string
  dose: string
  injection_date: string
  next_suggested_date: string | null
  next_suggested_dose: string | null
  notes: string | null
  appointment_id: string | null
}

interface InjectionsTabProps {
  injections: Injection[]
  onAddInjection?: () => void
}

export function InjectionsTab({ injections, onAddInjection }: InjectionsTabProps) {
  // Sort injections by date (newest first)
  const sortedInjections = [...injections].sort(
    (a, b) => new Date(b.injection_date).getTime() - new Date(a.injection_date).getTime()
  )

  const isUpcoming = (dateString: string | null) => {
    if (!dateString) return false
    return new Date(dateString) > new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Injections History</h2>
        <Button onClick={onAddInjection}>
          <RiAddLine className="mr-2 size-4" />
          Add Injection
        </Button>
      </div>

      {sortedInjections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RiSyringeLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">No injections recorded yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedInjections.map((injection) => (
            <Card key={injection.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{injection.medication_name}</CardTitle>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(injection.injection_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant="default">{injection.dose}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {injection.notes && (
                  <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{injection.notes}</p>
                  </div>
                )}

                {injection.next_suggested_date && (
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <RiCalendarLine className="size-5 text-primary-600 dark:text-primary-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          Next Suggested
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(injection.next_suggested_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {injection.next_suggested_dose && ` • ${injection.next_suggested_dose}`}
                        </p>
                      </div>
                    </div>
                    {isUpcoming(injection.next_suggested_date) && (
                      <Badge variant="warning">Upcoming</Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Timeline Summary */}
      {sortedInjections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedInjections.slice(0, 5).map((injection, index) => (
                <div key={injection.id} className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
                    <RiSyringeLine className="size-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {injection.medication_name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(injection.injection_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="neutral">{injection.dose}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

