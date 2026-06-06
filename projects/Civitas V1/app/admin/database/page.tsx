"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Database,
  Users,
  FileText,
  Key,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Table,
  Shield,
  FileCheck,
  UserCheck,
  FileCheck2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type OperationStatus = {
  isLoading: boolean
  success: boolean | null
  message: string
  details?: string
}

export default function DatabaseManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("setup")

  // Operation statuses
  const [seedStatus, setSeedStatus] = useState<OperationStatus>({
    isLoading: false,
    success: null,
    message: "",
  })

  const [documentAssetsStatus, setDocumentAssetsStatus] = useState<OperationStatus>({
    isLoading: false,
    success: null,
    message: "",
  })

  const [accessRequestsStatus, setAccessRequestsStatus] = useState<OperationStatus>({
    isLoading: false,
    success: null,
    message: "",
  })

  const [consentTablesStatus, setConsentTablesStatus] = useState<OperationStatus>({
    isLoading: false,
    success: null,
    message: "",
  })

  const [dataSeparationStatus, setDataSeparationStatus] = useState<OperationStatus>({
    isLoading: false,
    success: null,
    message: "",
  })

  const [dummyDataStatus, setDummyDataStatus] = useState<OperationStatus>({
    isLoading: false,
    success: null,
    message: "",
  })

  const [dbStatusData, setDbStatusData] = useState<any>(null)
  const [dbStatusLoading, setDbStatusLoading] = useState(false)

  // Run seed database operation
  const runSeedDatabase = async () => {
    try {
      setSeedStatus({ isLoading: true, success: null, message: "Seeding database..." })

      const response = await fetch("/api/seed")
      const data = await response.json()

      if (data.success) {
        setSeedStatus({
          isLoading: false,
          success: true,
          message: "Database seeded successfully",
          details: JSON.stringify(data.data, null, 2),
        })
        toast({
          title: "Success",
          description: "Database seeded successfully",
        })
      } else {
        setSeedStatus({
          isLoading: false,
          success: false,
          message: data.message || "Failed to seed database",
          details: data.error,
        })
        toast({
          title: "Error",
          description: data.message || "Failed to seed database",
          variant: "destructive",
        })
      }
    } catch (error) {
      setSeedStatus({
        isLoading: false,
        success: false,
        message: "An error occurred",
        details: error instanceof Error ? error.message : String(error),
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Run document assets setup
  const setupDocumentAssets = async () => {
    try {
      setDocumentAssetsStatus({ isLoading: true, success: null, message: "Setting up document assets..." })

      // Create a new endpoint for this specific operation
      const response = await fetch("/api/seed/setup-document-assets")
      const data = await response.json()

      if (data.success) {
        setDocumentAssetsStatus({
          isLoading: false,
          success: true,
          message: "Document assets set up successfully",
        })
        toast({
          title: "Success",
          description: "Document assets set up successfully",
        })
      } else {
        setDocumentAssetsStatus({
          isLoading: false,
          success: false,
          message: data.message || "Failed to set up document assets",
          details: data.error,
        })
        toast({
          title: "Error",
          description: data.message || "Failed to set up document assets",
          variant: "destructive",
        })
      }
    } catch (error) {
      setDocumentAssetsStatus({
        isLoading: false,
        success: false,
        message: "An error occurred",
        details: error instanceof Error ? error.message : String(error),
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Run access requests setup
  const setupAccessRequests = async () => {
    try {
      setAccessRequestsStatus({ isLoading: true, success: null, message: "Setting up access requests..." })

      const response = await fetch("/api/seed/setup-access-requests")
      const data = await response.json()

      if (data.success) {
        setAccessRequestsStatus({
          isLoading: false,
          success: true,
          message: "Access requests set up successfully",
        })
        toast({
          title: "Success",
          description: "Access requests set up successfully",
        })
      } else {
        setAccessRequestsStatus({
          isLoading: false,
          success: false,
          message: data.message || "Failed to set up access requests",
          details: data.error,
        })
        toast({
          title: "Error",
          description: data.message || "Failed to set up access requests",
          variant: "destructive",
        })
      }
    } catch (error) {
      setAccessRequestsStatus({
        isLoading: false,
        success: false,
        message: "An error occurred",
        details: error instanceof Error ? error.message : String(error),
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Run consent tables setup
  const setupConsentTables = async () => {
    try {
      setConsentTablesStatus({ isLoading: true, success: null, message: "Setting up consent tables..." })

      const response = await fetch("/api/seed/setup-consent-tables")
      const data = await response.json()

      if (data.success) {
        setConsentTablesStatus({
          isLoading: false,
          success: true,
          message: "Consent tables set up successfully",
        })
        toast({
          title: "Success",
          description: "Consent tables set up successfully",
        })
      } else {
        setConsentTablesStatus({
          isLoading: false,
          success: false,
          message: data.message || "Failed to set up consent tables",
          details: data.error,
        })
        toast({
          title: "Error",
          description: data.message || "Failed to set up consent tables",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConsentTablesStatus({
        isLoading: false,
        success: false,
        message: "An error occurred",
        details: error instanceof Error ? error.message : String(error),
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Run data separation fix
  const fixDataSeparation = async () => {
    try {
      setDataSeparationStatus({ isLoading: true, success: null, message: "Fixing data separation..." })

      const response = await fetch("/api/seed/fix-data-separation")
      const data = await response.json()

      if (data.success) {
        setDataSeparationStatus({
          isLoading: false,
          success: true,
          message: "Data separation fixed successfully",
        })
        toast({
          title: "Success",
          description: "Data separation fixed successfully",
        })
      } else {
        setDataSeparationStatus({
          isLoading: false,
          success: false,
          message: data.message || "Failed to fix data separation",
          details: data.error,
        })
        toast({
          title: "Error",
          description: data.message || "Failed to fix data separation",
          variant: "destructive",
        })
      }
    } catch (error) {
      setDataSeparationStatus({
        isLoading: false,
        success: false,
        message: "An error occurred",
        details: error instanceof Error ? error.message : String(error),
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Insert dummy data
  const insertDummyData = async () => {
    try {
      setDummyDataStatus({ isLoading: true, success: null, message: "Inserting dummy data..." })

      const response = await fetch("/api/seed/insert-dummy-data")
      const data = await response.json()

      if (data.success) {
        setDummyDataStatus({
          isLoading: false,
          success: true,
          message: "Dummy data inserted successfully",
        })
        toast({
          title: "Success",
          description: "Dummy data inserted successfully",
        })
      } else {
        setDummyDataStatus({
          isLoading: false,
          success: false,
          message: data.message || "Failed to insert dummy data",
          details: data.error,
        })
        toast({
          title: "Error",
          description: data.message || "Failed to insert dummy data",
          variant: "destructive",
        })
      }
    } catch (error) {
      setDummyDataStatus({
        isLoading: false,
        success: false,
        message: "An error occurred",
        details: error instanceof Error ? error.message : String(error),
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Get database status
  const getDatabaseStatus = async () => {
    try {
      setDbStatusLoading(true)

      const response = await fetch("/api/admin/db-status")
      const data = await response.json()

      if (data.success) {
        setDbStatusData(data.data)
        toast({
          title: "Success",
          description: "Database status retrieved successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to get database status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setDbStatusLoading(false)
    }
  }

  // Render status indicator
  const renderStatus = (status: OperationStatus) => {
    if (status.isLoading) {
      return (
        <div className="flex items-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>{status.message}</span>
        </div>
      )
    }

    if (status.success === true) {
      return (
        <div className="flex items-center text-green-500">
          <CheckCircle className="mr-2 h-4 w-4" />
          <span>{status.message}</span>
        </div>
      )
    }

    if (status.success === false) {
      return (
        <div className="flex items-center text-red-500">
          <XCircle className="mr-2 h-4 w-4" />
          <span>{status.message}</span>
        </div>
      )
    }

    return null
  }

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Database Management</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Database Setup</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="status">Database Status</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Initial Database Setup
                </CardTitle>
                <CardDescription>Create initial database structure and seed with demo users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will create the basic database structure and add demo user and admin accounts.
                </p>
                <Button onClick={runSeedDatabase} disabled={seedStatus.isLoading}>
                  {seedStatus.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Seeding Database...
                    </>
                  ) : (
                    "Seed Database"
                  )}
                </Button>
                <div className="mt-4">{renderStatus(seedStatus)}</div>
                {seedStatus.details && (
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="details">
                      <AccordionTrigger className="text-sm">View Details</AccordionTrigger>
                      <AccordionContent>
                        <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
                          {seedStatus.details}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Assets Setup
                </CardTitle>
                <CardDescription>Set up document assets tables and sample documents</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will create the document assets tables and add sample documents.
                </p>
                <Button onClick={setupDocumentAssets} disabled={documentAssetsStatus.isLoading}>
                  {documentAssetsStatus.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    "Setup Document Assets"
                  )}
                </Button>
                <div className="mt-4">{renderStatus(documentAssetsStatus)}</div>
                {documentAssetsStatus.details && (
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="details">
                      <AccordionTrigger className="text-sm">View Details</AccordionTrigger>
                      <AccordionContent>
                        <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
                          {documentAssetsStatus.details}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Access Requests Setup
                </CardTitle>
                <CardDescription>Set up access requests tables and sample requests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will create the access requests tables and add sample requests.
                </p>
                <Button onClick={setupAccessRequests} disabled={accessRequestsStatus.isLoading}>
                  {accessRequestsStatus.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    "Setup Access Requests"
                  )}
                </Button>
                <div className="mt-4">{renderStatus(accessRequestsStatus)}</div>
                {accessRequestsStatus.details && (
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="details">
                      <AccordionTrigger className="text-sm">View Details</AccordionTrigger>
                      <AccordionContent>
                        <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
                          {accessRequestsStatus.details}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck2 className="h-5 w-5" />
                  Consent Tables Setup
                </CardTitle>
                <CardDescription>Set up consent management tables and sample data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will create the consent management tables and add sample data.
                </p>
                <Button onClick={setupConsentTables} disabled={consentTablesStatus.isLoading}>
                  {consentTablesStatus.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    "Setup Consent Tables"
                  )}
                </Button>
                <div className="mt-4">{renderStatus(consentTablesStatus)}</div>
                {consentTablesStatus.details && (
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="details">
                      <AccordionTrigger className="text-sm">View Details</AccordionTrigger>
                      <AccordionContent>
                        <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
                          {consentTablesStatus.details}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Fix Data Separation
                </CardTitle>
                <CardDescription>Ensure proper separation of user data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will fix data separation issues and ensure each user only sees their own data.
                </p>
                <Button onClick={fixDataSeparation} disabled={dataSeparationStatus.isLoading}>
                  {dataSeparationStatus.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fixing Data Separation...
                    </>
                  ) : (
                    "Fix Data Separation"
                  )}
                </Button>
                <div className="mt-4">{renderStatus(dataSeparationStatus)}</div>
                {dataSeparationStatus.details && (
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="details">
                      <AccordionTrigger className="text-sm">View Details</AccordionTrigger>
                      <AccordionContent>
                        <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
                          {dataSeparationStatus.details}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Insert Dummy Data
                </CardTitle>
                <CardDescription>Insert additional dummy data for testing</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will insert additional dummy data for testing purposes.
                </p>
                <Button onClick={insertDummyData} disabled={dummyDataStatus.isLoading}>
                  {dummyDataStatus.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inserting Dummy Data...
                    </>
                  ) : (
                    "Insert Dummy Data"
                  )}
                </Button>
                <div className="mt-4">{renderStatus(dummyDataStatus)}</div>
                {dummyDataStatus.details && (
                  <Accordion type="single" collapsible className="mt-4">
                    <AccordionItem value="details">
                      <AccordionTrigger className="text-sm">View Details</AccordionTrigger>
                      <AccordionContent>
                        <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
                          {dummyDataStatus.details}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Reset Database
                </CardTitle>
                <CardDescription>Reset specific tables or the entire database</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will reset specific tables or the entire database. Use with caution!
                </p>
                <div className="space-y-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      toast({
                        title: "Not Implemented",
                        description: "This feature is not yet implemented",
                      })
                    }}
                  >
                    Reset All Tables
                  </Button>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <AlertCircle className="inline-block mr-1 h-4 w-4" />
                  Warning: This action cannot be undone.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Database Status
              </CardTitle>
              <CardDescription>View the current status of the database</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={getDatabaseStatus} disabled={dbStatusLoading} className="mb-4">
                {dbStatusLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Refresh Database Status"
                )}
              </Button>

              {dbStatusData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tables</h3>
                    <div className="bg-muted p-3 rounded-md">
                      <ul className="space-y-1 text-sm">
                        {dbStatusData.tables.map((table: string) => (
                          <li key={table} className="flex items-center">
                            <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                            {table}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Record Counts</h3>
                    <div className="bg-muted p-3 rounded-md">
                      <ul className="space-y-1 text-sm">
                        {Object.entries(dbStatusData.counts).map(([table, count]) => (
                          <li key={table} className="flex items-center justify-between">
                            <span>{table}</span>
                            <span className="font-mono">{String(count)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="mx-auto h-12 w-12 opacity-20 mb-2" />
                  <p>Click the button above to load database status</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Database Health
              </CardTitle>
              <CardDescription>Check the health of your database</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  toast({
                    title: "Not Implemented",
                    description: "This feature is not yet implemented",
                  })
                }}
                className="mb-4"
              >
                Run Health Check
              </Button>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Database Health Check</AlertTitle>
                <AlertDescription>
                  This feature will check for common issues like missing tables, inconsistent data, and performance
                  problems.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
