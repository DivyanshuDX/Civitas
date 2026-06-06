import { NextResponse } from "next/server"
import { purposes } from "@/lib/data"

export async function GET() {
  return NextResponse.json(purposes)
}
