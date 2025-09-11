import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get all document assets
    const { data: assets, error: assetsError } = await supabase.from("document_assets").select("*")

    if (assetsError) {
      return NextResponse.json({ error: assetsError.message }, { status: 500 })
    }

    // Get all user blockchain accounts
    const { data: accounts, error: accountsError } = await supabase.from("user_blockchain_accounts").select("*")

    if (accountsError) {
      return NextResponse.json({ error: accountsError.message }, { status: 500 })
    }

    // Get all users
    const { data: users, error: usersError } = await supabase.from("users").select("id, email, user_type")

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    return NextResponse.json({
      assets: assets || [],
      accounts: accounts || [],
      users: users || [],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
