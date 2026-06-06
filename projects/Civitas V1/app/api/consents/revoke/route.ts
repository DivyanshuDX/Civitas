import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { simulateTransaction } from "@/lib/blockchain"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { consentId, userId, userAddress } = body

    // Validate required fields
    if (!consentId || !userId || !userAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the consent belongs to the user
    const { data: consentData, error: consentError } = await supabase
      .from("document_consents")
      .select("*")
      .eq("id", consentId)
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (consentError || !consentData) {
      console.error("Consent verification error:", consentError)
      return NextResponse.json({ error: "Consent not found or not active" }, { status: 404 })
    }

    // Simulate blockchain transaction
    const transactionData = {
      type: "revokeConsent",
      userAddress,
      consentId,
    }

    const transactionHash = await simulateTransaction(transactionData)
    const now = new Date().toISOString()

    // Update consent record in database
    const { data: updatedConsent, error: updateError } = await supabase
      .from("document_consents")
      .update({
        status: "revoked",
        revoked_at: now,
        transaction_hash: transactionHash,
      })
      .eq("id", consentId)
      .select()

    if (updateError) {
      console.error("Error updating consent record:", updateError)
      return NextResponse.json({ error: "Failed to update consent record" }, { status: 500 })
    }

    // Add to access history
    const { error: historyError } = await supabase.from("access_history").insert({
      id: uuidv4(),
      user_id: userId,
      action: "revoke",
      timestamp: now,
      transaction_hash: transactionHash,
    })

    if (historyError) {
      console.error("Error creating history record:", historyError)
      // Continue anyway, this is not critical
    }

    return NextResponse.json({
      success: true,
      transactionHash,
    })
  } catch (error) {
    console.error("Error revoking consent:", error)
    return NextResponse.json({ error: "Failed to revoke consent" }, { status: 500 })
  }
}
