import { NextResponse } from "next/server"
import { organizations } from "@/lib/data"

export async function GET() {
  return NextResponse.json(organizations)
}
