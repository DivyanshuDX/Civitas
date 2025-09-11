import { NextResponse } from "next/server"
import { seedDatabase } from "@/lib/seed-data"

export async function GET() {
  try {
    const result = await seedDatabase()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error seeding database:", error)
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
