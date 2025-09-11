"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, Clock, ExternalLink, Copy, FileText, User, Calendar } from "lucide-react"

interface AccessRequest {
  id: string
  user_address: string
  purpose: string
  requested_fields: string[]
  status: "pending" | "approved" | "rejected"
  created_at: string
  expires_at?: string
  secure_link?: string
  user_name?: string
}

export default function OrganizationRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/access-requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast({
        title: "Error",
        description: "Failed to fetch access requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch("/api/access-requests/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Request Approved",
          description: "Access request has been approved and secure link generated",
        })

        // Update the request in the list
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: "approved" as const, secure_link: result.secureLink } : req,
          ),
        )
      } else {
        throw new Error("Failed to approve request")
      }
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const response = await fetch("/api/access-requests/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      })

      if (response.ok) {
        toast({
          title: "Request Rejected",
          description: "Access request has been rejected",
        })

        // Update the request in the list
        setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" as const } : req)))
      } else {
        throw new Error("Failed to reject request")
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      })
    }
  }

  const copySecureLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Copied",
      description: "Secure access link copied to clipboard",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading access requests...</p>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Access Requests</h3>
        <p className="text-gray-600 dark:text-gray-300">No access requests have been submitted yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Requests</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage and review user access requests for document data</p>
        </div>
        <Badge
          variant="outline"
          className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        >
          {requests.filter((r) => r.status === "pending").length} Pending
        </Badge>
      </div>

      <div className="grid gap-6">
        {requests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <User className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {request.user_name || `User ${request.user_address.substring(0, 8)}...`}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">{request.user_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    Requested on {new Date(request.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="outline" className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                  {getStatusIcon(request.status)}
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Purpose:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {request.purpose}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Requested Fields:</h4>
                  <div className="flex flex-wrap gap-2">
                    {request.requested_fields.map((field, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>

                {request.expires_at && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">Expires:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(request.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {request.secure_link && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Secure Access Link:</h4>
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <code className="flex-1 text-sm text-green-800 dark:text-green-400 break-all">
                        {request.secure_link}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copySecureLink(request.secure_link!)}
                        className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(request.secure_link, "_blank")}
                        className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {request.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Request
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Request
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
