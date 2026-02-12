"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from "react"
import {
  mockUsers,
  DEFAULT_CURRENT_USER_ID,
  DEFAULT_CURRENT_CLINIC_ID,
  getClinicsForUser,
  getUsersForClinics,
  getMockClinicById,
  type MockUser,
  type MockClinic,
} from "@/data/mock/users-clinics"
import { getBackendType } from "@/lib/api/repository-factory"
import { getClinicsForUser as getClinicsForUserSupabase } from "@/lib/api/subscriptions.api"
import type { ClinicForUser } from "@/lib/api/subscriptions.api"

interface UserClinicContextType {
  currentUser: MockUser
  currentClinic: MockClinic
  role: "doctor" | "assistant" | "manager"
  setCurrentUser: (userId: string) => void
  setCurrentClinic: (clinicId: string) => void
  allUsers: MockUser[]
  allClinics: MockClinic[]
}

const UserClinicContext = createContext<UserClinicContextType | undefined>(
  undefined
)

function toMockClinic(c: ClinicForUser): MockClinic {
  return {
    id: c.id,
    subscription_id: c.subscription_id,
    name: c.name,
    location: c.location,
    address: c.address ?? "",
    phone: c.phone ?? "",
  }
}

function authUserToMockUser(id: string, email: string): MockUser {
  const part = email.split("@")[0] ?? "?"
  return {
    id,
    email,
    full_name: part,
    first_name: part,
    last_name: "",
    role: "doctor",
    avatar_initials: (part[0] ?? "?").toUpperCase(),
  }
}

export function UserClinicProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentUserId, setCurrentUserId] = useState<string>(
    DEFAULT_CURRENT_USER_ID
  )
  const [currentClinicId, setCurrentClinicId] = useState<string>(
    DEFAULT_CURRENT_CLINIC_ID
  )
  const [backendType, setBackendType] = useState<"mock" | "supabase">("mock")
  const [supabaseClinics, setSupabaseClinics] = useState<ClinicForUser[]>([])
  const [supabaseUser, setSupabaseUser] = useState<{ id: string; email: string } | null>(null)

  useEffect(() => {
    setBackendType(getBackendType())
  }, [])

  useEffect(() => {
    if (backendType !== "supabase") return
    let cancelled = false
    async function load() {
      try {
        const { getAuthRepository } = await import("@/lib/api/repository-factory")
        const auth = await getAuthRepository()
        const user = await auth.getCurrentUser()
        if (cancelled || !user) return
        setSupabaseUser({ id: user.id, email: user.email })
        const clinics = await getClinicsForUserSupabase(user.id)
        if (!cancelled) {
          setSupabaseClinics(clinics)
          const savedClinicId = localStorage.getItem("currentClinicId")
          const allowed = clinics.map((c) => c.id)
          if (savedClinicId && allowed.includes(savedClinicId)) {
            setCurrentClinicId(savedClinicId)
          } else if (clinics.length > 0) {
            setCurrentClinicId(clinics[0].id)
            localStorage.setItem("currentClinicId", clinics[0].id)
          }
        }
      } catch {
        if (!cancelled) setSupabaseClinics([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [backendType])

  const isSupabase = backendType === "supabase"
  const mockCurrentUser =
    mockUsers.find((u) => u.id === currentUserId) || mockUsers[0]
  const mockAllowedClinics = useMemo(
    () => getClinicsForUser(currentUserId),
    [currentUserId]
  )
  const mockAllUsers = useMemo(
    () => getUsersForClinics(mockAllowedClinics.map((c) => c.id)),
    [mockAllowedClinics]
  )

  const currentUser = isSupabase && supabaseUser
    ? authUserToMockUser(supabaseUser.id, supabaseUser.email)
    : mockCurrentUser
  const allowedClinics = isSupabase
    ? supabaseClinics.map(toMockClinic)
    : mockAllowedClinics
  const allUsers = isSupabase ? [] : mockAllUsers

  const currentClinic = useMemo(() => {
    const clinic = isSupabase
      ? allowedClinics.find((c) => c.id === currentClinicId)
      : getMockClinicById(currentClinicId)
    const isAllowed = allowedClinics.some((c) => c.id === currentClinicId)
    if (clinic && isAllowed) return clinic
    return allowedClinics[0] ?? (getMockClinicById(DEFAULT_CURRENT_CLINIC_ID) as MockClinic)
  }, [currentClinicId, allowedClinics, isSupabase])

  // Load from localStorage on mount (mock only); validate clinic belongs to user
  useEffect(() => {
    if (backendType !== "mock") return
    const savedUserId = localStorage.getItem("currentUserId")
    const savedClinicId = localStorage.getItem("currentClinicId")
    if (savedUserId) setCurrentUserId(savedUserId)
    if (savedClinicId) {
      const allowed = getClinicsForUser(savedUserId || currentUserId)
      const isAllowed = allowed.some((c) => c.id === savedClinicId)
      if (isAllowed) {
        setCurrentClinicId(savedClinicId)
      } else if (allowed.length > 0) {
        setCurrentClinicId(allowed[0].id)
        localStorage.setItem("currentClinicId", allowed[0].id)
      }
    }
  }, [backendType])

  const setCurrentUser = (userId: string) => {
    if (isSupabase) return
    setCurrentUserId(userId)
    localStorage.setItem("currentUserId", userId)
    window.location.reload()
  }

  const setCurrentClinic = (clinicId: string) => {
    if (!allowedClinics.some((c) => c.id === clinicId)) return
    setCurrentClinicId(clinicId)
    localStorage.setItem("currentClinicId", clinicId)
  }

  return (
    <UserClinicContext.Provider
      value={{
        currentUser,
        currentClinic,
        role: currentUser.role,
        setCurrentUser,
        setCurrentClinic,
        allUsers,
        allClinics: allowedClinics,
      }}
    >
      {children}
    </UserClinicContext.Provider>
  )
}

export function useUserClinic() {
  const context = useContext(UserClinicContext)
  if (context === undefined) {
    throw new Error("useUserClinic must be used within a UserClinicProvider")
  }
  return context
}
