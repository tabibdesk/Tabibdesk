import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const isDemo = searchParams.get("demo") === "true"

  if (isDemo) {
    // Return mock booking types
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    return NextResponse.json([
      {
        id: 1,
        title: "General Consultation",
        description: "Standard consultation for new or existing patients",
        duration_minutes: 30,
        app_clinic_id: null,
        app_doctor_id: null,
        app_appointment_type_id: "consultation",
        app_appointment_type_name: "Consultation",
        app_clinic_name: null,
        app_doctor_name: null,
      },
      {
        id: 2,
        title: "Follow-up Visit",
        description: "Short follow-up appointment for existing patients",
        duration_minutes: 15,
        app_clinic_id: null,
        app_doctor_id: null,
        app_appointment_type_id: "followup",
        app_appointment_type_name: "Follow-up",
        app_clinic_name: null,
        app_doctor_name: null,
      },
      {
        id: 3,
        title: "Comprehensive Check-up",
        description: "Full medical examination and health assessment",
        duration_minutes: 60,
        app_clinic_id: null,
        app_doctor_id: null,
        app_appointment_type_id: "checkup",
        app_appointment_type_name: "Check-up",
        app_clinic_name: null,
        app_doctor_name: null,
      },
      {
        id: 4,
        title: "Procedure Consultation",
        description: "Consultation for medical procedures and treatments",
        duration_minutes: 45,
        app_clinic_id: null,
        app_doctor_id: null,
        app_appointment_type_id: "procedure",
        app_appointment_type_name: "Procedure",
        app_clinic_name: null,
        app_doctor_name: null,
      },
    ])
  }

  // Live mode: Fetch from TidyCal API
  try {
    const response = await fetch("https://tidycal.com/api/booking-types", {
      headers: {
        Authorization: `Bearer ${process.env.TIDYCAL_API_KEY}`,
      },
    })

    const data = await response.json()
    return NextResponse.json(data.data || [])
  } catch (error) {
    console.error("TidyCal API error:", error)
    return NextResponse.json({ error: "Failed to fetch booking types" }, { status: 500 })
  }
}

