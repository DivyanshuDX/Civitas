"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

export function BlockchainAccounts() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newAddress, setNewAddress] = useState("")
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAccounts()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("user_blockchain_accounts")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching blockchain accounts:", error)
        return
      }

      setAccounts(data || [])
    } catch (error) {
      console.error("Error in fetchAccounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const addAccount = async () => {
    if (!newAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid blockchain address",
        variant: "destructive",
      })
      return
    }

    try {
      setAdding(true)

      // Call the API to map user to address
      const response = await fetch("/api/blockchain/map-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: newAddress.trim(),
          blockchain_type: "algorand",
          is_primary: accounts.length === 0, // Make primary if it's the first account
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add blockchain account")
      }

      toast({
        title: "Success",
        description: "Blockchain account added successfully",
      })

      setNewAddress("")
      fetchAccounts()
    } catch (error: any) {
      console.error("Error adding blockchain account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add blockchain account",
        variant: "destructive",
      })
    } finally {
      setAdding(false)
    }
  }

  const removeAccount = async (id: string) => {
    try {
      const { error } = await supabase.from("user_blockchain_accounts").delete().eq("id", id)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Success",
        description: "Blockchain account removed successfully",
      })

      fetchAccounts()
    } catch (error: any) {
      console.error("Error removing blockchain account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove blockchain account",
        variant: "destructive",
      })
    }
  }

  const setPrimaryAccount = async (id: string) => {
    try {
      // First set all accounts to not primary
      await supabase
        .from("user_blockchain_accounts")
        .update({ is_primary: false })
        .eq("user_id", user?.id)
        .eq("blockchain_type", "algorand")

      // Then set the selected account to primary
      const { error } = await supabase.from("user_blockchain_accounts").update({ is_primary: true }).eq("id", id)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Success",
        description: "Primary blockchain account updated successfully",
      })

      fetchAccounts()
    } catch (error: any) {
      console.error("Error setting primary blockchain account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update primary blockchain account",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading blockchain accounts...</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blockchain Accounts</CardTitle>
        <CardDescription>Manage your blockchain accounts for badges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="new-address">Add Algorand Address</Label>
              <Input
                id="new-address"
                placeholder="Enter Algorand address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
            </div>
            <Button onClick={addAccount} disabled={adding || !newAddress.trim()}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add
            </Button>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No blockchain accounts added yet. Add an account to manage your badges.
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-md bg-background">
                  <div className="flex-1 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{account.address.substring(0, 8)}...</span>
                      {account.is_primary && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Added on {new Date(account.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!account.is_primary && (
                      <Button variant="outline" size="sm" onClick={() => setPrimaryAccount(account.id)}>
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeAccount(account.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
