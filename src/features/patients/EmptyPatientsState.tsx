"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { RiUserAddLine } from "@remixicon/react"
import { EmptyState } from "@/components/EmptyState"

interface EmptyPatientsStateProps {
  hasSearchQuery: boolean
  onAddPatient: () => void
}

export function EmptyPatientsState({ hasSearchQuery, onAddPatient }: EmptyPatientsStateProps) {
  const t = useAppTranslations()
  return (
    <EmptyState
      icon={RiUserAddLine}
      title={hasSearchQuery ? t.patients.noPatientsMatch : t.patients.noPatientsYet}
      description={!hasSearchQuery ? t.patients.patientsDescription : undefined}
      actionLabel={!hasSearchQuery ? t.patients.addFirstPatient : undefined}
      onAction={!hasSearchQuery ? onAddPatient : undefined}
      actionVariant="secondary"
    />
  )
}
