"use client"

import { useState, useEffect, useRef } from "react"
import { SearchInput } from "@/components/SearchInput"
import { Label } from "@/components/Label"
import { Button } from "@/components/Button"
import { Alert } from "@/components/Alert"
import { RiUserLine } from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { PatientFormFields, type PatientFormData } from "@/features/patients/PatientFormFields"
import { createPatient } from "@/features/patients/patients.api"
import type { CreatePatientInput } from "@/features/patients/patients.types"

export interface Patient {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
}

interface LeadForSelector {
  id: string
  name: string
  phone: string
  email?: string
}

interface PatientSelectorProps {
  initialPatient?: Patient | null
  /** When passed (e.g. from leads page), lookup by phone: show suggested match or default to new patient with prefilled form */
  lead?: LeadForSelector | null
  onPatientSelect: (patient: Patient | null) => void
  /** When true, only show search (no Existing/New toggle, no create-patient form). */
  searchOnly?: boolean
  showEmail?: boolean
  required?: boolean
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "")
}

export function PatientSelector({
  initialPatient = null,
  lead = null,
  onPatientSelect,
  searchOnly = false,
  showEmail = false,
  required = true,
}: PatientSelectorProps) {
  const t = useAppTranslations()
  const { isDemoMode } = useDemo()
  const [patientMode, setPatientMode] = useState<"existing" | "new">("existing")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [suggestedPatient, setSuggestedPatient] = useState<Patient | null>(null)
  const [isCheckingLeadMatch, setIsCheckingLeadMatch] = useState(false)
  const leadIdRef = useRef<string | null>(null)
  
  // New Patient Form State
  const [newPatientForm, setNewPatientForm] = useState<PatientFormData>({
    first_name: "",
    last_name: "",
    phone: "",
    email: showEmail ? "" : undefined,
    gender: undefined,
    source: undefined,
    source_other: undefined,
    address: undefined,
  })
  const [isCreatingPatient, setIsCreatingPatient] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({})

  // Sync when initialPatient changes (so passed patient shows as selected)
  useEffect(() => {
    if (initialPatient != null) {
      setSelectedPatient(initialPatient)
      setPatientMode("existing")
      setSuggestedPatient(null)
    } else {
      setSelectedPatient(null)
    }
  }, [initialPatient])

  // When lead is passed: lookup patient by phone; if match show suggested, else default to new with prefilled form
  useEffect(() => {
    if (!lead) {
      setSuggestedPatient(null)
      leadIdRef.current = null
      return
    }
    if (leadIdRef.current === lead.id) return
    leadIdRef.current = lead.id
    const digits = normalizePhone(lead.phone)
    if (digits.length < 2) {
      setPatientMode("new")
      const [first = "", ...rest] = lead.name.trim().split(" ")
      setNewPatientForm((prev) => ({
        ...prev,
        first_name: first,
        last_name: rest.join(" ") || "",
        phone: lead.phone,
        email: showEmail ? (lead.email ?? "") : prev.email,
      }))
      return
    }
    setIsCheckingLeadMatch(true)
    fetch(`/api/patients/search?q=${encodeURIComponent(digits)}&demo=${isDemoMode}`)
      .then((res) => res.json())
      .then((data: Patient[]) => {
        const match = data.find((p) => normalizePhone(p.phone) === digits || p.phone.replace(/\D/g, "").includes(digits))
        if (match) {
          setSuggestedPatient(match)
          setPatientMode("existing")
        } else {
          setSuggestedPatient(null)
          setPatientMode("new")
          const [first = "", ...rest] = lead.name.trim().split(" ")
          setNewPatientForm((prev) => ({
            ...prev,
            first_name: first,
            last_name: rest.join(" ") || "",
            phone: lead.phone,
            email: showEmail ? (lead.email ?? "") : prev.email,
          }))
        }
      })
      .catch(() => {
        setSuggestedPatient(null)
        setPatientMode("new")
        const [first = "", ...rest] = lead.name.trim().split(" ")
        setNewPatientForm((prev) => ({
          ...prev,
          first_name: first,
          last_name: rest.join(" ") || "",
          phone: lead.phone,
          email: showEmail ? (lead.email ?? "") : prev.email,
        }))
      })
      .finally(() => setIsCheckingLeadMatch(false))
  }, [lead, isDemoMode, showEmail])

  // Patient Search with Debounce
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(() => {
      searchPatients(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, isDemoMode])

  const searchPatients = async (term: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/patients/search?q=${encodeURIComponent(term)}&demo=${isDemoMode}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleExistingPatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setSearchTerm("")
    setSearchResults([])
    onPatientSelect(patient)
  }

  const handleNewPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    // Validation
    const newErrors: Partial<Record<keyof PatientFormData, string>> = {}
    if (!newPatientForm.first_name.trim()) {
      newErrors.first_name = "First name is required"
    }
    if (!newPatientForm.last_name.trim()) {
      newErrors.last_name = "Last name is required"
    }
    if (!newPatientForm.phone.trim()) {
      newErrors.phone = "Phone is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }

    setIsCreatingPatient(true)
    try {
      // Convert PatientFormData to CreatePatientInput
      const submitData: CreatePatientInput = {
        first_name: newPatientForm.first_name,
        last_name: newPatientForm.last_name,
        phone: newPatientForm.phone,
        email: newPatientForm.email || undefined,
        gender: newPatientForm.gender || undefined,
        source: newPatientForm.source || undefined,
        source_other: newPatientForm.source === "other" ? newPatientForm.source_other : undefined,
        address: newPatientForm.address || undefined,
      }
      
      const createdPatient = await createPatient(submitData)
      
      // Transform to Patient format
      const patient: Patient = {
        id: createdPatient.id,
        first_name: createdPatient.first_name,
        last_name: createdPatient.last_name,
        phone: createdPatient.phone,
        email: createdPatient.email,
      }
      
      setSelectedPatient(patient)
      onPatientSelect(patient)
      
      // Reset form
      setNewPatientForm({
        first_name: "",
        last_name: "",
        phone: "",
        email: showEmail ? "" : undefined,
        gender: undefined,
        source: undefined,
        source_other: undefined,
        address: undefined,
      })
    } catch (error) {
      console.error('Failed to create patient:', error)
      setFormErrors({ phone: "Failed to create patient. Please try again." })
    } finally {
      setIsCreatingPatient(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Patient Mode Selection - only when not searchOnly */}
      {!searchOnly && (
        <div className="flex items-center justify-between gap-4">
          <Label className="text-gray-500 text-sm font-medium">Patient</Label>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setPatientMode("existing")
                setSelectedPatient(null)
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                patientMode === "existing"
                  ? "bg-white text-primary-600 shadow-sm dark:bg-gray-700 dark:text-primary-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Existing
            </button>
            <button
              type="button"
              onClick={() => {
                setPatientMode("new")
                setSelectedPatient(null)
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                patientMode === "new"
                  ? "bg-white text-primary-600 shadow-sm dark:bg-gray-700 dark:text-primary-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              New
            </button>
          </div>
        </div>
      )}

      {/* Selected Patient Display - Redesigned to be compact */}
      {selectedPatient && (
        <div className="flex items-center justify-between rounded-xl border border-primary-100 bg-primary-50/30 p-2.5 dark:border-primary-900/30 dark:bg-primary-900/10">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/20">
              <RiUserLine className="size-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{selectedPatient.phone}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="text-[11px] h-8 px-2.5"
            onClick={() => {
              setSelectedPatient(null)
              setSearchTerm("")
              setSearchResults([])
              onPatientSelect(null)
            }}
          >
            Change
          </Button>
        </div>
      )}

      {/* Existing Patient Search - show when (existing mode or searchOnly) and no selection */}
      {(patientMode === "existing" || searchOnly) && !selectedPatient && (
        <div className="space-y-3">
          <SearchInput
            id="patient-search"
            placeholder={t.patients.searchSelectorPlaceholder}
            value={searchTerm}
            onSearchChange={setSearchTerm}
            loading={isSearching || isCheckingLeadMatch}
            className="h-11 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-xl"
          />

          {/* Suggested match from lead - shown below search when lead has matching patient */}
          {suggestedPatient && !searchTerm && (
            <div className="space-y-1.5 mt-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {t.patients.suggestedMatchFromLead}
              </p>
              <button
                type="button"
                onClick={() => handleExistingPatientSelect(suggestedPatient)}
                className="w-full rounded-xl border border-primary-200 bg-primary-50/50 p-2.5 text-left transition-all hover:border-primary-300 hover:bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20 dark:hover:bg-primary-900/30"
              >
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
                    {suggestedPatient.first_name} {suggestedPatient.last_name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    <span>
                      {suggestedPatient.phone.slice(0, Math.min(4, suggestedPatient.phone.length))}•••
                      {suggestedPatient.phone.slice(-3)}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>Last visit: 2w ago</span>
                  </div>
                </div>
              </button>
            </div>
          )}

          {searchTerm.length >= 2 && searchResults.length > 0 ? (
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1 mt-2">
              {searchResults.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handleExistingPatientSelect(patient)}
                  className="w-full rounded-xl border border-gray-100 bg-white p-2.5 text-left transition-all hover:border-primary-200 hover:bg-primary-50/30 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-primary-800"
                >
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-50">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      <span>
                        {patient.phone.slice(0, Math.min(4, patient.phone.length))}•••
                        {patient.phone.slice(-3)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span>Last visit: 2w ago</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            searchTerm.length >= 2 &&
            !isSearching && (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center dark:border-gray-800 mt-2">
                <p className="text-xs text-gray-500">No patients found</p>
              </div>
            )
          )}
        </div>
      )}

      {/* New Patient Form - only when not searchOnly */}
      {!searchOnly && patientMode === "new" && !selectedPatient && (
        <form onSubmit={handleNewPatientSubmit} className="space-y-4">
          <PatientFormFields
            formData={newPatientForm}
            onChange={setNewPatientForm}
            errors={formErrors}
            showEmail={showEmail}
          />

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={isCreatingPatient}>
              {isCreatingPatient ? "Creating..." : "Create Patient"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
