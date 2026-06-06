"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/components/language-provider"

type Consent = {
  id: string
  userAddress: string
  organizationId: string
  purposeId: string
  status: "active" | "revoked" | "expired"
  createdAt: string
  expiryDate: string
  revokedAt?: string
  transactionHash: string
  organization: {
    id: string
    name: string
  } | null
  purpose: {
    id: string
    name: string
  } | null
}

type ConsentTableProps = {
  userAddress: string | null
}

export function ConsentTable({ userAddress }: ConsentTableProps) {
  const [consents, setConsents] = useState<Consent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { t } = useLanguage()

  const fetchConsents = async () => {
    if (!userAddress) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/consents?userAddress=${userAddress}`)

      if (!response.ok) {
        throw new Error("Failed to fetch consents")
      }

      const data = await response.json()
      setConsents(data)
    } catch (err) {
      console.error("Error fetching consents:", err)
      setError("Failed to load consents. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConsents()
  }, [userAddress])

  const handleRevokeConsent = async (consentId: string) => {
    if (!userAddress) return

    try {
      const response = await fetch("/api/consents/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consentId,
          userAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke consent")
      }

      toast({
        title: "Consent Revoked",
        description: `Transaction hash: ${data.transactionHash.substring(0, 10)}...`,
      })

      // Update the local state
      setConsents((prevConsents) =>
        prevConsents.map((consent) =>
          consent.id === consentId ? { ...consent, status: "revoked" as const, revokedAt: data.revokedAt } : consent,
        ),
      )
    } catch (error) {
      console.error("Error revoking consent:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke consent",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        )
      case "revoked":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Revoked
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.myConsents")}</CardTitle>
          <CardDescription>Loading your consents...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.myConsents")}</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (consents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.myConsents")}</CardTitle>
          <CardDescription>You haven't granted any consents yet.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.myConsents")}</CardTitle>
        <CardDescription>Manage your active consents</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("consent.org")}</TableHead>
              <TableHead>{t("consent.purpose")}</TableHead>
              <TableHead>{t("consent.expiry")}</TableHead>
              <TableHead>{t("consent.status")}</TableHead>
              <TableHead>{t("consent.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consents.map((consent) => (
              <TableRow key={consent.id}>
                <TableCell>{consent.organization?.name || "Unknown"}</TableCell>
                <TableCell>{consent.purpose?.name || "Unknown"}</TableCell>
                <TableCell>{format(new Date(consent.expiryDate), "PPP")}</TableCell>
                <TableCell>{getStatusBadge(consent.status)}</TableCell>
                <TableCell>
                  {consent.status === "active" ? (
                    <Button variant="destructive" size="sm" onClick={() => handleRevokeConsent(consent.id)}>
                      {t("consent.revoke")}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      {t("consent.revoke")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
