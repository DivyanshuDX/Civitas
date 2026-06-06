import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { requestId, userAddress } = body

    // Validate required fields
    if (!requestId || !userAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real app, this would update a database and create blockchain transactions
    // For demo, we'll just return a success response
    const transactionHash = `0x${uuidv4().replace(/-/g, "")}`

    return NextResponse.json({
      success: true,
      transactionHash,
    })
  } catch (error) {
    console.error("Error rejecting request:", error)
    return NextResponse.json({ error: "Failed to reject request" }, { status: 500 })
  }
}
