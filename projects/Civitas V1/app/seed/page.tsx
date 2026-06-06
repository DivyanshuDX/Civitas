"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Check, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSeed = async () => {
    try {
      setIsSeeding(true)
      setError(null)

      const response = await fetch("/api/seed")

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Server error: ${response.status} - ${text}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to seed database")
      }

      setSeedResult(data.data)
      toast({
        title: "Database Seeded",
        description: "Demo accounts have been created successfully.",
      })
    } catch (error) {
      console.error("Error seeding database:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Seeding Failed",
        description: error instanceof Error ? error.message : "An error occurred while seeding the database",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-6 text-center">
        <div className="flex items-center gap-2 font-bold">
          <Shield className="h-10 w-10 text-primary" />
          <span className="text-2xl">DeCoMan</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Database Seed Tool</h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
          This tool will create demo accounts for testing the DeCoMan platform.
        </p>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Seed Database</CardTitle>
            <CardDescription>Create demo user and admin accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {seedResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center text-green-500 mb-4">
                  <Check className="h-12 w-12" />
                </div>
                <div className="text-left space-y-2">
                  <h3 className="font-medium">Demo User Account:</h3>
                  <p className="text-sm">Email: {seedResult.user.email}</p>
                  <p className="text-sm">Password: {seedResult.user.password}</p>
                  {seedResult.user.algorandAddress && (
                    <p className="text-sm font-mono text-xs break-all">
                      Algorand Address: {seedResult.user.algorandAddress}
                    </p>
                  )}
                </div>
                <div className="text-left space-y-2">
                  <h3 className="font-medium">Demo Admin Account:</h3>
                  <p className="text-sm">Email: {seedResult.admin.email}</p>
                  <p className="text-sm">Password: {seedResult.admin.password}</p>
                  {seedResult.admin.algorandAddress && (
                    <p className="text-sm font-mono text-xs break-all">
                      Algorand Address: {seedResult.admin.algorandAddress}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="mb-4">
                  This will create demo accounts for testing. Click the button below to seed the database.
                </p>
                <Button onClick={handleSeed} disabled={isSeeding}>
                  {isSeeding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Seeding Database...
                    </>
                  ) : (
                    "Seed Database"
                  )}
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      setLoading(true)
                      const response = await fetch("/api/seed/insert-dummy-data")
                      const data = await response.json()
                      if (data.success) {
                        toast({
                          title: "Success",
                          description: "Dummy data inserted successfully",
                        })
                      } else {
                        toast({
                          title: "Error",
                          description: data.message || "Failed to insert dummy data",
                          variant: "destructive",
                        })
                      }
                    } catch (error) {
                      console.error("Error:", error)
                      toast({
                        title: "Error",
                        description: "An unexpected error occurred",
                        variant: "destructive",
                      })
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                >
                  Insert Dummy Data
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="flex gap-4">
              <Link href="/">
                <Button variant="outline">Return Home</Button>
              </Link>
              {seedResult && (
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
