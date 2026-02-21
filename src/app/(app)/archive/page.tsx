"use client"

import { Suspense } from "react"
import { PageSkeleton } from "@/components/skeletons"
import { ArchivePage } from "@/features/archive/ArchivePage"
import { useUserClinic } from "@/contexts/user-clinic-context"

function ArchivePageContent() {
  const { currentClinic } = useUserClinic()

  return <ArchivePage clinicId={currentClinic.id} />
}

export default function ArchivePageRoute() {
  return (
    <Suspense
      fallback={
        <div className="page-content">
          <PageSkeleton showHeader contentBlocks={2} />
        </div>
      }
    >
      <ArchivePageContent />
    </Suspense>
  )
}
