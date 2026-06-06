import { NextResponse } from "next/server"
import { executeSql } from "@/lib/db-utils"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "app/api/seed/document-assets-table.sql")

    if (!fs.existsSync(sqlFilePath)) {
      console.error("SQL file not found:", sqlFilePath)
      return NextResponse.json({ success: false, error: "SQL file not found" }, { status: 500 })
    }

    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")
    console.log("Document assets SQL query loaded successfully")

    // Execute the SQL query using our helper
    const { success, error } = await executeSql(sqlQuery)

    if (!success) {
      console.error("Error executing SQL:", error)
      return NextResponse.json({ success: false, error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Document assets tables set up successfully",
    })
  } catch (error) {
    console.error("Error setting up document assets:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to set up document assets: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
