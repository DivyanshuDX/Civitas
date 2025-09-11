"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/components/language-provider"
import { FileText, Eye } from "lucide-react"
import type { AccessGrant } from "@/lib/data"

type GrantedAccessProps = {
  organizationId: string
}

export function GrantedAccess({ organizationId }: GrantedAccessProps) {
  const [grants, setGrants] = useState<AccessGrant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    const fetchGrants = async () => {
      try {
        setLoading(true)
        setError(null)

        // In a real app, this would be an API call
        // For demo, we'll use the mock data
        const response = await fetch(`/api/access-grants?organizationId=${organizationId}`)
        const data = await response.json()
        setGrants(data)
      } catch (err) {
        console.error("Error fetching access grants:", err)
        setError("Failed to load granted access. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchGrants()
  }, [organizationId])

  const handleViewData = (grantId: string) => {
    toast({
      title: "Viewing Data",
      description: "In a real app, this would show the granted document fields.",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Granted Access</CardTitle>
          <CardDescription>Loading granted access...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Granted Access</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (grants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Granted Access</CardTitle>
          <CardDescription>No granted access found.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Users haven't granted access to any document fields yet.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Granted Access</CardTitle>
        <CardDescription>Document fields users have granted access to</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Algorand Address</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Granted Fields</TableHead>
              <TableHead>Granted On</TableHead>
              <TableHead>Expires On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grants.map((grant) => (
              <TableRow key={grant.id}>
                <TableCell className="font-mono">
                  {grant.userAddress.substring(0, 8)}...{grant.userAddress.substring(36)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {t(`document.${grant.documentType}`)}
                  </Badge>
                </TableCell>
                <TableCell>{grant.grantedFields.length} fields</TableCell>
                <TableCell>{format(new Date(grant.createdAt), "PPP")}</TableCell>
                <TableCell>{format(new Date(grant.expiryDate), "PPP")}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleViewData(grant.id)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Data
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
