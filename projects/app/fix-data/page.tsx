"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function FixDataPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const runFix = async () => {
    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/seed/fix-data-separation")
      const data = await response.json()

      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Fix User Data Separation</CardTitle>
          <CardDescription>
            This utility will fix data separation issues between users and ensure each user only sees their own
            documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert className={result.success ? "bg-green-50" : "bg-red-50"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message || result.error || "Operation completed"}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={runFix} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Fix...
              </>
            ) : (
              "Run Data Separation Fix"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
