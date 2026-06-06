import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const organizationId = searchParams.get("organizationId")
    const status = searchParams.get("status")

    if (!userId && !organizationId) {
      return NextResponse.json({ error: "Either userId or organizationId is required" }, { status: 400 })
    }

    // Build query
    let query = supabase.from("document_consents").select(`
        *,
        organizations(id, name),
        document_assets(id, document_type, asset_id, asset_name, asset_unit_name)
      `)

    // Apply filters
    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (organizationId) {
      query = query.eq("organization_id", organizationId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    // Order by created_at (newest first)
    query = query.order("created_at", { ascending: false })

    // Execute query
    const { data, error } = await query

    if (error) {
      console.error("Error fetching consents:", error)
      return NextResponse.json({ error: "Failed to fetch consents" }, { status: 500 })
    }

    // Format response
    const formattedConsents = data.map((consent) => ({
      id: consent.id,
      organization_id: consent.organization_id,
      organization_name: consent.organizations?.name || "Unknown Organization",
      document_asset_id: consent.document_asset_id,
      document_type: consent.document_assets?.document_type || "Unknown",
      asset_name: consent.document_assets?.asset_name || "Unknown Document",
      purpose: consent.purpose,
      status: consent.status,
      created_at: consent.created_at,
      expiry_date: consent.expiry_date,
      revoked_at: consent.revoked_at,
      transaction_hash: consent.transaction_hash,
    }))

    return NextResponse.json(formattedConsents)
  } catch (error) {
    console.error("Error in consents API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
