import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const documentType = url.searchParams.get("documentType")

    if (!documentType) {
      return NextResponse.json({ error: "Missing documentType parameter" }, { status: 400 })
    }

    // Get default fields for the document type
    const fields = getDefaultFields(documentType)

    return NextResponse.json({ fields })
  } catch (error) {
    console.error("Error fetching document fields:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { documentId, fields } = await request.json()

    if (!documentId || !fields) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert or update fields for the document
    const fieldsToInsert = Object.entries(fields).map(([fieldName, isAvailable]) => ({
      document_id: documentId,
      field_name: fieldName,
      field_value: null, // Can be updated later
      is_available: isAvailable,
    }))

    // Use upsert to handle both insert and update
    const { error } = await supabase
      .from("document_fields")
      .upsert(fieldsToInsert, { onConflict: "document_id,field_name" })

    if (error) {
      return NextResponse.json({ error: `Failed to update document fields: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating document fields:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getDefaultFields(documentType: string): Array<{ id: string; name: string; description: string }> {
  switch (documentType) {
    case "aadhaar":
      return [
        { id: "name", name: "Full Name", description: "Legal name as per Aadhaar" },
        { id: "dob", name: "Date of Birth", description: "Date of birth" },
        { id: "gender", name: "Gender", description: "Gender information" },
        { id: "address", name: "Address", description: "Residential address" },
        { id: "aadhaar_number", name: "Aadhaar Number", description: "12-digit Aadhaar number" },
        { id: "photo", name: "Photograph", description: "Biometric photograph" },
        { id: "phone", name: "Phone Number", description: "Registered mobile number" },
        { id: "email", name: "Email", description: "Registered email address" },
      ]
    case "pan":
      return [
        { id: "name", name: "Full Name", description: "Legal name as per PAN" },
        { id: "pan_number", name: "PAN Number", description: "10-character PAN number" },
        { id: "dob", name: "Date of Birth", description: "Date of birth" },
        { id: "father_name", name: "Father's Name", description: "Father's full name" },
      ]
    case "driving_license":
      return [
        { id: "name", name: "Full Name", description: "Legal name as per license" },
        { id: "license_number", name: "License Number", description: "Driving license number" },
        { id: "dob", name: "Date of Birth", description: "Date of birth" },
        { id: "address", name: "Address", description: "Residential address" },
        { id: "issue_date", name: "Issue Date", description: "Date of issue" },
        { id: "expiry_date", name: "Expiry Date", description: "Date of expiry" },
        { id: "vehicle_class", name: "Vehicle Class", description: "Classes of vehicles allowed" },
        { id: "photo", name: "Photograph", description: "License photograph" },
      ]
    default:
      return [{ id: "name", name: "Name", description: "Full name" }]
  }
}
