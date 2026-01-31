// Demo mode constants and base entities

export const DEMO_DOCTOR_ID = "demo-doctor-001"
export const DEMO_CLINIC_ID = "demo-clinic-001"

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

export const mockClinic = {
  id: DEMO_CLINIC_ID,
  name: "TabibDesk Wellness Center",
  address: "123 Medical Street, Cairo, Egypt",
  location: "Downtown Cairo",
  phone: "+20 123 456 7890",
  created_at: new Date().toISOString(),
  tidycal_booking_type_id: "demo-booking-type",
}

export const mockDoctors = [mockDoctor]
