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

function authUserToMockUser(id: string, email: string, fullName?: string, role?: "doctor" | "assistant" | "manager"): MockUser {
  const part = fullName || email.split("@")[0] || "?"
  const firstName = part.split(" ")[0] || part
  const initials = part.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "?"
  return {
    id,
    email,
    full_name: part,
    first_name: firstName,
    last_name: part.split(" ").slice(1).join(" "),
    role: role || "manager",
    avatar_initials: initials,
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
  const [supabaseUser, setSupabaseUser] = useState<{ id: string; email: string; full_name?: string } | null>(null)
  const [userRole, setUserRole] = useState<"doctor" | "assistant" | "manager">("manager")

  useEffect(() => {
    setBackendType(getBackendType())
  }, [])

  useEffect(() => {
    if (backendType !== "supabase") return
    let cancelled = false
    async function load() {
      try {
        const { getAuthRepository } = await import("@/lib/api/repository-factory")
        const { createClient } = await import("@/lib/supabase/client")
        const auth = await getAuthRepository()
        const user = await auth.getCurrentUser()
        if (cancelled || !user) return
        
        // Get full user metadata from Supabase
        const supabase = createClient()
        const { data: { user: fullUser } } = await supabase.auth.getUser()
        const fullName = fullUser?.user_metadata?.full_name || user.email.split("@")[0]
        
        setSupabaseUser({ id: user.id, email: user.email, full_name: fullName })
        const clinics = await getClinicsForUserSupabase(user.id)
        if (!cancelled) {
          setSupabaseClinics(clinics)
          const savedClinicId = localStorage.getItem("currentClinicId")
          const allowed = clinics.map((c) => c.id)
          let targetClinicId = clinics.length > 0 ? clinics[0].id : null
          
          if (savedClinicId && allowed.includes(savedClinicId)) {
            targetClinicId = savedClinicId
            setCurrentClinicId(savedClinicId)
          } else if (clinics.length > 0) {
            setCurrentClinicId(clinics[0].id)
            localStorage.setItem("currentClinicId", clinics[0].id)
          }
          
          // Fetch user role for the current clinic
          if (targetClinicId) {
            const { data: memberData } = await supabase
              .from("clinic_members")
              .select("role")
              .eq("user_id", user.id)
              .eq("clinic_id", targetClinicId)
              .single()
            
            if (memberData?.role) {
              setUserRole(memberData.role as "doctor" | "assistant" | "manager")
            }
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
    ? authUserToMockUser(supabaseUser.id, supabaseUser.email, supabaseUser.full_name, userRole)
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
