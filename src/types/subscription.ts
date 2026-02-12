/**
 * Subscription and clinic membership types
 * Links: subscription (tenant) → clinics; user ↔ clinic via clinic_members
 */

import type { PlanTier } from "@/features/settings/settings.types"
import type { Role } from "@/features/settings/settings.types"

export type { PlanTier, Role }

export interface Subscription {
  id: string
  plan_tier: PlanTier
  owner_id: string
  status: string
  name?: string
  created_at?: string
  updated_at?: string
}

export interface ClinicMember {
  id?: string
  user_id: string
  clinic_id: string
  role: Role
  invited_by?: string | null
  created_at?: string
  updated_at?: string
}
