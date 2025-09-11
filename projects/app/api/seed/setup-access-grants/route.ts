import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "app/api/seed/create-access-grants-table.sql")
    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL query
    const { error } = await supabase.from("access_grants").select("id").limit(1)

    // If the table doesn't exist, create it
    if (error && error.code === "42P01") {
      const { error: createError } = await supabase.rpc("exec_sql", { sql: sqlQuery })

      if (createError) {
        console.error("Error creating access_grants table:", createError)
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      return NextResponse.json({ message: "Access grants table created successfully" })
    }

    return NextResponse.json({ message: "Access grants table already exists" })
  } catch (error) {
    console.error("Error setting up access grants table:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
