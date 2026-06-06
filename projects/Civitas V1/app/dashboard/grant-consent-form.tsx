"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/components/language-provider"
import type { Organization, ConsentPurpose } from "@/lib/data"

const formSchema = z.object({
  organizationId: z.string({
    required_error: "Please select an organization",
  }),
  purposeId: z.string({
    required_error: "Please select a purpose",
  }),
  expiryDate: z
    .date({
      required_error: "Please select an expiry date",
    })
    .refine((date) => date > new Date(), {
      message: "Expiry date must be in the future",
    }),
})

type GrantConsentFormProps = {
  userAddress: string | null
  onClose: () => void
  onSuccess: () => void
}

export function GrantConsentForm({ userAddress, onClose, onSuccess }: GrantConsentFormProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [purposes, setPurposes] = useState<ConsentPurpose[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: "",
      purposeId: "",
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default to 1 year from now
    },
  })

  useEffect(() => {
    // Fetch organizations
    fetch("/api/organizations")
      .then((res) => res.json())
      .then((data) => setOrganizations(data))
      .catch((err) => console.error("Failed to fetch organizations:", err))

    // Fetch purposes
    fetch("/api/purposes")
      .then((res) => res.json())
      .then((data) => setPurposes(data))
      .catch((err) => console.error("Failed to fetch purposes:", err))
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userAddress) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/consents/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress,
          organizationId: values.organizationId,
          purposeId: values.purposeId,
          expiryDate: values.expiryDate.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to grant consent")
      }

      toast({
        title: "Consent Granted",
        description: `Transaction hash: ${data.transactionHash.substring(0, 10)}...`,
      })

      onSuccess()
    } catch (error) {
      console.error("Error granting consent:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to grant consent",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("dashboard.grant")}</DialogTitle>
          <DialogDescription>Grant consent to an organization for a specific purpose.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("consent.org")}</FormLabel>
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
              name="purposeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("consent.purpose")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a purpose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {purposes.map((purpose) => (
                        <SelectItem key={purpose.id} value={purpose.id}>
                          {purpose.name}
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
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("consent.expiry")}</FormLabel>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : t("common.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
