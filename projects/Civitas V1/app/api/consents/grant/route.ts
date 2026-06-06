import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { simulateTransaction } from "@/lib/blockchain"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, userAddress, organizationId, documentAssetId, purpose, expiryDate } = body

    // Validate required fields
    if (!userId || !userAddress || !organizationId || !documentAssetId || !purpose || !expiryDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the document belongs to the user
    const { data: documentData, error: documentError } = await supabase
      .from("document_assets")
      .select("*")
      .eq("id", documentAssetId)
      .eq("user_id", userId)
      .single()

    if (documentError || !documentData) {
      console.error("Document verification error:", documentError)
      return NextResponse.json({ error: "Document not found or not owned by user" }, { status: 404 })
    }

    // Simulate blockchain transaction
    const transactionData = {
      type: "grantConsent",
      userAddress,
      organizationId,
      documentAssetId,
      purpose,
      expiryDate,
    }

    const transactionHash = await simulateTransaction(transactionData)
    const consentId = uuidv4()

    // Store consent record in database
    const { data: consentData, error: consentError } = await supabase
      .from("document_consents")
      .insert({
        id: consentId,
        user_id: userId,
        organization_id: organizationId,
        document_asset_id: documentAssetId,
        purpose,
        status: "active",
        created_at: new Date().toISOString(),
        expiry_date: expiryDate,
        transaction_hash: transactionHash,
      })
      .select()

    if (consentError) {
      console.error("Error creating consent record:", consentError)
      return NextResponse.json({ error: "Failed to create consent record" }, { status: 500 })
    }

    // Add to access history
    const { error: historyError } = await supabase.from("access_history").insert({
      id: uuidv4(),
      user_id: userId,
      action: "grant",
      timestamp: new Date().toISOString(),
      transaction_hash: transactionHash,
    })

    if (historyError) {
      console.error("Error creating history record:", historyError)
      // Continue anyway, this is not critical
    }

    return NextResponse.json({
      success: true,
      consentId,
      transactionHash,
    })
  } catch (error) {
    console.error("Error granting consent:", error)
    return NextResponse.json({ error: "Failed to grant consent" }, { status: 500 })
  }
}
