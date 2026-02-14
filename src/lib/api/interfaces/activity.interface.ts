import type { ActivityEvent } from "@/types/activity"

export interface CreateActivityPayload {
  clinic_id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  metadata?: Record<string, unknown>
}

export interface IActivityRepository {
  list(clinicId: string, limit?: number): Promise<ActivityEvent[]>
  create(payload: CreateActivityPayload): Promise<ActivityEvent>
  getByResource(resourceType: string, resourceId: string): Promise<ActivityEvent[]>
}
