import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const bookingTypeId = searchParams.get("bookingTypeId")
  const isDemo = searchParams.get("demo") === "true"

  if (isDemo || bookingTypeId?.startsWith("demo")) {
    // Generate next 30 weekdays (excluding weekends)
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const dates: { date: string }[] = []
    const current = new Date()
    
    while (dates.length < 30) {
      current.setDate(current.getDate() + 1)
      const dayOfWeek = current.getDay()
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push({ date: current.toISOString().split("T")[0] })
      }
    }
    
    return NextResponse.json(dates)
  }

  // Live mode: Fetch from TidyCal API
  try {
    const now = new Date()
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const response = await fetch(
      `https://tidycal.com/api/booking-types/${bookingTypeId}/timeslots?starts_at=${now.toISOString()}&ends_at=${endDate.toISOString()}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TIDYCAL_API_KEY}`,
        },
      }
    )

    const data = await response.json()
    
    // Extract unique dates from timeslots
    const dates = data.data.map((slot: any) => slot.starts_at.split("T")[0])
    const uniqueDates = Array.from(new Set(dates))
    
    return NextResponse.json(uniqueDates.map((date) => ({ date })))
  } catch (error) {
    console.error("TidyCal API error:", error)
    return NextResponse.json({ error: "Failed to fetch available dates" }, { status: 500 })
  }
}

