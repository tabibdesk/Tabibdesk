// Barrel: re-exports from split mock data modules
// This file preserves backward compatibility for imports from @/data/mock/mock-data

export {
  DEMO_DOCTOR_ID,
  DEMO_CLINIC_ID,
  mockDoctor,
  mockClinic,
  mockDoctors,
} from "./constants"
export { mockPatients } from "./patients"
export type { Patient } from "./patients"
export {
  mockWeightLogs,
  mockInjections,
  mockMedications,
  mockDoctorNotes,
  mockLabFiles,
  mockLabResults,
} from "./medical"
export { mockTasks, mockPatientDiets } from "./tasks-diets"
export {
  mockTranscriptions,
  mockAttachments,
  mockScanExtractions,
} from "./records"
export type { Transcription } from "./records"
export { mockAppointments, mockDoctorAvailability } from "./appointments"
export {
  mockWaitingListEntries,
  mockApprovalRequests,
} from "./waitlist"
export type { WaitingListEntry, AppointmentApprovalRequest } from "./waitlist"
export { mockPrescriptions, mockPastMedications } from "./prescriptions"
export { mockLeads } from "./leads"

import { mockDoctors } from "./constants"
import { mockPatients } from "./patients"
import {
  mockWeightLogs,
  mockInjections,
  mockMedications,
  mockDoctorNotes,
  mockLabFiles,
  mockLabResults,
} from "./medical"
import { mockTasks, mockPatientDiets } from "./tasks-diets"
import {
  mockTranscriptions,
  mockAttachments,
  mockScanExtractions,
} from "./records"
import { mockAppointments, mockDoctorAvailability } from "./appointments"
import { mockWaitingListEntries, mockApprovalRequests } from "./waitlist"
import { mockPrescriptions, mockPastMedications } from "./prescriptions"
import { mockLeads } from "./leads"

export const mockData = {
  doctors: mockDoctors,
  patients: mockPatients,
  appointments: mockAppointments,
  weightLogs: mockWeightLogs,
  injections: mockInjections,
  medications: mockMedications,
  doctorNotes: mockDoctorNotes,
  tasks: mockTasks,
  patientDiets: mockPatientDiets,
  labFiles: mockLabFiles,
  labResults: mockLabResults,
  transcriptions: mockTranscriptions,
  attachments: mockAttachments,
  scanExtractions: mockScanExtractions,
  leads: mockLeads,
  waitingListEntries: mockWaitingListEntries,
  approvalRequests: mockApprovalRequests,
  doctorAvailability: mockDoctorAvailability,
  prescriptions: mockPrescriptions,
  pastMedications: mockPastMedications,
}
