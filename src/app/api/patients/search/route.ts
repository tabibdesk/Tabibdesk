import { NextRequest, NextResponse } from "next/server"
import { mockData } from "@/data/mock/mock-data"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q") || ""
  const isDemo = searchParams.get("demo") === "true"

  if (isDemo) {
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Filter mock patients
    const results = mockData.patients.filter(
      (p) =>
        p.first_name.toLowerCase().includes(query.toLowerCase()) ||
        p.last_name.toLowerCase().includes(query.toLowerCase()) ||
        p.phone.includes(query)
    )

    return NextResponse.json(results.slice(0, 10))
  }

  // TODO: Query real database
  // const { data } = await supabase
  //   .from('patients')
  //   .select('*')
  //   .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%`)
  //   .limit(10)
  // return NextResponse.json(data)

  return NextResponse.json([])
}

