"use client"

import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import algosdk from "algosdk"

// Mock document types for DigiLocker
const DOCUMENT_TYPES = [
  { id: "aadhaar", name: "Aadhaar Card", fields: ["name", "dob", "gender", "address", "aadhaar_number"] },
  { id: "pan", name: "PAN Card", fields: ["name", "pan_number", "father_name", "dob"] },
  {
    id: "driving_license",
    name: "Driving License",
    fields: ["name", "dob", "address", "license_number", "valid_until", "vehicle_class"],
  },
]

// Connect to TestNet
function getAlgodClient() {
  const algodToken = ""
  const algodServer = "https://testnet-api.algonode.cloud"
  const algodPort = 443
  return new algosdk.Algodv2(algodToken, algodServer, algodPort)
}

// Get indexer client for Voi testnet
function getIndexerClient() {
  return new algosdk.Indexer("", "https://testnet-idx.voi.nodely.dev", "")
}

interface DigiLockerProps {
  onConnectionChange?: (connected: boolean) => void
  onDigitalTwinsUpdate?: (count: number) => void
}

export function DigiLocker({ onConnectionChange, onDigitalTwinsUpdate }: DigiLockerProps) {
  const { user, algorandAccount } = useAuth()
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [assetName, setAssetName] = useState("")
  const [creating, setCreating] = useState(false)
  const [txStatus, setTxStatus] = useState<string | null>(null)
  const [assetId, setAssetId] = useState<number | null>(null)
  const [assetUrl, setAssetUrl] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [digitalTwins, setDigitalTwins] = useState<any[]>([])
  const [loadingTwins, setLoadingTwins] = useState(false)
  const { toast } = useToast()

  // Fetch verified badges when component mounts or after creating a new one
  useEffect(() => {
    if (connected) {
      fetchDigitalTwins()
    }
  }, [connected])

  // Notify parent components when connection or digital twins change
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(connected)
    }
  }, [connected, onConnectionChange])

  useEffect(() => {
    if (onDigitalTwinsUpdate) {
      onDigitalTwinsUpdate(digitalTwins.length)
    }
  }, [digitalTwins.length, onDigitalTwinsUpdate])

  const fetchDigitalTwins = async () => {
    try {
      setLoadingTwins(true)

      // Try different approaches to get verified badges
      let twins: any[] = []

      // If we have an Algorand account, try to fetch from blockchain first
      if (algorandAccount) {
        try {
          // Initialize the indexer client for Voi testnet
          const indexerClient = getIndexerClient()

          // Fetch account assets
          const accountAssets = await indexerClient.lookupAccountAssets(algorandAccount.address).do()
          console.log("Fetched assets from Voi indexer:", accountAssets)

          // Process the assets
          const assets = accountAssets.assets || []
          const assetDetails = await Promise.all(
            assets.map(async (asset) => {
              try {
                // Get asset info from the indexer
                const assetInfo = await indexerClient.lookupAssetByID(asset["asset-id"]).do()

                return {
                  id: `algo-${asset["asset-id"]}`,
                  asset_id: asset["asset-id"].toString(),
                  document_type: assetInfo.asset.params.name?.split("_")[0]?.toLowerCase() || "document",
                  created_at: new Date().toISOString(),
                  amount: asset.amount,
                  is_frozen: asset["is-frozen"],
                  tokenized: true,
                  verified: true,
                  params: assetInfo.asset.params,
                }
              } catch (error) {
                console.error(`Error fetching asset ${asset["asset-id"]}:`, error)
                return null
              }
            }),
          )

          // Filter out null values
          twins = assetDetails.filter((asset) => asset !== null)

          // Save to Supabase
          for (const twin of twins) {
            try {
              await supabase.from("document_assets").upsert(
                [
                  {
                    user_id: user?.id,
                    document_type: twin.document_type,
                    asset_id: twin.asset_id,
                    tokenized: true,
                    verified: true,
                    metadata: {
                      amount: twin.amount,
                      is_frozen: twin.is_frozen,
                      params: twin.params,
                    },
                  },
                ],
                { onConflict: "asset_id" },
              )
            } catch (dbError) {
              console.warn("Database error when saving asset:", dbError)
            }
          }
        } catch (blockchainError) {
          console.warn("Could not fetch from blockchain:", blockchainError)
        }
      }

      // If we couldn't get twins from blockchain, try database
      if (twins.length === 0) {
        // Try document_assets table
        const { data: assetData, error: assetError } = await supabase
          .from("document_assets")
          .select("*")
          .filter("asset_id", "not.is", null)
          .order("created_at", { ascending: false })

        if (!assetError && assetData && assetData.length > 0) {
          twins = assetData
        }
      }

      // If we still don't have any twins, create mock data for demo purposes
      if (twins.length === 0) {
        // Create mock data for demonstration
        twins = [
          {
            id: "1",
            document_type: "aadhaar",
            asset_id: "738575873",
            created_at: new Date().toISOString(),
            verified: true,
          },
          {
            id: "2",
            document_type: "pan",
            asset_id: "738575610",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            verified: true,
          },
          {
            id: "3",
            document_type: "driving_license",
            asset_id: "738619279",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            verified: true,
          },
        ]
      }

      setDigitalTwins(twins)
    } catch (error) {
      console.error("Error in fetchDigitalTwins:", error)
    } finally {
      setLoadingTwins(false)
    }
  }

  const connectToDigiLocker = async () => {
    try {
      setConnecting(true)
      // Simulate DigiLocker connection
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setConnected(true)
      toast({
        title: "Connected to DigiLocker",
        description: "Successfully connected to DigiLocker API",
      })
    } catch (error) {
      console.error("Error connecting to DigiLocker:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to DigiLocker API",
        variant: "destructive",
      })
    } finally {
      setConnecting(false)
    }
  }

  const handleDocumentSelect = (docType: string) => {
    setSelectedDocument(docType)
    // Pre-select all fields by default
    const doc = DOCUMENT_TYPES.find((d) => d.id === docType)
    if (doc) {
      setSelectedFields(doc.fields)
      setAssetName(`${doc.name.replace(" ", "_")}_Twin`)
    }
  }

  const toggleField = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter((f) => f !== field))
    } else {
      setSelectedFields([...selectedFields, field])
    }
  }

  const createDigitalTwin = async () => {
    // Reset previous state
    setTxStatus(null)
    setAssetId(null)
    setAssetUrl(null)
    setDebugInfo(null)

    try {
      setCreating(true)
      setTxStatus("Preparing transaction...")

      // Use the authenticated user's Algorand account if available
      let address, privateKey, userId

      if (algorandAccount) {
        address = algorandAccount.address
        privateKey = algorandAccount.privateKey
        userId = user?.id

        setDebugInfo(`Using account: ${address}`)
      } else {
        // Get all Algorand accounts from Supabase as fallback
        const { data: accountsData, error: accountsError } = await supabase.from("algorand_accounts").select("*")

        if (accountsError) {
          throw new Error(`Failed to retrieve Algorand accounts: ${accountsError.message}`)
        }

        if (!accountsData || accountsData.length === 0) {
          throw new Error("No Algorand accounts found in the database")
        }

        // Use the first account for demo purposes
        const accountData = accountsData[0]

        // Log the account data for debugging
        console.log("Using Algorand account:", {
          address: accountData.address,
          hasPrivateKey: !!accountData.private_key,
          userId: accountData.user_id,
        })

        setDebugInfo(`Using account: ${accountData.address}`)

        if (!accountData.address) {
          throw new Error("Account address is null or undefined")
        }

        if (!accountData.private_key) {
          throw new Error("Account private key is null or undefined")
        }

        if (!accountData.user_id) {
          throw new Error("User ID is null or undefined")
        }

        address = accountData.address
        privateKey = accountData.private_key
        userId = accountData.user_id
      }

      // Convert the private key from base64 string back to Uint8Array
      const privateKeyUint8 = new Uint8Array(Buffer.from(privateKey, "base64"))

      setTxStatus("Connecting to Algorand network...")

      // Connect to the Algorand node
      const algodClient = getAlgodClient()

      // Get suggested transaction parameters
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Set asset name and unit name based on document type
      let unitName = ""
      if (selectedDocument === "aadhaar") {
        unitName = "AADHR"
      } else if (selectedDocument === "pan") {
        unitName = "PAN"
      } else if (selectedDocument === "driving_license") {
        unitName = "DL"
      } else {
        unitName = selectedDocument?.substring(0, 4).toUpperCase() || "DOC"
      }

      setTxStatus("Creating asset on blockchain...")

      // Log transaction parameters for debugging
      console.log("Creating asset with parameters:", {
        from: address,
        unitName: unitName,
        assetName: assetName || `${selectedDocument?.toUpperCase()}_TWIN`,
      })

      // Create an asset creation transaction
      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: address,
        suggestedParams,
        defaultFrozen: false,
        unitName: unitName,
        assetName: assetName || `${selectedDocument?.toUpperCase()}_TWIN`,
        manager: address,
        reserve: address,
        freeze: address,
        clawback: address,
        total: 1, // Only one token per document (NFT-like)
        decimals: 0, // No decimals for document tokens
      })

      // Sign the transaction
      const signedTxn = algosdk.signTransaction(txn, privateKeyUint8)

      setTxStatus("Submitting transaction to network...")

      // Submit the transaction to the network
      await algodClient.sendRawTransaction(signedTxn.blob).do()

      setTxStatus("Waiting for confirmation...")

      // Wait for confirmation
      const result = await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 3)

      // Get the asset ID
      const newAssetId = result["asset-index"]
      setAssetId(newAssetId)

      // Generate asset URL
      const url = `https://lora.algokit.io/testnet/asset/${newAssetId}`
      setAssetUrl(url)

      setTxStatus("Updating database records...")

      // Generate a unique document ID
      const documentId = `${selectedDocument}_${Date.now()}`

      // Store the new Verified Badge directly in our state
      const newTwin = {
        id: documentId,
        document_type: selectedDocument,
        asset_id: newAssetId.toString(),
        created_at: new Date().toISOString(),
        verified: true,
      }

      setDigitalTwins((prev) => [newTwin, ...prev])

      // Save to database
      try {
        const { error: assetError } = await supabase.from("document_assets").insert([
          {
            user_id: userId,
            document_type: selectedDocument,
            document_id: documentId,
            verified: true,
            asset_id: newAssetId.toString(),
            tokenized: true,
            metadata: {
              source: "digilocker",
              selected_fields: selectedFields,
              transaction_id: txn.txID().toString(),
            },
          },
        ])

        if (assetError) {
          console.warn("Could not save to database, but asset was created:", assetError)
        }
      } catch (dbError) {
        console.warn("Database error, but asset was created:", dbError)
      }

      setTxStatus("Verified Badge created successfully!")

      toast({
        title: "Verified Badge Created",
        description: `Successfully created Verified Badge with Asset ID: ${newAssetId}`,
      })

      // Reset state after success
      setTimeout(() => {
        setSelectedDocument(null)
        setSelectedFields([])
        setAssetName("")
      }, 3000)
    } catch (error: any) {
      console.error("Error creating Verified Badge:", error)
      setTxStatus(`Error: ${error.message || "Unknown error"}`)
      setDebugInfo(`Error details: ${JSON.stringify(error)}`)
      toast({
        title: "Error Creating Verified Badge",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  if (!connected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>DigiLocker Integration</CardTitle>
          <CardDescription>
            Connect to DigiLocker to import your verified documents and create verified badges
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="mb-6 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">
              DigiLocker provides access to authentic digital documents in your original form issued by various issuers.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={connectToDigiLocker} disabled={connecting}>
            {connecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect to DigiLocker"
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>DigiLocker Documents</CardTitle>
            <CardDescription>Select a document to create a verified badge</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="document-type">Select Document Type</Label>
            <Select onValueChange={handleDocumentSelect} value={selectedDocument || ""}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select a document" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDocument && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Create Verified Badge</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Verified Badge</DialogTitle>
                  <DialogDescription>Select which fields to include in your verified badge</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="asset-name">Asset Name</Label>
                    <Input
                      id="asset-name"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="Enter asset name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Select Fields</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {DOCUMENT_TYPES.find((d) => d.id === selectedDocument)?.fields.map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={field}
                            checked={selectedFields.includes(field)}
                            onCheckedChange={() => toggleField(field)}
                          />
                          <Label htmlFor={field} className="capitalize">
                            {field.replace("_", " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {txStatus && (
                    <div
                      className={`mt-2 p-3 rounded-md ${
                        txStatus.startsWith("Error")
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : txStatus === "Verified Badge created successfully!"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {txStatus.startsWith("Error") && <AlertCircle className="inline-block mr-2 h-4 w-4" />}
                      {txStatus === "Verified Badge created successfully!" && (
                        <CheckCircle className="inline-block mr-2 h-4 w-4" />
                      )}
                      {!txStatus.startsWith("Error") && txStatus !== "Verified Badge created successfully!" && (
                        <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                      )}
                      {txStatus}
                    </div>
                  )}

                  {debugInfo && (
                    <div className="mt-2 p-3 rounded-md bg-gray-50 text-gray-700 border border-gray-200 text-xs font-mono">
                      {debugInfo}
                    </div>
                  )}

                  {assetId && assetUrl && (
                    <div className="mt-2 p-3 rounded-md bg-green-50 text-green-700 border border-green-200">
                      <p className="font-medium">Asset ID: {assetId}</p>
                      <p className="mt-1">
                        <a
                          href={assetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View on Blockchain Explorer
                        </a>
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={createDigitalTwin}
                    disabled={
                      creating || selectedFields.length === 0 || txStatus === "Verified Badge created successfully!"
                    }
                  >
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Verified Badge"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Display verified badges */}
          {loadingTwins ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : digitalTwins.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Your Verified Badges</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {digitalTwins.map((twin) => (
                  <Card key={twin.id || twin.asset_id} className="overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          {twin.document_type?.toUpperCase() || "Document"} Twin
                        </CardTitle>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" /> Tokenized
                        </Badge>
                      </div>
                      <CardDescription>Asset ID: {twin.asset_id}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-muted-foreground">Created:</span>
                          <span>{new Date(twin.created_at).toLocaleDateString()}</span>
                        </div>
                        {twin.amount !== undefined && (
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">Amount:</span>
                            <span>{twin.amount}</span>
                          </div>
                        )}
                        {twin.params && (
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">Unit:</span>
                            <span>{twin.params.unitName || "N/A"}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="text-green-600">Active</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-primary/5 border-t">
                      <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                        <a
                          href={`https://lora.algokit.io/testnet/asset/${twin.asset_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Blockchain
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Verified Badge</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You haven't created any verified badges yet. Select a document type and create your first one!
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setConnected(false)}>
          Disconnect
        </Button>
        <div className="text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 inline mr-1" />
          Demo mode: No real documents are accessed
        </div>
      </CardFooter>
    </Card>
  )
}
