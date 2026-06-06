import { NextResponse } from "next/server"
import { consentHistory, consents, purposes } from "@/lib/data"
import { getConsentFromBlockchain } from "@/lib/blockchain"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const organizationId = searchParams.get("organizationId")

  if (!organizationId) {
    return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
  }

  // Get all consents for the organization
  const orgConsents = consents.filter((consent) => consent.organizationId === organizationId)

  // Get history entries for those consents
  const orgHistory = consentHistory.filter((history) => orgConsents.some((consent) => consent.id === history.consentId))

  // Enhance history with blockchain data (simulated)
  const enhancedHistory = await Promise.all(
    orgHistory.map(async (history) => {
      const consent = consents.find((c) => c.id === history.consentId)
      const purpose = consent ? purposes.find((p) => p.id === consent.purposeId) : null

      // Get blockchain data for this transaction
      const blockchainData = await getConsentFromBlockchain(history.transactionHash)

      return {
        ...history,
        userAddress: consent?.userAddress,
        purpose: purpose
          ? {
              id: purpose.id,
              name: purpose.name,
            }
          : null,
        blockchain: blockchainData,
      }
    }),
  )

  // Sort by timestamp (newest first)
  enhancedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return NextResponse.json(enhancedHistory)
}
