"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

type HistoryItem = {
  id: string
  consentId: string
  action: "grant" | "revoke" | "expire"
  timestamp: string
  transactionHash: string
  organization?: {
    id: string
    name: string
  }
  purpose?: {
    id: string
    name: string
  }
}

type ConsentHistoryProps = {
  userAddress: string | null
}

export function ConsentHistory({ userAddress }: ConsentHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userAddress) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/consents/history?userAddress=${userAddress}`)

        if (!response.ok) {
          throw new Error("Failed to fetch consent history")
        }

        const data = await response.json()
        setHistory(data)
      } catch (err) {
        console.error("Error fetching consent history:", err)
        setError("Failed to load history. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [userAddress])

  const getActionIcon = (action: string) => {
    switch (action) {
      case "grant":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />
      case "revoke":
        return <XCircle className="h-6 w-6 text-red-500" />
      case "expire":
        return <Clock className="h-6 w-6 text-amber-500" />
      default:
        return null
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case "grant":
        return "Granted consent"
      case "revoke":
        return "Revoked consent"
      case "expire":
        return "Consent expired"
      default:
        return action
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.history")}</CardTitle>
          <CardDescription>Loading your consent history...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.history")}</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.history")}</CardTitle>
          <CardDescription>No consent history found.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.history")}</CardTitle>
        <CardDescription>Your complete consent history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {history.map((item) => (
            <div key={item.id} className="flex">
              <div className="mr-4 flex flex-col items-center">
                {getActionIcon(item.action)}
                <div className="h-full w-px bg-border" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium leading-none">{getActionText(item.action)}</h3>
                  <span className="text-xs text-muted-foreground">{format(new Date(item.timestamp), "PPP p")}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.organization?.name || "Unknown organization"} - {item.purpose?.name || "Unknown purpose"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Transaction: {item.transactionHash.substring(0, 10)}...{item.transactionHash.substring(58)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
