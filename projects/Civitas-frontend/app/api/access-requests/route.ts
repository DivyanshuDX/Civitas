import { NextResponse } from "next/server"
import { accessRequests, organizations } from "@/lib/data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userAddress = searchParams.get("userAddress")
  const organizationId = searchParams.get("organizationId")

  let filteredRequests = [...accessRequests]

  if (userAddress) {
    filteredRequests = filteredRequests.filter(
      (request) => request.userAddress.toLowerCase() === userAddress.toLowerCase(),
    )
  }

  if (organizationId) {
    filteredRequests = filteredRequests.filter((request) => request.organizationId === organizationId)
  }

  // Enhance requests with organization details
  const enhancedRequests = filteredRequests.map((request) => {
    const organization = organizations.find((org) => org.id === request.organizationId)

    return {
      ...request,
      organization: organization ? { id: organization.id, name: organization.name } : null,
    }
  })

  return NextResponse.json(enhancedRequests)
}
