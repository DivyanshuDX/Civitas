import { NextResponse } from "next/server"
import { accessGrants, organizations } from "@/lib/data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userAddress = searchParams.get("userAddress")
  const organizationId = searchParams.get("organizationId")

  let filteredGrants = [...accessGrants]

  if (userAddress) {
    filteredGrants = filteredGrants.filter((grant) => grant.userAddress.toLowerCase() === userAddress.toLowerCase())
  }

  if (organizationId) {
    filteredGrants = filteredGrants.filter((grant) => grant.organizationId === organizationId)
  }

  // Enhance grants with organization details
  const enhancedGrants = filteredGrants.map((grant) => {
    const organization = organizations.find((org) => org.id === grant.organizationId)

    return {
      ...grant,
      organization: organization ? { id: organization.id, name: organization.name } : null,
    }
  })

  return NextResponse.json(enhancedGrants)
}
