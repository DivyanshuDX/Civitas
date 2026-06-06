import { notFound } from "next/navigation"
import { format, formatDistanceToNow, isPast } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { AlertTriangle, Calendar, CheckCircle, Clock, FileText, Shield, Building2, Download, Eye } from "lucide-react"

type AccessGrant = {
  id: string
  access_request_id: string
  user_id: string
  organization_id: string
  document_type: string
  created_at: string
  expiry_date: string
  revoked_at: string | null
  transaction_hash: string | null
  access_request: {
    purpose: string
    user_id: string
  }
  access_grant_fields: {
    field_name: string
  }[]
}

type Organization = {
  id: string
  name: string
  description: string | null
  contact: string | null
}

async function getAccessGrant(accessId: string): Promise<AccessGrant | null> {
  const { data, error } = await supabase
    .from("access_grants")
    .select(`
      *,
      access_request:access_requests!access_request_id (
        purpose,
        user_id
      ),
      access_grant_fields (
        field_name
      )
    `)
    .eq("id", accessId)
    .single()

  if (error || !data) {
    return null
  }

  return data as AccessGrant
}

async function getOrganization(organizationId: string): Promise<Organization | null> {
  const { data, error } = await supabase.from("organizations").select("*").eq("id", organizationId).single()

  if (error || !data) {
    return null
  }

  return data as Organization
}

// Mock document data for demonstration
const getMockDocumentData = (documentType: string) => {
  const documents = {
    aadhar: {
      title: "Aadhaar Card",
      fields: {
        name: "John Doe",
        aadhaar_number: "XXXX-XXXX-1234",
        date_of_birth: "01/01/1990",
        address: "123 Main Street, Mumbai, Maharashtra",
        phone: "+91-XXXXX-XXXXX",
      },
    },
    pan: {
      title: "PAN Card",
      fields: {
        name: "John Doe",
        pan_number: "ABCDE1234F",
        date_of_birth: "01/01/1990",
        father_name: "Richard Doe",
      },
    },
    passport: {
      title: "Passport",
      fields: {
        name: "John Doe",
        passport_number: "A1234567",
        date_of_birth: "01/01/1990",
        place_of_birth: "Mumbai",
        nationality: "Indian",
        date_of_issue: "01/01/2020",
        date_of_expiry: "01/01/2030",
      },
    },
  }

  return documents[documentType as keyof typeof documents] || documents.aadhar
}

export default async function SecureAccessPage({
  params,
}: {
  params: { accessId: string }
}) {
  const accessGrant = await getAccessGrant(params.accessId)

  if (!accessGrant) {
    notFound()
  }

  const organization = await getOrganization(accessGrant.organization_id)
  const isExpired = isPast(new Date(accessGrant.expiry_date))
  const isRevoked = accessGrant.revoked_at !== null
  const isAccessible = !isExpired && !isRevoked

  const mockDocument = getMockDocumentData(accessGrant.document_type)
  const grantedFields = accessGrant.access_grant_fields.map((f) => f.field_name)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Secure Document Access</h1>
          </div>
          <p className="text-muted-foreground">Authorized document viewing portal with time-bound access</p>
        </div>

        {/* Access Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {isAccessible ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  Access Status
                </CardTitle>
                <CardDescription>Current status of document access permissions</CardDescription>
              </div>
              <Badge
                variant={isAccessible ? "default" : "destructive"}
                className={isAccessible ? "bg-green-100 text-green-800" : ""}
              >
                {isRevoked ? "Revoked" : isExpired ? "Expired" : "Active"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Granted on</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(accessGrant.created_at), "PPP 'at' p")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{isExpired ? "Expired" : "Expires"}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(accessGrant.expiry_date), "PPP 'at' p")}
                    {!isExpired && (
                      <span className="ml-1">
                        ({formatDistanceToNow(new Date(accessGrant.expiry_date), { addSuffix: true })})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Requesting Organization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold">{organization?.name || "Unknown Organization"}</h3>
              {organization?.description && <p className="text-sm text-muted-foreground">{organization.description}</p>}
              <div className="text-sm">
                <span className="font-medium">Purpose:</span> {accessGrant.access_request?.purpose}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Access */}
        {isAccessible ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {mockDocument.title}
                  </CardTitle>
                  <CardDescription>Verified document information</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Blockchain Verified</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    This user has been verified on the Algorand blockchain.
                  </p>
                  {accessGrant.transaction_hash && (
                    <p className="text-xs text-blue-600 mt-1 font-mono">TX: {accessGrant.transaction_hash}</p>
                  )}
                </div>

                <Separator />

                <div className="grid gap-3">
                  <h4 className="font-medium">Document Information</h4>
                  {Object.entries(mockDocument.fields).map(([key, value]) => {
                    const isGranted = grantedFields.length === 0 || grantedFields.includes(key)

                    return (
                      <div
                        key={key}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}</span>
                        <span className="text-sm text-muted-foreground">{isGranted ? value : "••••••••"}</span>
                      </div>
                    )
                  })}
                </div>

                {grantedFields.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      <strong>Note:</strong> Access is limited to specific fields only. Restricted fields are masked for
                      privacy.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Unavailable</h3>
              <p className="text-muted-foreground mb-4">
                {isRevoked
                  ? "This access has been revoked by the document owner."
                  : "This access link has expired and is no longer valid."}
              </p>
              <p className="text-sm text-muted-foreground">
                Please contact the document owner to request new access if needed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
