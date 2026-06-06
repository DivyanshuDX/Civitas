"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, Plus, Minus, X, Loader2, Search } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/components/language-provider"
import { documentFields, type DocumentType } from "@/lib/data"

const formSchema = z.object({
  userAddress: z.string().min(42, {
    message: "Please enter a valid wallet address (42 characters)",
  }),
  purpose: z.string().min(10, {
    message: "Purpose must be at least 10 characters",
  }),
  expiryDate: z
    .date({
      required_error: "Please select an expiry date",
    })
    .refine((date) => date > new Date(), {
      message: "Expiry date must be in the future",
    }),
  documentTypes: z.array(z.string()).min(1, {
    message: "Please select at least one document type",
  }),
  fields: z.record(z.array(z.string())).optional(),
})

type CreateRequestFormProps = {
  organizationId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateRequestForm({ organizationId, open, onClose, onSuccess }: CreateRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDocTypes, setSelectedDocTypes] = useState<DocumentType[]>([])
  const { toast } = useToast()
  const { t } = useLanguage()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userAddress: "",
      purpose: "",
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
      documentTypes: [],
      fields: {},
    },
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        userAddress: "",
        purpose: "",
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        documentTypes: [],
        fields: {},
      })
      setSelectedDocTypes([])
    }
  }, [open, form])

  const watchDocumentTypes = form.watch("documentTypes")

  useEffect(() => {
    // Update selected document types when the form value changes
    const docTypes = watchDocumentTypes as DocumentType[]
    setSelectedDocTypes(docTypes)

    // Initialize fields for each selected document type
    const fields = { ...form.getValues("fields") }
    docTypes.forEach((docType) => {
      if (!fields[docType]) {
        fields[docType] = []
      }
    })

    // Remove fields for unselected document types
    Object.keys(fields).forEach((key) => {
      if (!docTypes.includes(key as DocumentType)) {
        delete fields[key]
      }
    })

    form.setValue("fields", fields)
  }, [watchDocumentTypes, form])

  const getFieldsByDocumentType = (docType: DocumentType) => {
    return documentFields.filter((field) => field.documentType === docType)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      // Format the data for the API
      const requestData = {
        organizationId,
        userAddress: values.userAddress,
        purpose: values.purpose,
        expiryDate: values.expiryDate.toISOString(),
        documentTypes: values.documentTypes,
        fields: values.fields,
      }

      console.log("Sending request data:", requestData)

      // Send the request to the API
      const response = await fetch("/api/access-requests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create request")
      }

      toast({
        title: "Request Created",
        description: `Document access request has been sent to ${values.userAddress.substring(0, 6)}...${values.userAddress.substring(values.userAddress.length - 4)}`,
      })

      onSuccess()
      onClose() // Close the dialog after successful submission
    } catch (error) {
      console.error("Error creating request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? `Failed to create request: ${error.message}` : "Failed to create request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("admin.newRequest")}</DialogTitle>
          <DialogDescription>Create a new document access request for a user.</DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Algorand Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Enter Algorand address" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>The Algorand address of the user you're requesting documents from.</FormDescription>
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
                    <Textarea
                      placeholder="Explain why you need access to these documents..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Clearly explain why you need these documents and how they will be used.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Request Expiry Date</FormLabel>
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
                  <FormDescription>
                    The user must respond to this request before this date, or it will expire.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentTypes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Document Types</FormLabel>
                    <FormDescription>Select the documents you need access to.</FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="documentTypes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("aadhaar")}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...field.value, "aadhaar"]
                                  : field.value?.filter((value) => value !== "aadhaar")
                                field.onChange(updatedValue)
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Aadhaar</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="documentTypes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("pan")}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...field.value, "pan"]
                                  : field.value?.filter((value) => value !== "pan")
                                field.onChange(updatedValue)
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">PAN Card</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="documentTypes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("passport")}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...field.value, "passport"]
                                  : field.value?.filter((value) => value !== "passport")
                                field.onChange(updatedValue)
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Passport</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="documentTypes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("driving_license")}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...field.value, "driving_license"]
                                  : field.value?.filter((value) => value !== "driving_license")
                                field.onChange(updatedValue)
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Driving License</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="documentTypes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("voter_id")}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...field.value, "voter_id"]
                                  : field.value?.filter((value) => value !== "voter_id")
                                field.onChange(updatedValue)
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Voter ID</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedDocTypes.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Required Fields</h3>
                  <p className="text-sm text-muted-foreground">
                    Select the specific fields you need from each document.
                  </p>
                </div>

                {selectedDocTypes.map((docType) => (
                  <div key={docType} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">{t(`document.${docType}`)}</h4>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const fields = getFieldsByDocumentType(docType).map((field) => field.id)
                            const currentFields = { ...form.getValues("fields") }
                            form.setValue("fields", {
                              ...currentFields,
                              [docType]: fields,
                            })
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentFields = { ...form.getValues("fields") }
                            form.setValue("fields", {
                              ...currentFields,
                              [docType]: [],
                            })
                          }}
                        >
                          <Minus className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getFieldsByDocumentType(docType).map((field) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`fields.${docType}`}
                          render={({ field: formField }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={formField.value?.includes(field.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = formField.value || []
                                    const updatedValue = checked
                                      ? [...currentValue, field.id]
                                      : currentValue.filter((value) => value !== field.id)
                                    formField.onChange(updatedValue)
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">{field.name}</FormLabel>
                                <p className="text-xs text-muted-foreground">{field.description}</p>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
