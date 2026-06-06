"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { importAlgorandAccount } from "@/lib/import-account"
import { useAuth } from "@/components/auth-provider"
import { Loader2, AlertCircle } from "lucide-react"

export default function ImportAccountPage() {
  const [jsonData, setJsonData] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const handleImport = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to import an account",
        variant: "destructive",
      })
      return
    }

    try {
      setIsImporting(true)

      // Parse the JSON data
      let accountData
      try {
        accountData = JSON.parse(jsonData)
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "Please provide valid JSON data",
          variant: "destructive",
        })
        return
      }

      // Validate the account data
      if (!accountData.address || !accountData.passphrase || !accountData.privateKey) {
        toast({
          title: "Invalid Account Data",
          description: "The JSON must include address, passphrase, and privateKey fields",
          variant: "destructive",
        })
        return
      }

      // Import the account
      const success = await importAlgorandAccount(user.id, accountData)

      if (success) {
        toast({
          title: "Account Imported",
          description: "The Algorand account has been successfully imported",
        })

        // Redirect to dashboard
        router.push("/admin")
      } else {
        toast({
          title: "Import Failed",
          description: "Failed to import the Algorand account",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error importing account:", error)
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Import Algorand Account</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Import External Algorand Account</CardTitle>
            <CardDescription>Paste the JSON data from your generated account.json file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300">Important</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      The JSON should contain the following fields:
                    </p>
                    <pre className="mt-2 text-xs bg-amber-100 dark:bg-amber-900 p-2 rounded overflow-auto">
                      {`{
  "address": "your_algorand_address",
  "passphrase": "your_25_word_mnemonic",
  "privateKey": "your_private_key_base64"
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <Textarea
                placeholder='{"address": "...", "passphrase": "...", "privateKey": "..."}'
                className="min-h-[200px] font-mono"
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isImporting || !jsonData.trim()}>
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...
                </>
              ) : (
                "Import Account"
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
