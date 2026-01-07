"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Input } from "@/components/Input"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { RiSearchLine, RiUserAddLine, RiPhoneLine, RiStethoscopeLine, RiPriceTag3Line } from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"
import { mockData } from "@/data/mock/mock-data"

interface Patient {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  age: number | null
  gender: string
  phone: string
  email: string | null
  complaint: string | null
  is_diabetic: boolean | null
  is_hypertensive: boolean | null
  has_gerd: boolean | null
  has_bronchial_asthma: boolean | null
  created_at: string
}

export default function PatientsPage() {
  const { isDemoMode } = useDemo()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode])

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredPatients(filtered)
  }, [searchTerm, patients])

  const fetchPatients = async () => {
    setLoading(true)

    if (isDemoMode) {
      setPatients(mockData.patients)
      setLoading(false)
      return
    }

    // TODO: Fetch from Supabase when integrated
    setPatients([])
    setLoading(false)
  }

  const calculateAge = (dateOfBirth: string | null, ageFromDb: number | null) => {
    if (ageFromDb !== null && ageFromDb !== undefined) {
      return ageFromDb
    }
    if (!dateOfBirth) return "N/A"
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 0 ? age : "N/A"
  }

  const displayPatients = searchTerm ? filteredPatients : patients

  return (
    <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Patients</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {searchTerm
              ? `${filteredPatients.length} patients found`
              : `${patients.length} total patients`}
          </p>
        </div>
        <Link href="/patients/new">
          <Button>
            <RiUserAddLine className="mr-2 size-4" />
            Add Patient
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <Button variant="secondary" onClick={() => setSearchTerm("")} className="mt-2 text-sm">
            Clear search
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Patient Cards Grid */}
          {displayPatients.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayPatients.map((patient) => (
                <Card key={patient.id} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <Link href={`/patients/${patient.id}`}>
                      <CardTitle className="cursor-pointer text-lg text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                        {patient.first_name} {patient.last_name}
                      </CardTitle>
                    </Link>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Badge variant="neutral" className="text-xs">
                        {patient.gender}
                      </Badge>
                      <span className="text-xs">
                        {calculateAge(patient.date_of_birth, patient.age)} years
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <RiPhoneLine className="size-4 shrink-0" />
                      <span>{patient.phone}</span>
                    </div>
                    {patient.complaint && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <RiStethoscopeLine className="mt-0.5 size-4 shrink-0" />
                        <span className="line-clamp-2">{patient.complaint}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      <RiPriceTag3Line className="mt-1 size-4 shrink-0 text-gray-400" />
                      <div className="flex flex-wrap gap-1.5">
                        {patient.is_diabetic && (
                          <Badge variant="warning" className="text-xs">
                            Diabetic
                          </Badge>
                        )}
                        {patient.is_hypertensive && (
                          <Badge variant="error" className="text-xs">
                            Hypertensive
                          </Badge>
                        )}
                        {patient.has_gerd && (
                          <Badge variant="neutral" className="text-xs">
                            GERD
                          </Badge>
                        )}
                        {patient.has_bronchial_asthma && (
                          <Badge variant="neutral" className="text-xs">
                            Asthma
                          </Badge>
                        )}
                        {!patient.is_diabetic && 
                         !patient.is_hypertensive && 
                         !patient.has_gerd && 
                         !patient.has_bronchial_asthma && (
                          <span className="text-xs text-gray-400">No conditions</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? "No patients found matching your search." : "No patients yet."}
                </p>
                {!searchTerm && (
                  <Link href="/patients/new">
                    <Button className="mt-4">
                      <RiUserAddLine className="mr-2 size-4" />
                      Add Your First Patient
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
