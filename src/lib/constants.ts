/**
 * Shared application constants and demo entities.
 * Single source of truth for IDs and demo mode data.
 */

export const DEMO_DOCTOR_ID = "demo-doctor-001"
export const DEMO_CLINIC_ID = "demo-clinic-001"
export const DEFAULT_CURRENT_USER_ID = DEMO_DOCTOR_ID
export const DEFAULT_CURRENT_CLINIC_ID = DEMO_CLINIC_ID

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

/** Demo doctor entity (for demo mode and invoice display) */
export const mockDoctor = {
  id: DEMO_DOCTOR_ID,
  email: "demo@tabibdesk.com",
  full_name: "Dr. Ahmed Hassan",
  specialization: "Physical Therapy & Nutrition",
  biography: "Expert in therapeutic exercise and nutritional counseling",
  image_url: "/images/tabibdesk-logo.png",
  role: "doctor",
  doctor_id: DEMO_DOCTOR_ID,
  created_at: new Date().toISOString(),
}

/** Demo clinic entity */
export const mockClinic = {
  id: DEMO_CLINIC_ID,
  name: "TabibDesk Wellness Center",
  address: "123 Medical Street, Cairo, Egypt",
  location: "Downtown Cairo",
  phone: "+20 123 456 7890",
  created_at: new Date().toISOString(),
}

export const mockDoctors = [mockDoctor]
