"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/components/auth-provider"

interface AccessHistoryProps {
  userAddress?: string | null
}

type AccessHistoryItem = {
  id: string
  action: "request" | "grant" | "revoke" | "reject" | "expire"
  timestamp: string
  transactionHash: string
  organizationName?: string
  documentType?: string
}

export function AccessHistory({ userAddress: propUserAddress }: AccessHistoryProps) {
  const { user, algorandAccount } = useAuth()
  const [history, setHistory] = useState<AccessHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use the address from props if available, otherwise use the one from auth context
  const userAddress = propUserAddress || algorandAccount?.address

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!userAddress && !user?.id) {
          console.log("No user address or ID available for fetching history")
          setError("Authentication required")
          setIsLoading(false)
          return
        }

        console.log("Fetching access history for address:", userAddress)

        // Fetch access history for the user
        const response = await fetch(`/api/access-history?userAddress=${userAddress || ""}&userId=${user?.id || ""}`)

        if (!response.ok) {
          throw new Error(`Error fetching access history: ${response.status}`)
        }

        const data = await response.json()
        console.log("Received access history:", data)
        setHistory(data)
      } catch (error) {
        console.error("Error fetching access history:", error)
        setError(`Failed to load access history: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [userAddress, user])

  // Function to get badge color based on action
  const getBadgeVariant = (action: string) => {
    switch (action) {
      case "grant":
        return "success"
      case "request":
        return "secondary"
      case "revoke":
        return "destructive"
      case "reject":
        return "outline"
      case "expire":
        return "warning"
      default:
        return "default"
    }
  }

  // Function to format action text
  const formatAction = (action: string) => {
    switch (action) {
      case "grant":
        return "Access Granted"
      case "request":
        return "Access Requested"
      case "revoke":
        return "Access Revoked"
      case "reject":
        return "Request Rejected"
      case "expire":
        return "Access Expired"
      default:
        return action
    }
  }

  // Function to format transaction hash for display
  const formatTransactionHash = (hash: string) => {
    if (!hash) return "N/A"
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  // Explorer URL for TestNet
  const getExplorerUrl = (hash: string) => {
    return `https://testnet.explorer.perawallet.app/tx/${hash}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access History</CardTitle>
        <CardDescription>Recent document access activity for your account</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-4 text-red-500">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No access history found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant={getBadgeVariant(item.action) as any}>{formatAction(item.action)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{item.organizationName || "Unknown"}</TableCell>
                  <TableCell>{item.documentType || "Multiple"}</TableCell>
                  <TableCell>
                    {item.transactionHash ? (
                      <a
                        href={getExplorerUrl(item.transactionHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-700"
                      >
                        {formatTransactionHash(item.transactionHash)}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
