import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { userId, documentType, documentId, assetId, fields } = await request.json()

    if (!userId || !documentType || !documentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert document into database
    const { data: documentData, error: documentError } = await supabase
      .from("documents")
      .insert([
        {
          user_id: userId,
          document_type: documentType,
          verified: true,
          verified_at: new Date().toISOString(),
        },
      ])
      .select()

    if (documentError || !documentData || documentData.length === 0) {
      return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
    }

    const document = documentData[0]

    // Create fields for the document
    const defaultFields = getDefaultFields(documentType)

    // If fields were provided, use those instead of defaults
    const fieldsToInsert = fields
      ? Object.keys(fields).map((fieldName) => ({
          document_id: document.id,
          field_name: fieldName,
          is_available: fields[fieldName],
        }))
      : defaultFields.map((field) => ({
          document_id: document.id,
          field_name: field,
          is_available: true,
        }))

    // Insert fields into database
    const { error: fieldsError } = await supabase.from("document_fields").insert(fieldsToInsert)

    if (fieldsError) {
      return NextResponse.json({ error: `Failed to create document fields: ${fieldsError.message}` }, { status: 500 })
    }

    // Store asset ID in document metadata or a separate table
    const { error: assetError } = await supabase.from("document_assets").insert([
      {
        document_id: document.id,
        asset_id: assetId.toString(),
        blockchain: "algorand",
      },
    ])

    if (assetError) {
      return NextResponse.json({ error: "Failed to store asset information" }, { status: 500 })
    }

    return NextResponse.json({ success: true, documentId: document.id, assetId })
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getDefaultFields(documentType: string): string[] {
  switch (documentType) {
    case "aadhaar":
      return ["name", "dob", "gender", "address", "aadhaar_number", "photo", "phone", "email"]
    case "pan":
      return ["name", "pan_number", "dob", "father_name"]
    case "passport":
      return [
        "name",
        "passport_number",
        "nationality",
        "dob",
        "place_of_birth",
        "issue_date",
        "expiry_date",
        "address",
        "photo",
      ]
    case "driving_license":
      return ["name", "license_number", "dob", "address", "issue_date", "expiry_date", "vehicle_class", "photo"]
    case "voter_id":
      return ["name", "voter_id_number", "father_name", "gender", "address", "dob", "photo"]
    default:
      return ["name"]
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    // Fetch documents for the user
    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)

    if (documentsError) {
      return NextResponse.json({ error: `Failed to fetch documents: ${documentsError.message}` }, { status: 500 })
    }

    // Fetch document fields
    const documentIds = documents.map((doc) => doc.id)
    const { data: fields, error: fieldsError } = await supabase
      .from("document_fields")
      .select("*")
      .in("document_id", documentIds.length > 0 ? documentIds : ["none"])

    if (fieldsError) {
      return NextResponse.json({ error: `Failed to fetch document fields: ${fieldsError.message}` }, { status: 500 })
    }

    // Fetch document assets
    const { data: assets, error: assetsError } = await supabase
      .from("document_assets")
      .select("*")
      .in("document_id", documentIds.length > 0 ? documentIds : ["none"])

    if (assetsError) {
      return NextResponse.json({ error: `Failed to fetch document assets: ${assetsError.message}` }, { status: 500 })
    }

    // Transform data to match our component's expected format
    const transformedDocuments = documents.map((doc) => {
      const docFields = fields?.filter((field) => field.document_id === doc.id) || []
      const fieldsObj = {}

      docFields.forEach((field) => {
        fieldsObj[field.field_name] = field.is_available
      })

      const asset = assets?.find((asset) => asset.document_id === doc.id)

      return {
        id: doc.id,
        type: doc.document_type,
        verified: doc.verified,
        verifiedAt: doc.verified_at,
        fields: fieldsObj,
        assetId: asset?.asset_id,
      }
    })

    return NextResponse.json({ documents: transformedDocuments })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
