import { NextResponse } from "next/server"
import { executeSql } from "@/lib/db-utils"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "app/api/seed/create-consent-tables.sql")

    if (!fs.existsSync(sqlFilePath)) {
      console.error("SQL file not found:", sqlFilePath)
      return NextResponse.json({ success: false, error: "SQL file not found" }, { status: 500 })
    }

    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")
    console.log("Consent tables SQL query loaded successfully")

    // Execute the SQL query using our helper
    const { success, error } = await executeSql(sqlQuery)

    if (!success) {
      console.error("Error executing SQL:", error)
      return NextResponse.json({ success: false, error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Consent tables set up successfully" })
  } catch (error) {
    console.error("Error in setup-consent-tables API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
