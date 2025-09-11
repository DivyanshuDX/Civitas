import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data: schemes, error } = await supabase
      .from("user_schemes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching schemes:", error)
      return NextResponse.json({ error: "Failed to fetch schemes" }, { status: 500 })
    }

    return NextResponse.json({ schemes })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, schemeName, description, category, benefit, eligibility } = body

    if (!userId || !schemeName) {
      return NextResponse.json({ error: "User ID and scheme name are required" }, { status: 400 })
    }

    const { data: scheme, error } = await supabase
      .from("user_schemes")
      .insert([
        {
          user_id: userId,
          scheme_name: schemeName,
          description,
          category,
          benefit,
          eligibility: eligibility || false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating scheme:", error)
      return NextResponse.json({ error: "Failed to create scheme" }, { status: 500 })
    }

    return NextResponse.json({ scheme }, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
