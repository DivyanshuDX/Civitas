import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // Fetch document assets for the user
    const { data, error } = await supabase.from("document_assets").select("*").eq("user_id", userId)

    if (error) {
      console.error("Error fetching document assets:", error)
      return NextResponse.json({ error: "Failed to fetch document assets" }, { status: 500 })
    }

    // If no assets found, return empty array
    if (!data || data.length === 0) {
      return NextResponse.json([])
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in document assets API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
