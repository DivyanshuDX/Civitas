import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Get the user ID from cookies or session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user ID from session or use a placeholder for development
    // In production, you should properly validate the session
    let userId
    try {
      // Try to parse the session cookie
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value))
      userId = sessionData.user?.id
    } catch (e) {
      console.error("Error parsing session cookie:", e)
    }

    if (!userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { address, blockchain_type = "algorand", is_primary = true } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // If is_primary is true, set all other addresses to not primary
    if (is_primary) {
      await supabase
        .from("user_blockchain_accounts")
        .update({ is_primary: false })
        .eq("user_id", userId)
        .eq("blockchain_type", blockchain_type)
    }

    // Insert or update the user-address mapping
    const { data, error } = await supabase.from("user_blockchain_accounts").upsert(
      {
        user_id: userId,
        address,
        blockchain_type,
        is_primary,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,address" },
    )

    if (error) {
      console.error("Error mapping user to address:", error)
      return NextResponse.json({ error: "Failed to map user to address" }, { status: 500 })
    }

    // Update document_assets with the user_id for any assets owned by this address
    await supabase
      .from("document_assets")
      .update({ user_id: userId })
      .is("user_id", null)
      .eq("blockchain_type", blockchain_type)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in map-user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
