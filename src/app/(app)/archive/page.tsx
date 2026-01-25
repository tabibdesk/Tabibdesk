"use client"

import { ArchivePage } from "@/features/archive/ArchivePage"
import { useUserClinic } from "@/contexts/user-clinic-context"

export default function ArchivePageRoute() {
  const { currentClinic } = useUserClinic()

  return <ArchivePage clinicId={currentClinic.id} />
}
