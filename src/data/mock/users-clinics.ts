// Mock users and clinics data
// Users: 2 doctors and 1 assistant with English names
// Clinics: 3 clinics with Egyptian locations (clinic name is called by location)

import type { Subscription, ClinicMember } from "@/types/subscription"

export interface MockUser {
  id: string
  email: string
  full_name: string
  first_name: string
  last_name: string
  role: "doctor" | "assistant" | "manager"
  specialization?: string
  avatar_initials: string
  isManager?: boolean
}

export interface MockClinic {
  id: string
  subscription_id: string
  name: string // Name is the location
  location: string
  address: string
  phone: string
}

// Mock Users
export const mockUsers: MockUser[] = [
  {
    id: "user-001",
    email: "ahmed.hassan@tabibdesk.com",
    full_name: "Ahmed Hassan",
    first_name: "Ahmed",
    last_name: "Hassan",
    role: "doctor",
    specialization: "Physical Therapy & Nutrition",
    avatar_initials: "AH",
  },
  {
    id: "user-002",
    email: "fatima.ali@tabibdesk.com",
    full_name: "Fatima Ali",
    first_name: "Fatima",
    last_name: "Ali",
    role: "doctor",
    specialization: "Internal Medicine",
    avatar_initials: "FA",
  },
  {
    id: "user-003",
    email: "mariam.mohamed@tabibdesk.com",
    full_name: "Mariam Mohamed",
    first_name: "Mariam",
    last_name: "Mohamed",
    role: "assistant",
    avatar_initials: "MM",
  },
  {
    id: "user-004",
    email: "sara.ibrahim@tabibdesk.com",
    full_name: "Sara Ibrahim",
    first_name: "Sara",
    last_name: "Ibrahim",
    role: "manager",
    avatar_initials: "SI",
  },
]

// Mock Subscriptions (one subscription owned by manager user-004)
export const mockSubscriptions: Subscription[] = [
  {
    id: "sub-001",
    plan_tier: "multi",
    owner_id: "user-004",
    status: "active",
    name: "TabibDesk Demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock Clinics (name is the location); each belongs to sub-001
export const mockClinics: MockClinic[] = [
  {
    id: "clinic-001",
    subscription_id: "sub-001",
    name: "Maadi",
    location: "Maadi",
    address: "Nile Street, Maadi, Cairo, Egypt",
    phone: "+20 2 2750 1234",
  },
  {
    id: "clinic-002",
    subscription_id: "sub-001",
    name: "New Cairo",
    location: "New Cairo",
    address: "90th Street, New Cairo, Cairo, Egypt",
    phone: "+20 2 2274 5678",
  },
  {
    id: "clinic-003",
    subscription_id: "sub-001",
    name: "Sheikh Zayed",
    location: "Sheikh Zayed",
    address: "26th of July Corridor, Sheikh Zayed, Giza, Egypt",
    phone: "+20 2 2735 9012",
  },
]

// Clinic membership: who can access which clinic and with what role
// Manager (user-004) all 3 clinics; doctors (user-001, user-002) all 3; assistant (user-003) clinic-001 and clinic-002 only
export const mockClinicMembers: ClinicMember[] = [
  { id: "cm-001", user_id: "user-004", clinic_id: "clinic-001", role: "manager" },
  { id: "cm-002", user_id: "user-004", clinic_id: "clinic-002", role: "manager" },
  { id: "cm-003", user_id: "user-004", clinic_id: "clinic-003", role: "manager" },
  { id: "cm-004", user_id: "user-001", clinic_id: "clinic-001", role: "doctor" },
  { id: "cm-005", user_id: "user-001", clinic_id: "clinic-002", role: "doctor" },
  { id: "cm-006", user_id: "user-001", clinic_id: "clinic-003", role: "doctor" },
  { id: "cm-007", user_id: "user-002", clinic_id: "clinic-001", role: "doctor" },
  { id: "cm-008", user_id: "user-002", clinic_id: "clinic-002", role: "doctor" },
  { id: "cm-009", user_id: "user-002", clinic_id: "clinic-003", role: "doctor" },
  { id: "cm-010", user_id: "user-003", clinic_id: "clinic-001", role: "assistant" },
  { id: "cm-011", user_id: "user-003", clinic_id: "clinic-002", role: "assistant" },
]

// Get user by ID
export function getMockUserById(userId: string): MockUser | undefined {
  return mockUsers.find((user) => user.id === userId)
}

// Get clinic by ID
export function getMockClinicById(clinicId: string): MockClinic | undefined {
  return mockClinics.find((clinic) => clinic.id === clinicId)
}

// Get subscription by ID
export function getMockSubscriptionById(subId: string): Subscription | undefined {
  return mockSubscriptions.find((s) => s.id === subId)
}

// Get clinics by subscription ID
export function getClinicsBySubscriptionId(subscriptionId: string): MockClinic[] {
  return mockClinics.filter((c) => c.subscription_id === subscriptionId)
}

// Get clinic members by clinic ID
export function getClinicMembersByClinicId(clinicId: string): ClinicMember[] {
  return mockClinicMembers.filter((m) => m.clinic_id === clinicId)
}

// Get clinic members by user ID
export function getClinicMembersByUserId(userId: string): ClinicMember[] {
  return mockClinicMembers.filter((m) => m.user_id === userId)
}

// Get clinics the user is a member of (enforcement: only these are allowed)
export function getClinicsForUser(userId: string): MockClinic[] {
  const memberClinicIds = getClinicMembersByUserId(userId).map((m) => m.clinic_id)
  return mockClinics.filter((c) => memberClinicIds.includes(c.id))
}

// Get subscription for a clinic (for plan tier resolution)
export function getSubscriptionForClinic(clinicId: string): Subscription | undefined {
  const clinic = getMockClinicById(clinicId)
  return clinic ? getMockSubscriptionById(clinic.subscription_id) : undefined
}

// Get user IDs that share at least one clinic with the given user (for restricting allUsers)
export function getUserIdsInSameSubscription(userId: string): string[] {
  const userClinicIds = getClinicMembersByUserId(userId).map((m) => m.clinic_id)
  const userIds = new Set<string>()
  userClinicIds.forEach((clinicId) => {
    getClinicMembersByClinicId(clinicId).forEach((m) => userIds.add(m.user_id))
  })
  return Array.from(userIds)
}

// Get users who are members of at least one of the current user's clinics
export function getUsersForClinics(clinicIds: string[]): MockUser[] {
  const userIds = new Set<string>()
  clinicIds.forEach((clinicId) => {
    getClinicMembersByClinicId(clinicId).forEach((m) => userIds.add(m.user_id))
  })
  return mockUsers.filter((u) => userIds.has(u.id))
}

// Get users by role
export function getMockUsersByRole(role: "doctor" | "assistant" | "manager"): MockUser[] {
  return mockUsers.filter((user) => user.role === role)
}

// Default current user (can be changed via Switch User)
export const DEFAULT_CURRENT_USER_ID = "user-001"
// Default clinic: Maadi (clinic-001)
export const DEFAULT_CURRENT_CLINIC_ID = "clinic-001"
