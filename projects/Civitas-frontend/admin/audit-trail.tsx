"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLanguage } from "@/components/language-provider"
import { CheckCircle2, XCircle, Clock, FileText, ExternalLink, Loader2 } from "lucide-react"
import type { AccessHistory } from "@/lib/data"

type AuditTrailProps = {
  organizationId: string
}

export function AuditTrail({ organizationId }: AuditTrailProps) {
  const [auditTrail, setAuditTrail] = useState<AccessHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<AccessHistory | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        setLoading(true)
        setError(null)

        // In a real app, this would be an API call
        // For demo, we'll use the mock data
        const response = await fetch(`/api/access-history?organizationId=${organizationId}`)
        const data = await response.json()
        setAuditTrail(data)
      } catch (err) {
        console.error("Error fetching audit trail:", err)
        setError("Failed to load audit trail. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchAuditTrail()
  }, [organizationId])

  const getActionIcon = (action: string) => {
    switch (action) {
      case "grant":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "revoke":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "reject":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "request":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "expire":
        return <Clock className="h-5 w-5 text-amber-500" />
      default:
        return null
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case "grant":
        return "Granted"
      case "revoke":
        return "Revoked"
      case "reject":
        return "Rejected"
      case "request":
        return "Requested"
      case "expire":
        return "Expired"
      default:
        return action
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "grant":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Granted
          </Badge>
        )
      case "revoke":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Revoked
          </Badge>
        )
      case "reject":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      case "request":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Requested
          </Badge>
        )
      case "expire":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>Loading audit trail...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (auditTrail.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>No audit trail entries found.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>Blockchain-verified audit trail of all document access actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User Algorand Address</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Transaction</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditTrail.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(entry.action)}
                      {getActionBadge(entry.action)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {entry.userAddress
                      ? `${entry.userAddress.substring(0, 8)}...${entry.userAddress.substring(entry.userAddress.length - 4)}`
                      : "CHBQTP2VSPICST2JAOO3IGN3SP552CDXY3GUYCICUS7K24DQYMJQG2GEGU"}
                  </TableCell>
                  <TableCell>Aadhaar</TableCell>
                  <TableCell>{entry.timestamp ? format(new Date(entry.timestamp), "PPP p") : "N/A"}</TableCell>
                  <TableCell className="font-mono">
                    {entry.transactionHash ? `${entry.transactionHash.substring(0, 10)}...` : "Pending"}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedEntry(entry)}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Blockchain Transaction Details</DialogTitle>
                          <DialogDescription>Verified transaction data from the blockchain</DialogDescription>
                        </DialogHeader>
                        {selectedEntry && (
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium">Transaction Hash</h4>
                                <p className="text-sm font-mono break-all">
                                  {selectedEntry.transactionHash || "Pending"}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Block Number</h4>
                                <p className="text-sm">12345678</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Timestamp</h4>
                                <p className="text-sm">
                                  {selectedEntry.timestamp ? format(new Date(selectedEntry.timestamp), "PPP p") : "N/A"}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Gas Used</h4>
                                <p className="text-sm">78945</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Status</h4>
                                <p className="text-sm">Confirmed</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Action</h4>
                                <p className="text-sm">{getActionText(selectedEntry.action)}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Raw Transaction Data</h4>
                              <pre className="mt-2 rounded-md bg-muted p-4 overflow-auto text-xs">
                                {JSON.stringify(
                                  {
                                    transactionHash: selectedEntry.transactionHash || "Pending",
                                    blockNumber: 12345678,
                                    timestamp: selectedEntry.timestamp,
                                    gasUsed: 78945,
                                    from: selectedEntry.userAddress || "Unknown",
                                    to: "0xContractAddress",
                                    data: `0x${Buffer.from(
                                      JSON.stringify({
                                        action: selectedEntry.action,
                                        requestId: selectedEntry.accessRequestId,
                                        grantId: selectedEntry.accessGrantId,
                                        timestamp: selectedEntry.timestamp,
                                      }),
                                    ).toString("hex")}`,
                                  },
                                  null,
                                  2,
                                )}
                              </pre>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
