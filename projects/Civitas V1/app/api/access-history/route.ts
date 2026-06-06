import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get("userAddress")
    const organizationId = searchParams.get("organizationId")
    const userId = searchParams.get("userId")

    console.log("Fetching access history with params:", { userAddress, organizationId, userId })

    // First, if we have an Algorand address, we need to find the corresponding user_id
    let userIdToQuery = userId

    if (userAddress && !userId) {
      // Try to find the user_id from the algorand_accounts table
      const { data: accountData, error: accountError } = await supabase
        .from("algorand_accounts")
        .select("user_id")
        .eq("address", userAddress)
        .single()

      if (accountError) {
        console.log("Error finding user_id for address:", accountError)

        // Try to find from user_blockchain_accounts if it exists
        const { data: blockchainAccountData, error: blockchainAccountError } = await supabase
          .from("user_blockchain_accounts")
          .select("user_id")
          .eq("address", userAddress)
          .single()

        if (!blockchainAccountError && blockchainAccountData) {
          userIdToQuery = blockchainAccountData.user_id
          console.log("Found user_id from blockchain accounts:", userIdToQuery)
        }
      } else if (accountData) {
        userIdToQuery = accountData.user_id
        console.log("Found user_id for address:", userIdToQuery)
      }
    }

    // If we still don't have a user ID, return mock data
    if (!userIdToQuery && !userAddress) {
      console.log("No user ID or address available, returning mock data")
      return NextResponse.json(generateMockAccessHistory(userAddress || userIdToQuery))
    }

    // Build the query for access_history
    let query = supabase
      .from("access_history")
      .select(`
        *,
        access_grants(document_type, organization_id),
        access_requests(organization_id, document_types)
      `)
      .order("timestamp", { ascending: false })

    // Add filters if provided
    if (userIdToQuery) {
      query = query.eq("user_id", userIdToQuery)
    }

    if (organizationId) {
      query = query.or(
        `access_grants.organization_id.eq.${organizationId},access_requests.organization_id.eq.${organizationId}`,
      )
    }

    // Execute the query
    const { data, error } = await query.limit(20)

    if (error) {
      console.error("Error fetching access history:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no data found, return mock data for demonstration
    if (!data || data.length === 0) {
      console.log("No access history found, returning mock data")
      return NextResponse.json(generateMockAccessHistory(userAddress || userIdToQuery))
    }

    // Process the data to include organization names and document types
    const processedData = await Promise.all(
      data.map(async (item) => {
        // Get organization name if available
        let organizationName = "Unknown"
        let documentType = undefined

        if (item.access_grants && item.access_grants.organization_id) {
          const { data: orgData } = await supabase
            .from("organizations")
            .select("name")
            .eq("id", item.access_grants.organization_id)
            .single()

          if (orgData) {
            organizationName = orgData.name
          }

          documentType = item.access_grants.document_type
        } else if (item.access_requests && item.access_requests.organization_id) {
          const { data: orgData } = await supabase
            .from("organizations")
            .select("name")
            .eq("id", item.access_requests.organization_id)
            .single()

          if (orgData) {
            organizationName = orgData.name
          }

          documentType = item.access_requests.document_types
            ? item.access_requests.document_types.join(", ")
            : "Multiple"
        }

        return {
          ...item,
          organizationName,
          documentType,
        }
      }),
    )

    return NextResponse.json(processedData)
  } catch (error) {
    console.error("Error in access history API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Function to generate mock access history data for demonstration
function generateMockAccessHistory(userIdentifier: string | null) {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(now)
  lastWeek.setDate(lastWeek.getDate() - 7)

  return [
    {
      id: "mock-1",
      user_id: userIdentifier,
      action: "grant",
      timestamp: now.toISOString(),
      transactionHash:
        "0x" +
        Array(64)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join(""),
      organizationName: "State Bank",
      documentType: "PAN Card",
    },
    {
      id: "mock-2",
      user_id: userIdentifier,
      action: "request",
      timestamp: yesterday.toISOString(),
      transactionHash:
        "0x" +
        Array(64)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join(""),
      organizationName: "Insurance Corp",
      documentType: "Aadhaar Card",
    },
    {
      id: "mock-3",
      user_id: userIdentifier,
      action: "revoke",
      timestamp: lastWeek.toISOString(),
      transactionHash:
        "0x" +
        Array(64)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join(""),
      organizationName: "Telecom Provider",
      documentType: "Driving License",
    },
  ]
}
