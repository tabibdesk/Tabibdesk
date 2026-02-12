import type { Activity } from "@/types/activity"

export interface CreateActivityPayload {
  clinic_id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  metadata?: Record<string, any>
}

export interface IActivityRepository {
  list(clinicId: string, limit?: number): Promise<Activity[]>
  create(payload: CreateActivityPayload): Promise<Activity>
  getByResource(resourceType: string, resourceId: string): Promise<Activity[]>
}
