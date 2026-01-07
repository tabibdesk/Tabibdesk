import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const bookingTypeId = searchParams.get("bookingTypeId")
  const date = searchParams.get("date")
  const isDemo = searchParams.get("demo") === "true"

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 })
  }

  if (isDemo || bookingTypeId?.startsWith("demo")) {
    // Generate time slots from 9 AM to 5 PM, 30-minute intervals
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const slots: { starts_at: string; ends_at: string }[] = []
    
    for (let hour = 9; hour < 17; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const starts_at = `${date}T${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:00`
        const endHour = min === 30 ? hour + 1 : hour
        const endMin = min === 30 ? 0 : 30
        const ends_at = `${date}T${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}:00`
        
        slots.push({ starts_at, ends_at })
      }
    }
    
    return NextResponse.json(slots)
  }

  // Live mode: Fetch from TidyCal API
  try {
    const startOfDay = `${date}T00:00:00Z`
    const endOfDay = `${date}T23:59:59Z`
    
    const response = await fetch(
      `https://tidycal.com/api/booking-types/${bookingTypeId}/timeslots?starts_at=${startOfDay}&ends_at=${endOfDay}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TIDYCAL_API_KEY}`,
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data.data || [])
  } catch (error) {
    console.error("TidyCal API error:", error)
    return NextResponse.json({ error: "Failed to fetch time slots" }, { status: 500 })
  }
}

