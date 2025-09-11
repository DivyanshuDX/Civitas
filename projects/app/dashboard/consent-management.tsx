"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Types
type Organization = {
  id: string
  name: string
  description: string
}

type DocumentAsset = {
  id: string
  document_type: string
  asset_id: number
  asset_name: string
  asset_unit_name: string
}

type ConsentRecord = {
  id: string
  organization_id: string
  organization_name: string
  document_asset_id: string
  document_type: string
  asset_name: string
  purpose: string
  status: "active" | "revoked" | "expired"
  created_at: string
  expiry_date: string
  revoked_at?: string
  transaction_hash: string
}

// Form schema for granting consent
const grantConsentSchema = z.object({
  organizationId: z.string({
    required_error: "Please select an organization",
  }),
  documentAssetId: z.string({
    required_error: "Please select a document",
  }),
  purpose: z.string().min(5, {
    message: "Purpose must be at least 5 characters",
  }),
  expiryDate: z
    .date({
      required_error: "Please select an expiry date",
    })
    .refine((date) => date > new Date(), {
      message: "Expiry date must be in the future",
    }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
})

export function ConsentManagement() {
  const { user, algorandAccount } = useAuth()
  const { toast } = useToast()
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [documentAssets, setDocumentAssets] = useState<DocumentAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [grantDialogOpen, setGrantDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Initialize form
  const form = useForm<z.infer<typeof grantConsentSchema>>({
    resolver: zodResolver(grantConsentSchema),
    defaultValues: {
      organizationId: "",
      documentAssetId: "",
      purpose: "",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      termsAccepted: false,
    },
  })

  // Fetch consents, organizations, and document assets
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      setLoading(true)
      try {
        // Fetch consents
        const consentsRes = await fetch(`/api/consents?userId=${user.id}`)
        if (consentsRes.ok) {
          const consentsData = await consentsRes.json()
          setConsents(consentsData)
        }

        // Fetch organizations
        const orgsRes = await fetch("/api/organizations")
        if (orgsRes.ok) {
          const orgsData = await orgsRes.json()
          setOrganizations(orgsData)
        }

        // Fetch document assets
        const assetsRes = await fetch(`/api/documents/assets?userId=${user.id}`)
        if (assetsRes.ok) {
          const assetsData = await assetsRes.json()
          setDocumentAssets(assetsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load consent data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof grantConsentSchema>) => {
    if (!user?.id || !algorandAccount?.address) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/consents/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          userAddress: algorandAccount.address,
          organizationId: values.organizationId,
          documentAssetId: values.documentAssetId,
          purpose: values.purpose,
          expiryDate: values.expiryDate.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to grant consent")
      }

      const result = await response.json()

      // Add the new consent to the list
      const selectedOrg = organizations.find((org) => org.id === values.organizationId)
      const selectedAsset = documentAssets.find((asset) => asset.id === values.documentAssetId)

      if (selectedOrg && selectedAsset) {
        const newConsent: ConsentRecord = {
          id: result.consentId,
          organization_id: selectedOrg.id,
          organization_name: selectedOrg.name,
          document_asset_id: selectedAsset.id,
          document_type: selectedAsset.document_type,
          asset_name: selectedAsset.asset_name,
          purpose: values.purpose,
          status: "active",
          created_at: new Date().toISOString(),
          expiry_date: values.expiryDate.toISOString(),
          transaction_hash: result.transactionHash,
        }

        setConsents((prev) => [newConsent, ...prev])
      }

      toast({
        title: "Consent Granted",
        description: "Successfully granted consent to access your document",
      })

      setGrantDialogOpen(false)
      form.reset()
    } catch (error) {
      console.error("Error granting consent:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to grant consent",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle consent revocation
  const handleRevokeConsent = async (consentId: string) => {
    if (!user?.id || !algorandAccount?.address) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/consents/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consentId,
          userId: user.id,
          userAddress: algorandAccount.address,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to revoke consent")
      }

      const result = await response.json()

      // Update the consent status in the list
      setConsents((prev) =>
        prev.map((consent) =>
          consent.id === consentId
            ? { ...consent, status: "revoked" as const, revoked_at: new Date().toISOString() }
            : consent,
        ),
      )

      toast({
        title: "Consent Revoked",
        description: "Successfully revoked consent",
      })
    } catch (error) {
      console.error("Error revoking consent:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke consent",
        variant: "destructive",
      })
    }
  }

  // Render status badge
  const renderStatusBadge = (status: string) => {
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
          <CardTitle>Consent Management</CardTitle>
          <CardDescription>Loading your consent records...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Consent Management</CardTitle>
          <CardDescription>Manage access to your verified badges</CardDescription>
        </div>
        <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
          <DialogTrigger asChild>
            <Button>Grant New Consent</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Grant Consent</DialogTitle>
              <DialogDescription>Allow an organization to access one of your verified badges</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="documentAssetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a document" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {documentAssets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.asset_name} ({asset.document_type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., KYC verification" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiry Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className="w-full pl-3 text-left font-normal">
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I understand that I am granting access to my digital document</FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Processing..." : "Grant Consent"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {consents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You haven't granted any consents yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Use the "Grant New Consent" button to allow organizations to access your Verified Badges.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consents.map((consent) => (
                <TableRow key={consent.id}>
                  <TableCell>{consent.organization_name}</TableCell>
                  <TableCell>{consent.asset_name}</TableCell>
                  <TableCell>{consent.purpose}</TableCell>
                  <TableCell>{format(new Date(consent.expiry_date), "PPP")}</TableCell>
                  <TableCell>{renderStatusBadge(consent.status)}</TableCell>
                  <TableCell>
                    {consent.status === "active" ? (
                      <Button variant="destructive" size="sm" onClick={() => handleRevokeConsent(consent.id)}>
                        Revoke
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Revoked
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
