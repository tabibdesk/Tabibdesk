/**
 * Appointment Approvals API - handles integration booking requests requiring approval
 * Currently uses mock data, but structured for easy backend replacement
 */

import { mockData } from "@/data/mock/mock-data"
import type { AppointmentApprovalRequest } from "./waitlist.types"

export interface ListPendingApprovalsParams {
  clinicId: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface ApproveAppointmentPayload {
  requestId: string
  // Optional: override the requested time
  actualStartAt?: string
  actualEndAt?: string
}

// In-memory store for approval requests (demo mode only)
let approvalRequestsStore: AppointmentApprovalRequest[] = []

// Initialize store from mock data
function initializeStore() {
  if (approvalRequestsStore.length === 0 && mockData.approvalRequests) {
    approvalRequestsStore = [...mockData.approvalRequests]
  }
}

/**
 * List pending approval requests
 */
export async function listPending(
  params: ListPendingApprovalsParams
): Promise<AppointmentApprovalRequest[]> {
  initializeStore()
  const { clinicId, dateRange } = params

  let filtered = approvalRequestsStore.filter(
    (request) => request.clinicId === clinicId && request.status === "pending"
  )

  // Filter by date range if provided
  if (dateRange) {
    filtered = filtered.filter((request) => {
      const requestDate = new Date(request.requestedStartAt)
      const rangeStart = new Date(dateRange.start)
      const rangeEnd = new Date(dateRange.end)
      return requestDate >= rangeStart && requestDate <= rangeEnd
    })
  }

  // Sort by creation date (oldest first)
  filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return filtered
}

/**
 * Approve an appointment request and create the final appointment
 * In a real system, this would create the appointment in the appointments table
 */
export async function approve(payload: ApproveAppointmentPayload): Promise<AppointmentApprovalRequest> {
  initializeStore()
  const { requestId, actualStartAt, actualEndAt } = payload

  const request = approvalRequestsStore.find((r) => r.id === requestId)
  if (!request) {
    throw new Error("Approval request not found")
  }

  if (request.status !== "pending") {
    throw new Error("Request is not pending")
  }

  // Update request status
  const updated = {
    ...request,
    status: "approved" as const,
    requestedStartAt: actualStartAt || request.requestedStartAt,
    requestedEndAt: actualEndAt || request.requestedEndAt,
  }

  const index = approvalRequestsStore.findIndex((r) => r.id === requestId)
  approvalRequestsStore[index] = updated

  // In a real system, create the appointment here
  // For now, we just log it
  console.log(`[Approval] Approved appointment request ${requestId}`, {
    patientId: request.patientId,
    startAt: updated.requestedStartAt,
    endAt: updated.requestedEndAt,
  })

  return updated
}

/**
 * Reject an appointment request
 */
export async function reject(
  requestId: string,
  reason?: string
): Promise<AppointmentApprovalRequest> {
  initializeStore()

  const request = approvalRequestsStore.find((r) => r.id === requestId)
  if (!request) {
    throw new Error("Approval request not found")
  }

  if (request.status !== "pending") {
    throw new Error("Request is not pending")
  }

  // Update request status
  const updated = {
    ...request,
    status: "rejected" as const,
    notes: reason ? `${request.notes || ""}\nRejection reason: ${reason}`.trim() : request.notes,
  }

  const index = approvalRequestsStore.findIndex((r) => r.id === requestId)
  approvalRequestsStore[index] = updated

  console.log(`[Approval] Rejected appointment request ${requestId}`, { reason })

  return updated
}

/**
 * Get approval request by ID
 */
export async function getById(id: string): Promise<AppointmentApprovalRequest | null> {
  initializeStore()
  return approvalRequestsStore.find((r) => r.id === id) || null
}

/**
 * Get count of pending approvals
 */
export async function getPendingCount(clinicId: string): Promise<number> {
  initializeStore()
  return approvalRequestsStore.filter(
    (r) => r.clinicId === clinicId && r.status === "pending"
  ).length
}
