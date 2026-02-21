"use client"

import { Button } from "@/components/Button"
import { PageHeader } from "@/components/shared/PageHeader"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useDebounce } from "@/lib/useDebounce"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { createPatient, listPatients } from "./patients.api"
import { AddPatientDrawer } from "./AddPatientDrawer"
import { EmptyPatientsState } from "./EmptyPatientsState"
import { PatientsCards } from "./PatientsCards"
import { PatientsSkeleton } from "./PatientsSkeleton"
import { PatientsToolbar } from "./PatientsToolbar"
import { PatientsHeader } from "./components/PatientsHeader"
import type { CreatePatientInput, PatientListItem, PatientStatus } from "./patients.types"
import { useToast } from "@/hooks/useToast"

const PAGE_SIZE = 10

export function PatientsPage() {
  const t = useAppTranslations()
  const router = useRouter()
  const { showToast } = useToast()
  const { currentClinic } = useUserClinic()
  const [patients, setPatients] = useState<PatientListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [showAddDrawer, setShowAddDrawer] = useState(false)
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active")

  const debouncedSearch = useDebounce(searchQuery, 300)

  // Determine status filter based on active tab
  const statusFilter: PatientStatus = activeTab === "active" ? "active" : "inactive"

  useEffect(() => {
    setPage(1)
    fetchPatients(1, debouncedSearch, statusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, activeTab, currentClinic?.id])

  const fetchPatients = async (pageNum: number, query?: string, status?: PatientStatus) => {
    setLoading(true)
    try {
      const response = await listPatients({
        page: pageNum,
        pageSize: PAGE_SIZE,
        query: query || undefined,
        status: status,
        clinicId: currentClinic?.id,
      })
      if (pageNum === 1) {
        setPatients(response.patients)
      } else {
        setPatients((prev) => [...prev, ...response.patients])
      }
      setHasMore(response.hasMore)
      setTotal(response.total)
      setPage(pageNum)
    } catch (error) {
      // For initial load (page 1), treat errors as empty results (common for new accounts)
      // For subsequent pages, show error toast
      if (pageNum === 1) {
        setPatients([])
        setHasMore(false)
        setTotal(0)
      } else {
        showToast("Failed to load more patients", "error")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPatients(page + 1, debouncedSearch, statusFilter)
    }
  }

  const handleAddPatient = async (data: CreatePatientInput) => {
    try {
      const newPatient = await createPatient(data)
      showToast("Patient created successfully", "success")
      // Refresh the list
      setSearchQuery("")
      await fetchPatients(1, "", statusFilter)
      // Navigate to the new patient profile
      router.push(`/patients/${newPatient.id}`)
    } catch (error) {
      showToast("Failed to create patient", "error")
    }
  }

  const filteredCount = searchQuery ? patients.length : total

  return (
    <div className="page-content">
      <PageHeader title={t.patients.title} />
      <PatientsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <PatientsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalPatients={total}
        filteredCount={filteredCount}
        onAddPatient={() => setShowAddDrawer(true)}
      />

      {loading && patients.length === 0 ? (
        <PatientsSkeleton />
      ) : patients.length === 0 ? (
        <EmptyPatientsState
          hasSearchQuery={!!searchQuery}
          onAddPatient={() => setShowAddDrawer(true)}
        />
      ) : (
        <>
          <PatientsCards patients={patients} />

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
                className="min-w-[140px]"
              >
                {loading && page > 1 ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t.common.loadMore}
                  </span>
                ) : (
                  t.common.loadMore
                )}
              </Button>
            </div>
          )}
        </>
      )}

      <AddPatientDrawer
        open={showAddDrawer}
        onOpenChange={setShowAddDrawer}
        onSubmit={handleAddPatient}
      />
    </div>
  )
}
