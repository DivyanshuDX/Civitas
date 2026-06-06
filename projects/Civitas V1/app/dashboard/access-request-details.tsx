"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, CheckCircle, FileText, Link, Loader2, XCircle } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { Organization } from "@/lib/data"

type AccessRequest = {
  id: string
  organization_id: string
  user_id: string
  document_types: string[]
  required_fields: Record<string, string[]>
  purpose: string
  status: "pending" | "approved" | "rejected" | "expired"
  created_at: string
  expiry_date: string
  responded_at?: string | null
  transaction_hash?: string | null
}

type AccessRequestDetailsProps = {
  request: AccessRequest
  organization: Organization | null
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}

export function AccessRequestDetails({
  request,
  organization,
  onClose,
  onApprove,
  onReject,
}: AccessRequestDetailsProps) {
  const [selectedFields, setSelectedFields] = useState<Record<string, string[]>>({})
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [secureAccessLink, setSecureAccessLink] = useState("")
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleFieldToggle = (documentType: string, fieldId: string) => {
    setSelectedFields((prev) => {
      const docFields = prev[documentType] || []
      const updatedFields = docFields.includes(fieldId)
        ? docFields.filter((id) => id !== fieldId)
        : [...docFields, fieldId]

      return {
        ...prev,
        [documentType]: updatedFields,
      }
    })
  }

  const handleApprove = async () => {
    try {
      setIsApproving(true)

      // Call the API to approve the request
      const response = await fetch("/api/access-requests/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: request.id,
          grantedFields: selectedFields,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve request")
      }

      // Set the secure access link from the response
      if (data.secureAccessLink) {
        setSecureAccessLink(data.secureAccessLink)
        setShowSuccessDialog(true)
      }

      toast({
        title: "Request Approved",
        description: "You have granted access to your documents",
      })

      onApprove()
    } catch (error) {
      console.error("Error approving request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve request",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsRejecting(true)

      // Call the API to reject the request
      const response = await fetch("/api/access-requests/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: request.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject request")
      }

      toast({
        title: "Request Rejected",
        description: "You have rejected the access request",
      })

      onReject()
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject request",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secureAccessLink)
    toast({
      title: "Link Copied",
      description: "Secure access link copied to clipboard",
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <div>
              <CardTitle>{t("dashboard.requestDetails")}</CardTitle>
              <CardDescription>Review document access request details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Organization</h3>
            <p className="text-lg font-medium">{organization?.name || "Unknown Organization"}</p>
            {organization?.description && (
              <p className="text-sm text-muted-foreground mt-1">{organization.description}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Purpose</h3>
            <p>{request.purpose}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Requested on</h3>
              <p>{format(new Date(request.created_at), "PPP")}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Expires on</h3>
              <p>{format(new Date(request.expiry_date), "PPP")}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Requested Documents</h3>
            <div className="space-y-4">
              {request.document_types.map((docType) => (
                <div key={docType} className="border rounded-md p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">{t(`document.${docType}`)}</h4>
                  </div>

                  {request.required_fields &&
                  request.required_fields[docType] &&
                  request.required_fields[docType].length > 0 ? (
                    <div className="space-y-2">
                      {request.required_fields[docType].map((fieldId) => (
                        <div key={fieldId} className="flex items-center space-x-2">
                          <Checkbox
                            id={`field-${docType}-${fieldId}`}
                            checked={selectedFields[docType]?.includes(fieldId) || false}
                            onCheckedChange={() => handleFieldToggle(docType, fieldId)}
                          />
                          <label
                            htmlFor={`field-${docType}-${fieldId}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {fieldId.replace(`${docType}_`, "").replace(/_/g, " ")}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Full document access requested</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleReject} disabled={isRejecting || isApproving}>
              {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Reject
            </Button>
            <Button onClick={handleApprove} disabled={isApproving || isRejecting}>
              {isApproving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Access Granted Successfully</DialogTitle>
            <DialogDescription>
              The organization can now access your documents for 2 days using this secure link.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 bg-muted p-3 rounded-md">
            <div className="grid flex-1 gap-2">
              <div className="text-sm font-medium">Secure Access Link</div>
              <div className="text-xs text-muted-foreground truncate">{secureAccessLink}</div>
            </div>
            <Button size="sm" variant="secondary" onClick={copyToClipboard}>
              <Link className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <div className="flex items-center rounded-md border p-3">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mr-2">
              Note
            </Badge>
            <span className="text-sm">This link will expire automatically after 2 days.</span>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="default" onClick={() => setShowSuccessDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
