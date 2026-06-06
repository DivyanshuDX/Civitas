"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type AccessStats = {
  byDocument: {
    name: string
    requested: number
    granted: number
    rejected: number
  }[]
  byMonth: {
    month: string
    requests: number
    approvals: number
  }[]
  byField: {
    name: string
    count: number
  }[]
  summary: {
    totalRequests: number
    approved: number
    rejected: number
    pending: number
    expired: number
  }
}

type AccessStatsProps = {
  organizationId: string
}

export function AccessStats({ organizationId }: AccessStatsProps) {
  const [stats, setStats] = useState<AccessStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For this demo, we'll generate mock stats
    const generateMockStats = () => {
      // Mock data for document types
      const documentStats = [
        {
          name: "Aadhaar",
          requested: Math.floor(Math.random() * 50) + 20,
          granted: Math.floor(Math.random() * 30) + 10,
          rejected: Math.floor(Math.random() * 10) + 2,
        },
        {
          name: "PAN Card",
          requested: Math.floor(Math.random() * 40) + 15,
          granted: Math.floor(Math.random() * 25) + 8,
          rejected: Math.floor(Math.random() * 8) + 1,
        },
        {
          name: "Passport",
          requested: Math.floor(Math.random() * 30) + 10,
          granted: Math.floor(Math.random() * 20) + 5,
          rejected: Math.floor(Math.random() * 5) + 1,
        },
      ]

      // Mock data for months
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      const monthStats = months.map((month) => ({
        month,
        requests: Math.floor(Math.random() * 40) + 10,
        approvals: Math.floor(Math.random() * 30) + 5,
      }))

      // Mock data for fields
      const fieldStats = [
        { name: "Name", count: Math.floor(Math.random() * 80) + 40 },
        { name: "Address", count: Math.floor(Math.random() * 60) + 30 },
        { name: "Date of Birth", count: Math.floor(Math.random() * 70) + 35 },
        { name: "ID Number", count: Math.floor(Math.random() * 50) + 25 },
        { name: "Photo", count: Math.floor(Math.random() * 30) + 15 },
      ]

      // Calculate summary
      const totalRequests = documentStats.reduce((sum, doc) => sum + doc.requested, 0)
      const approved = documentStats.reduce((sum, doc) => sum + doc.granted, 0)
      const rejected = documentStats.reduce((sum, doc) => sum + doc.rejected, 0)
      const pending = Math.floor(Math.random() * 20) + 5
      const expired = Math.floor(Math.random() * 10) + 2

      return {
        byDocument: documentStats,
        byMonth: monthStats,
        byField: fieldStats,
        summary: {
          totalRequests,
          approved,
          rejected,
          pending,
          expired,
        },
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
          <CardTitle>Access Request Summary</CardTitle>
          <CardDescription>Overview of all document access requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">Total Requests</div>
              <div className="text-2xl font-bold">{stats.summary.totalRequests}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">Approved</div>
              <div className="text-2xl font-bold text-green-600">{stats.summary.approved}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">Rejected</div>
              <div className="text-2xl font-bold text-red-600">{stats.summary.rejected}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold text-blue-600">{stats.summary.pending}</div>
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
          <CardTitle>Requests by Month</CardTitle>
          <CardDescription>Document access requests over time</CardDescription>
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
                <Bar dataKey="requests" name="Requests" fill="#3b82f6" />
                <Bar dataKey="approvals" name="Approvals" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>Requests by Document</CardTitle>
          <CardDescription>Breakdown by document type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byDocument} layout="vertical">
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
                <Bar dataKey="requested" name="Requested" fill="#3b82f6" />
                <Bar dataKey="granted" name="Granted" fill="#22c55e" />
                <Bar dataKey="rejected" name="Rejected" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Most Requested Fields</CardTitle>
          <CardDescription>Document fields users are most likely to share</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byField}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
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
                <Bar dataKey="count" name="Times Shared" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
