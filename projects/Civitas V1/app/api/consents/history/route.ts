import { NextResponse } from "next/server"
import { consentHistory, consents, organizations, purposes } from "@/lib/data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userAddress = searchParams.get("userAddress")

  if (!userAddress) {
    return NextResponse.json({ error: "User address is required" }, { status: 400 })
  }

  // Get all consents for the user
  const userConsents = consents.filter((consent) => consent.userAddress.toLowerCase() === userAddress.toLowerCase())

  // Get history entries for those consents
  const userHistory = consentHistory.filter((history) =>
    userConsents.some((consent) => consent.id === history.consentId),
  )

  // Enhance history with consent, organization, and purpose details
  const enhancedHistory = userHistory.map((history) => {
    const consent = consents.find((c) => c.id === history.consentId)
    const organization = consent ? organizations.find((org) => org.id === consent.organizationId) : null
    const purpose = consent ? purposes.find((p) => p.id === consent.purposeId) : null

    return {
      ...history,
      consent: consent
        ? {
            id: consent.id,
            status: consent.status,
            expiryDate: consent.expiryDate,
          }
        : null,
      organization: organization
        ? {
            id: organization.id,
            name: organization.name,
          }
        : null,
      purpose: purpose
        ? {
            id: purpose.id,
            name: purpose.name,
          }
        : null,
    }
  })

  // Sort by timestamp (newest first)
  enhancedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return NextResponse.json(enhancedHistory)
}
