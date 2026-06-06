"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type ConsentStats = {
  byPurpose: {
    name: string
    active: number
    revoked: number
    expired: number
  }[]
  byMonth: {
    month: string
    granted: number
    revoked: number
  }[]
  summary: {
    total: number
    active: number
    revoked: number
    expired: number
  }
}

type ConsentStatsProps = {
  organizationId: string
}

export function ConsentStats({ organizationId }: ConsentStatsProps) {
  const [stats, setStats] = useState<ConsentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For this demo, we'll generate mock stats
    const generateMockStats = () => {
      // Mock data for purposes
      const purposeStats = [
        {
          name: "Marketing",
          active: Math.floor(Math.random() * 50) + 20,
          revoked: Math.floor(Math.random() * 20) + 5,
          expired: Math.floor(Math.random() * 10) + 2,
        },
        {
          name: "Analytics",
          active: Math.floor(Math.random() * 40) + 30,
          revoked: Math.floor(Math.random() * 15) + 8,
          expired: Math.floor(Math.random() * 8) + 3,
        },
        {
          name: "KYC",
          active: Math.floor(Math.random() * 60) + 40,
          revoked: Math.floor(Math.random() * 10) + 5,
          expired: Math.floor(Math.random() * 5) + 1,
        },
        {
          name: "Service Delivery",
          active: Math.floor(Math.random() * 70) + 50,
          revoked: Math.floor(Math.random() * 25) + 10,
          expired: Math.floor(Math.random() * 15) + 5,
        },
      ]

      // Mock data for months
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      const monthStats = months.map((month) => ({
        month,
        granted: Math.floor(Math.random() * 40) + 10,
        revoked: Math.floor(Math.random() * 20) + 5,
      }))

      // Calculate summary
      const summary = {
        total: 0,
        active: 0,
        revoked: 0,
        expired: 0,
      }

      purposeStats.forEach((purpose) => {
        summary.active += purpose.active
        summary.revoked += purpose.revoked
        summary.expired += purpose.expired
      })
      summary.total = summary.active + summary.revoked + summary.expired

      return {
        byPurpose: purposeStats,
        byMonth: monthStats,
        summary,
      }
    }

    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      try {
        const mockStats = generateMockStats()
        setStats(mockStats)
        setLoading(false)
      } catch (err) {
        console.error("Error generating stats:", err)
        setError("Failed to load statistics.")
        setLoading(false)
      }
    }, 1000)
  }, [organizationId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.stats")}</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.stats")}</CardTitle>
          <CardDescription className="text-red-500">{error || "Failed to load statistics."}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Consent Summary</CardTitle>
          <CardDescription>Overview of all consents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">Total Consents</div>
              <div className="text-2xl font-bold">{stats.summary.total}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">Active</div>
              <div className="text-2xl font-bold text-green-600">{stats.summary.active}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">Revoked</div>
              <div className="text-2xl font-bold text-red-600">{stats.summary.revoked}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">Expired</div>
              <div className="text-2xl font-bold text-amber-600">{stats.summary.expired}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Consents by Month</CardTitle>
          <CardDescription>Granted vs revoked consents over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="text-sm font-bold">{label}</div>
                          {payload.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-2 text-sm">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span>
                                {entry.name}: {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Bar dataKey="granted" name="Granted" fill="#22c55e" />
                <Bar dataKey="revoked" name="Revoked" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>Consents by Purpose</CardTitle>
          <CardDescription>Breakdown by consent purpose</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byPurpose} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="text-sm font-bold">{label}</div>
                          {payload.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-2 text-sm">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span>
                                {entry.name}: {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Bar dataKey="active" name="Active" fill="#22c55e" />
                <Bar dataKey="revoked" name="Revoked" fill="#ef4444" />
                <Bar dataKey="expired" name="Expired" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
