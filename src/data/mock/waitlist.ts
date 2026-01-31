import { DEMO_CLINIC_ID, DEMO_DOCTOR_ID } from "./constants"

export interface WaitingListEntry {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  patientPhone: string
  requestedDoctorId?: string
  appointmentType?: "new" | "followup" | "online"
  earliestDate?: string
  latestDate?: string
  preferredTimeWindow?: "any" | "morning" | "afternoon" | "evening"
  preferredDays?: string[]
  status: "active" | "offered" | "booked" | "snoozed" | "removed"
  priority: "low" | "normal" | "high"
  notes?: string
  nextActionAt?: string
  createdAt: string
  updatedAt: string
}

export const mockWaitingListEntries: WaitingListEntry[] = [
  {
    id: "waitlist-001",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-001",
    patientName: "Fatima Mohamed",
    patientPhone: "+20 100 1234567",
    requestedDoctorId: DEMO_DOCTOR_ID,
    appointmentType: "followup",
    earliestDate: new Date().toISOString().split("T")[0],
    latestDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    preferredTimeWindow: "morning",
    preferredDays: ["monday", "wednesday", "friday"],
    status: "active",
    priority: "high",
    notes: "Patient prefers morning appointments",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-002",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-002",
    patientName: "Ahmed Abdullah",
    patientPhone: "+20 100 2345678",
    appointmentType: "followup",
    preferredTimeWindow: "afternoon",
    preferredDays: ["tuesday", "thursday"],
    status: "active",
    priority: "normal",
    notes: "Flexible with timing",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-003",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-003",
    patientName: "Layla Ibrahim",
    patientPhone: "+20 100 3456789",
    requestedDoctorId: DEMO_DOCTOR_ID,
    appointmentType: "new",
    preferredTimeWindow: "evening",
    preferredDays: ["monday", "wednesday", "friday"],
    status: "active",
    priority: "normal",
    notes: "Evening appointments preferred",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-004",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-004",
    patientName: "Omar Khalil",
    patientPhone: "+20 100 4567890",
    appointmentType: "online",
    preferredTimeWindow: "any",
    status: "active",
    priority: "low",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-005",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-005",
    patientName: "Mariam Hassan",
    patientPhone: "+20 100 5678901",
    requestedDoctorId: DEMO_DOCTOR_ID,
    appointmentType: "followup",
    earliestDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    latestDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    preferredTimeWindow: "morning",
    preferredDays: ["saturday", "sunday"],
    status: "active",
    priority: "high",
    notes: "Weekend morning preferred",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-006",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-006",
    patientName: "Youssef Ali",
    patientPhone: "+20 100 6789012",
    appointmentType: "new",
    preferredTimeWindow: "afternoon",
    status: "active",
    priority: "normal",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-007",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-007",
    patientName: "Nour Mahmoud",
    patientPhone: "+20 100 7890123",
    appointmentType: "followup",
    preferredTimeWindow: "any",
    preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    status: "offered",
    priority: "normal",
    notes: "Already offered a slot, waiting for response",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "waitlist-008",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-008",
    patientName: "Sara Mohamed",
    patientPhone: "+20 100 8901234",
    requestedDoctorId: DEMO_DOCTOR_ID,
    appointmentType: "online",
    preferredTimeWindow: "evening",
    status: "active",
    priority: "high",
    notes: "Urgent online consultation needed",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Appointment Approval Requests
export interface AppointmentApprovalRequest {
  id: string
  clinicId: string
  patientId: string
  patientName: string
  patientPhone: string
  doctorId?: string
  appointmentType: string
  requestedStartAt: string
  requestedEndAt: string
  source: "integration" | "online_booking"
  status: "pending" | "approved" | "rejected"
  notes?: string
  createdAt: string
}

export const mockApprovalRequests: AppointmentApprovalRequest[] = [
  {
    id: "approval-001",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-009",
    patientName: "Khaled Farid",
    patientPhone: "+20 100 9012345",
    doctorId: DEMO_DOCTOR_ID,
    appointmentType: "new",
    requestedStartAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    requestedEndAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    source: "integration",
    status: "pending",
    notes: "Booked via TidyCal integration",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "approval-002",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-010",
    patientName: "Rania Taha",
    patientPhone: "+20 100 0123456",
    appointmentType: "followup",
    requestedStartAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    requestedEndAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    source: "online_booking",
    status: "pending",
    notes: "Booked via website",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "approval-003",
    clinicId: DEMO_CLINIC_ID,
    patientId: "patient-011",
    patientName: "Tamer Soliman",
    patientPhone: "+20 100 1234567",
    doctorId: DEMO_DOCTOR_ID,
    appointmentType: "online",
    requestedStartAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    requestedEndAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    source: "integration",
    status: "pending",
    notes: "Booked via Calendly integration",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

// Doctor Availability
// Note: 
// - doctorId should match user IDs from users-clinics.ts ("user-001", "user-002")
