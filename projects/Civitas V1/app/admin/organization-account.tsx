"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Web3Profile } from "@/components/web3-profile"
import { getCurrentUserWithAccount } from "@/lib/auth"

type OrganizationAccountProps = {
  organizationId: string
}

export function OrganizationAccount({ organizationId }: OrganizationAccountProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const userWithAccount = await getCurrentUserWithAccount()
        if (userWithAccount) {
          setAddress(userWithAccount.algorandAccount.address)
        }
      } catch (error) {
        console.error("Error fetching account:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [organizationId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Account</CardTitle>
          <CardDescription>Loading account details...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Account</CardTitle>
          <CardDescription>Account details not available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Account Not Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              There was an issue retrieving your organization's Algorand account details.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <Web3Profile address={address} label="Organization Wallet" />
}
