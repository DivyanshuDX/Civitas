import { NextResponse } from "next/server"
import { getTableList, getTableCount } from "@/lib/db-utils"

export async function GET() {
  try {
    // Get list of tables
    const { success, tables, error: tableError } = await getTableList()

    if (!success) {
      return NextResponse.json({ success: false, error: tableError }, { status: 500 })
    }

    // Get record counts for each table
    const counts: Record<string, number> = {}

    for (const table of tables) {
      const { count } = await getTableCount(table)
      counts[table] = count
    }

    return NextResponse.json({
      success: true,
      data: {
        tables,
        counts,
      },
    })
  } catch (error) {
    console.error("Error getting database status:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to get database status: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
