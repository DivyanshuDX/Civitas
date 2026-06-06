"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import type { ConsentPurpose } from "@/lib/data"
import { Filter } from "lucide-react"

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

type OrganizationConsentsProps = {
  organizationId: string
}

export function OrganizationConsents({ organizationId }: OrganizationConsentsProps) {
  const [consents, setConsents] = useState<Consent[]>([])
  const [filteredConsents, setFilteredConsents] = useState<Consent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purposes, setPurposes] = useState<ConsentPurpose[]>([])
  const [filters, setFilters] = useState({
    purposeId: "",
    status: "",
    userAddress: "",
  })
  const { t } = useLanguage()

  useEffect(() => {
    const fetchConsents = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/consents?organizationId=${organizationId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch consents")
        }

        const data = await response.json()
        setConsents(data)
        setFilteredConsents(data)
      } catch (err) {
        console.error("Error fetching consents:", err)
        setError("Failed to load consents. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    const fetchPurposes = async () => {
      try {
        const response = await fetch("/api/purposes")

        if (!response.ok) {
          throw new Error("Failed to fetch purposes")
        }

        const data = await response.json()
        setPurposes(data)
      } catch (err) {
        console.error("Error fetching purposes:", err)
      }
    }

    fetchConsents()
    fetchPurposes()
  }, [organizationId])

  useEffect(() => {
    // Apply filters
    let filtered = [...consents]

    if (filters.purposeId) {
      filtered = filtered.filter((consent) => consent.purposeId === filters.purposeId)
    }

    if (filters.status) {
      filtered = filtered.filter((consent) => consent.status === filters.status)
    }

    if (filters.userAddress) {
      filtered = filtered.filter((consent) =>
        consent.userAddress.toLowerCase().includes(filters.userAddress.toLowerCase()),
      )
    }

    setFilteredConsents(filtered)
  }, [filters, consents])

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      purposeId: "",
      status: "",
      userAddress: "",
    })
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
          <CardTitle>{t("admin.consents")}</CardTitle>
          <CardDescription>Loading consents...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.consents")}</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.consents")}</CardTitle>
        <CardDescription>View all consents granted to your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("admin.filter")}:</span>
          </div>
          <div className="flex flex-1 flex-col gap-4 sm:flex-row">
            <Select value={filters.purposeId} onValueChange={(value) => handleFilterChange("purposeId", value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                {purposes.map((purpose) => (
                  <SelectItem key={purpose.id} value={purpose.id}>
                    {purpose.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="User Address"
                value={filters.userAddress}
                onChange={(e) => handleFilterChange("userAddress", e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </div>

        {filteredConsents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No consents found matching your filters.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Address</TableHead>
                <TableHead>{t("consent.purpose")}</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>{t("consent.expiry")}</TableHead>
                <TableHead>{t("consent.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsents.map((consent) => (
                <TableRow key={consent.id}>
                  <TableCell className="font-mono">
                    {consent.userAddress.substring(0, 8)}...{consent.userAddress.substring(36)}
                  </TableCell>
                  <TableCell>{consent.purpose?.name || "Unknown"}</TableCell>
                  <TableCell>{format(new Date(consent.createdAt), "PPP")}</TableCell>
                  <TableCell>{format(new Date(consent.expiryDate), "PPP")}</TableCell>
                  <TableCell>{getStatusBadge(consent.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
