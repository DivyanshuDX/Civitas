import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { requestId, userAddress, grantedFields } = body

    // Validate required fields
    if (!requestId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the request details
    const { data: requestData, error: requestError } = await supabase
      .from("access_requests")
      .select(`
        *,
        access_request_documents (
          document_type,
          access_request_fields (
            field_name
          )
        )
      `)
      .eq("id", requestId)
      .single()

    if (requestError || !requestData) {
      console.error("Error fetching request:", requestError)
      return NextResponse.json({ error: "Access request not found" }, { status: 404 })
    }

    // Generate a unique ID for the access grant
    const grantId = uuidv4()

    // Get the first document type from the request documents
    const firstDocumentType = requestData.access_request_documents?.[0]?.document_type || "aadhar"

    // Create an access grant record
    const { data: grantData, error: grantError } = await supabase
      .from("access_grants")
      .insert([
        {
          id: grantId,
          access_request_id: requestId,
          user_id: requestData.user_id,
          organization_id: requestData.organization_id,
          document_type: firstDocumentType,
          created_at: new Date().toISOString(),
          expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          transaction_hash: `0x${uuidv4().replace(/-/g, "")}`,
        },
      ])
      .select()
      .single()

    if (grantError) {
      console.error("Error creating access grant:", grantError)
      return NextResponse.json({ error: "Failed to create access grant" }, { status: 500 })
    }

    // If there are granted fields, insert them into access_grant_fields
    if (grantedFields && Object.keys(grantedFields).length > 0) {
      const fieldInserts = []
      for (const [docType, fields] of Object.entries(grantedFields)) {
        if (Array.isArray(fields)) {
          for (const fieldName of fields) {
            fieldInserts.push({
              access_grant_id: grantId,
              field_name: fieldName,
              created_at: new Date().toISOString(),
            })
          }
        }
      }

      if (fieldInserts.length > 0) {
        const { error: fieldsError } = await supabase.from("access_grant_fields").insert(fieldInserts)

        if (fieldsError) {
          console.error("Error inserting grant fields:", fieldsError)
        }
      }
    }

    // Update the request status
    const { error: updateError } = await supabase
      .from("access_requests")
      .update({
        status: "approved",
        responded_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Error updating request status:", updateError)
    }

    // Log the access history
    await supabase.from("access_history").insert([
      {
        access_request_id: requestId,
        access_grant_id: grantId,
        user_id: requestData.user_id,
        action: "granted",
        transaction_hash: grantData.transaction_hash,
        timestamp: new Date().toISOString(),
      },
    ])

    // Create the secure access link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://decoman.vercel.app"
    const secureAccessLink = `${baseUrl}/secure-access/${grantId}`

    return NextResponse.json({
      success: true,
      grantId,
      transactionHash: grantData.transaction_hash,
      secureAccessLink,
    })
  } catch (error) {
    console.error("Error approving request:", error)
    return NextResponse.json({ error: "Failed to approve request" }, { status: 500 })
  }
}
