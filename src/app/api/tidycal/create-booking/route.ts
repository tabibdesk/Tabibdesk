import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingTypeId, startsAt, patientId, name, email, phone, isDemo } = body

    // Validate required fields
    if (!bookingTypeId || !startsAt || !patientId || !name || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (isDemo || bookingTypeId?.toString().startsWith("demo")) {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Return mock booking confirmation
      return NextResponse.json({
        success: true,
        booking: {
          id: `demo-booking-${Date.now()}`,
          starts_at: startsAt,
          booking_type_id: bookingTypeId,
          patient_id: patientId,
          name,
          email,
          phone,
          status: "confirmed",
          created_at: new Date().toISOString(),
        },
      })
    }

    // Live mode: Create booking in TidyCal
    const response = await fetch("https://tidycal.com/api/bookings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TIDYCAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_type_id: bookingTypeId,
        starts_at: startsAt,
        name,
        email,
        phone,
        metadata: {
          patient_id: patientId,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to create booking")
    }

    // TODO: Optionally save to local database
    // await supabase.from('appointments').insert({
    //   patient_id: patientId,
    //   scheduled_at: startsAt,
    //   booking_type_id: bookingTypeId,
    //   tidycal_booking_id: data.id,
    //   status: 'scheduled'
    // })

    return NextResponse.json({ success: true, booking: data })
  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create booking" },
      { status: 500 }
    )
  }
}

