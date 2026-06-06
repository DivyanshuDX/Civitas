"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/components/language-provider"
import { AccessRequestDetails } from "@/app/dashboard/access-request-details"
import { FileText, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Organization } from "@/lib/data"

type AccessRequest = {
  id: string
  organization_id: string
  user_id: string // Changed from user_address to user_id
  document_types: string[]
  required_fields: Record<string, string[]>
  purpose: string
  status: "pending" | "approved" | "rejected" | "expired"
  created_at: string
  expiry_date: string
  responded_at: string | null
  transaction_hash: string | null
  organization?: Organization | null
}

type AccessRequestListProps = {
  userAddress: string | null
}

export function AccessRequestList({ userAddress }: AccessRequestListProps) {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null)
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    const fetchRequests = async () => {
      if (!userAddress) return

      try {
        setLoading(true)
        setError(null)

        // First, get the user_id from algorand_accounts table using the address
        const { data: accountData, error: accountError } = await supabase
          .from("algorand_accounts")
          .select("user_id")
          .eq("address", userAddress)
          .single()

        if (accountError) {
          throw new Error("Could not find user account with this address")
        }

        const userId = accountData.user_id

        // Now fetch requests using user_id
        const { data: requestsData, error: requestsError } = await supabase
          .from("access_requests")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (requestsError) {
          throw requestsError
        }

        // Try to fetch organizations if the table exists
        let orgsData: Organization[] = []
        try {
          const { data, error: orgsError } = await supabase.from("organizations").select("*")

          if (!orgsError && data) {
            orgsData = data
            setOrganizations(data)
          }
        } catch (orgsError) {
          console.warn("Organizations table might not exist:", orgsError)
          // Continue without organizations data
        }

        // Enhance requests with organization details if available
        const enhancedRequests = requestsData.map((request) => {
          const organization = orgsData.find((org) => org.id === request.organization_id)
          return {
            ...request,
            organization: organization || {
              id: request.organization_id,
              name: `Organization ${request.organization_id}`,
              description: "Organization details not available",
            },
          }
        })

        setRequests(enhancedRequests)
      } catch (err) {
        console.error("Error fetching access requests:", err)
        setError("Failed to load access requests. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [userAddress])

  // Rest of the component remains the same
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewRequest = (request: AccessRequest) => {
    setSelectedRequest(request)
  }

  const handleCloseDetails = () => {
    setSelectedRequest(null)
  }

  const handleRequestAction = async (requestId: string, action: "approve" | "reject") => {
    if (!userAddress) return

    try {
      // Update the request status in Supabase
      const { error } = await supabase
        .from("access_requests")
        .update({
          status: action === "approve" ? "approved" : "rejected",
          responded_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) {
        throw error
      }

      // Generate a mock transaction hash for demo purposes
      const transactionHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(
        "",
      )}`

      // Update the transaction hash
      await supabase.from("access_requests").update({ transaction_hash: transactionHash }).eq("id", requestId)

      toast({
        title: `Request ${action === "approve" ? "Approved" : "Rejected"}`,
        description: `Transaction hash: ${transactionHash.substring(0, 10)}...`,
      })

      // Update the local state
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId ? { ...req, status: action === "approve" ? "approved" : "rejected" } : req,
        ),
      )

      // Close the details view
      setSelectedRequest(null)
    } catch (error) {
      console.error(`Error ${action}ing request:`, error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} request`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.requests")}</CardTitle>
          <CardDescription>Loading your access requests...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.requests")}</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (selectedRequest) {
    return (
      <AccessRequestDetails
        request={selectedRequest}
        organization={selectedRequest.organization || null}
        onClose={handleCloseDetails}
        onApprove={() => handleRequestAction(selectedRequest.id, "approve")}
        onReject={() => handleRequestAction(selectedRequest.id, "reject")}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.requests")}</CardTitle>
        <CardDescription>Organizations requesting access to your documents</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            {requests.filter((req) => req.status === "pending").length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Pending Requests</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You don't have any pending document access requests.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {requests
                  .filter((req) => req.status === "pending")
                  .map((request) => (
                    <Card key={request.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          {request.organization?.name || "Unknown Organization"}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{request.purpose}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Requested on</p>
                            <p>{format(new Date(request.created_at), "PPP")}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expires on</p>
                            <p>{format(new Date(request.expiry_date), "PPP")}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {request.document_types &&
                            request.document_types.map((docType) => (
                              <Badge key={docType} variant="secondary" className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {t(`document.${docType}`)}
                              </Badge>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewRequest(request)}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="all">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Requests Found</h3>
                <p className="text-sm text-muted-foreground mt-1">You don't have any document access requests yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {requests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {request.organization?.name || "Unknown Organization"}
                        </CardTitle>
                        {getStatusBadge(request.status)}
                      </div>
                      <CardDescription className="line-clamp-2">{request.purpose}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Requested on</p>
                          <p>{format(new Date(request.created_at), "PPP")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expires on</p>
                          <p>{format(new Date(request.expiry_date), "PPP")}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {request.document_types &&
                          request.document_types.map((docType) => (
                            <Badge key={docType} variant="secondary" className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {t(`document.${docType}`)}
                            </Badge>
                          ))}
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleViewRequest(request)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
