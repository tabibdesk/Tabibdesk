"use client"

import { Button } from "@/components/Button"
import { Card, CardContent } from "@/components/Card"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { RiUserAddLine } from "@remixicon/react"

interface EmptyPatientsStateProps {
  hasSearchQuery: boolean
  onAddPatient: () => void
}

export function EmptyPatientsState({ hasSearchQuery, onAddPatient }: EmptyPatientsStateProps) {
  const t = useAppTranslations()
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          {hasSearchQuery ? t.patients.noPatientsMatch : t.patients.noPatientsYet}
        </p>
        {!hasSearchQuery && (
          <Button variant="primary" onClick={onAddPatient} className="mt-4 inline-flex items-center gap-2 rtl:flex-row-reverse">
            <RiUserAddLine className="size-4 shrink-0" />
            {t.patients.addFirstPatient}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
