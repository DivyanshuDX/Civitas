import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organizationId, userAddress, purpose, expiryDate, documentTypes, fields } = body

    console.log("Received request data:", {
      organizationId,
      userAddress,
      purpose,
      expiryDate,
      documentTypes,
      fields,
    })

    // Validate required fields
    if (!organizationId || !userAddress || !purpose || !documentTypes || documentTypes.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // First, get the user_id from algorand_accounts table using the address
    const { data: accountData, error: accountError } = await supabase
      .from("algorand_accounts")
      .select("user_id")
      .eq("address", userAddress)
      .single()

    if (accountError || !accountData) {
      console.error("Error finding user by address:", accountError)
      return NextResponse.json({ error: "User not found with the provided address" }, { status: 404 })
    }

    const userId = accountData.user_id
    console.log("Found user ID:", userId)

    // Create the access request with the document_types column
    const requestObject = {
      organization_id: organizationId,
      user_id: userId,
      purpose: purpose,
      status: "pending",
      expiry_date: expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      document_types: documentTypes,
      required_fields: fields || {},
    }

    console.log("Creating access request with:", requestObject)

    const { data: requestData, error: requestError } = await supabase
      .from("access_requests")
      .insert(requestObject)
      .select()

    if (requestError) {
      console.error("Error creating access request:", requestError)
      return NextResponse.json({ error: `Failed to create access request: ${requestError.message}` }, { status: 500 })
    }

    console.log("Access request created:", requestData)

    // For demo purposes, we'll simulate a blockchain transaction hash
    const transactionHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

    // Update the request with the transaction hash
    const { error: updateError } = await supabase
      .from("access_requests")
      .update({ transaction_hash: transactionHash })
      .eq("id", requestData[0].id)

    if (updateError) {
      console.error("Error updating transaction hash:", updateError)
      // Continue anyway since the request was created
    }

    // Now, let's also create entries in the access_request_documents and access_request_fields tables
    // for better integration with the existing schema
    try {
      for (const docType of documentTypes) {
        // Create an entry in access_request_documents
        const { data: docData, error: docError } = await supabase
          .from("access_request_documents")
          .insert({
            access_request_id: requestData[0].id,
            document_type: docType,
          })
          .select()

        if (docError) {
          console.error(`Error creating document entry for ${docType}:`, docError)
          continue
        }

        // If we have fields for this document type, create entries in access_request_fields
        if (fields && fields[docType] && fields[docType].length > 0) {
          const fieldEntries = fields[docType].map((fieldName) => ({
            access_request_document_id: docData[0].id,
            field_name: fieldName,
          }))

          const { error: fieldsError } = await supabase.from("access_request_fields").insert(fieldEntries)

          if (fieldsError) {
            console.error(`Error creating field entries for ${docType}:`, fieldsError)
          }
        }
      }
    } catch (err) {
      console.error("Error creating related document entries:", err)
      // Continue anyway since the main request was created
    }

    return NextResponse.json({
      success: true,
      requestId: requestData[0].id,
      transactionHash,
    })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
