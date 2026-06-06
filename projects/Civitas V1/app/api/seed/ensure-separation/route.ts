import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "app/api/seed/ensure-user-data-separation.sql")
    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL query
    const { data, error } = await supabase.rpc("exec_sql", { sql: sqlQuery })

    if (error) {
      console.error("Error executing SQL:", error)
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          error: String(error),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "User data separation ensured successfully",
      data,
    })
  } catch (error) {
    console.error("Error ensuring user data separation:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
