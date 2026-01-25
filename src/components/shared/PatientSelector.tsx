"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Button } from "@/components/Button"
import { Alert } from "@/components/Alert"
import { RiUserLine, RiSearchLine } from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"
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

interface PatientSelectorProps {
  initialPatient?: Patient | null
  onPatientSelect: (patient: Patient) => void
  showEmail?: boolean
  required?: boolean
}

export function PatientSelector({
  initialPatient = null,
  onPatientSelect,
  showEmail = false,
  required = true,
}: PatientSelectorProps) {
  const { isDemoMode } = useDemo()
  const [patientMode, setPatientMode] = useState<"existing" | "new">("existing")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  // New Patient Form State
  const [newPatientForm, setNewPatientForm] = useState<PatientFormData>({
    first_name: "",
    last_name: "",
    phone: "",
    email: showEmail ? "" : undefined,
  })
  const [isCreatingPatient, setIsCreatingPatient] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({})

  // Reset when initialPatient changes
  useEffect(() => {
    if (initialPatient) {
      setSelectedPatient(initialPatient)
      setPatientMode("existing")
    }
  }, [initialPatient])

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
        gender: newPatientForm.gender || undefined,
        date_of_birth: newPatientForm.date_of_birth,
        age: newPatientForm.age,
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
      {/* Patient Mode Selection */}
      <div>
        <Label>Patient Type</Label>
        <div className="mt-3 flex gap-4">
          <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition hover:border-primary-600 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 dark:border-gray-800 dark:has-[:checked]:border-primary-600 dark:has-[:checked]:bg-primary-900/20">
            <input
              type="radio"
              name="patient-mode"
              value="existing"
              checked={patientMode === "existing"}
              onChange={() => {
                setPatientMode("existing")
                setSelectedPatient(null)
              }}
              className="size-4 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-50">Existing Patient</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Search from patient database</p>
            </div>
          </label>
          
          <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition hover:border-primary-600 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 dark:border-gray-800 dark:has-[:checked]:border-primary-600 dark:has-[:checked]:bg-primary-900/20">
            <input
              type="radio"
              name="patient-mode"
              value="new"
              checked={patientMode === "new"}
              onChange={() => {
                setPatientMode("new")
                setSelectedPatient(null)
              }}
              className="size-4 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-50">New Patient</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create a new patient record</p>
            </div>
          </label>
        </div>
      </div>

      {/* Selected Patient Display */}
      {selectedPatient && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
              <RiUserLine className="size-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-50">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPatient.phone}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedPatient(null)
              setSearchTerm("")
              setSearchResults([])
            }}
          >
            Change
          </Button>
        </div>
      )}

      {/* Existing Patient Search */}
      {patientMode === "existing" && !selectedPatient && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="patient-search">
              Search Patient {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative mt-2">
              <Input
                id="patient-search"
                placeholder="Type patient name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"></div>
                </div>
              )}
              {!isSearching && searchTerm && (
                <RiSearchLine className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              )}
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
              {searchResults.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handleExistingPatientSelect(patient)}
                  className="w-full rounded-lg border border-transparent p-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
                      <RiUserLine className="size-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-50">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {patient.phone} {patient.email && `• ${patient.email}`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && (
            <Alert variant="default">
              No patients found matching &quot;{searchTerm}&quot;
            </Alert>
          )}
        </div>
      )}

      {/* New Patient Form */}
      {patientMode === "new" && !selectedPatient && (
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
