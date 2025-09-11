"use client"

import { useState } from "react"
import { Copy, Check, Eye, EyeOff, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type AccountDetailsProps = {
  address: string
  passphrase?: string
  privateKey?: string
}

export function AccountDetails({ address, passphrase, privateKey }: AccountDetailsProps) {
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedPassphrase, setCopiedPassphrase] = useState(false)
  const { toast } = useToast()

  // Explorer URL for TestNet
  const explorerUrl = `https://testnet.algoexplorer.io/address/${address}`

  const copyToClipboard = async (text: string, type: "address" | "passphrase" | "privateKey") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "address") {
        setCopiedAddress(true)
        setTimeout(() => setCopiedAddress(false), 2000)
      } else if (type === "passphrase") {
        setCopiedPassphrase(true)
        setTimeout(() => setCopiedPassphrase(false), 2000)
      }
      toast({
        title: "Copied to clipboard",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard`,
      })
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Algorand Account</CardTitle>
        <CardDescription>
          This is your Algorand TestNet account information. Keep your passphrase and private key secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Account Details</TabsTrigger>
            <TabsTrigger value="security">Security Keys</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4 mt-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium">Address</div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => copyToClipboard(address, "address")}
                  >
                    {copiedAddress ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => window.open(explorerUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="font-mono text-xs bg-muted p-2 rounded-md overflow-x-auto">{address}</div>
            </div>

            <div>
              <div className="text-sm font-medium mb-1">Network</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Algorand TestNet</span>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-1">Account Type</div>
              <div className="text-sm">Standard Account (Non-custodial)</div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            {passphrase && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">Recovery Passphrase (25 words)</div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setShowPassphrase(!showPassphrase)}
                    >
                      {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copyToClipboard(passphrase, "passphrase")}
                    >
                      {copiedPassphrase ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="font-mono text-xs bg-muted p-2 rounded-md overflow-x-auto">
                  {showPassphrase ? passphrase : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This 25-word passphrase is the master key to your Algorand account. Never share it with anyone.
                </p>
              </div>
            )}

            {privateKey && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">Private Key</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="font-mono text-xs bg-muted p-2 rounded-md overflow-x-auto">
                  {showPrivateKey ? privateKey : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This is the encoded private key for your account. Keep it secure.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col text-xs text-muted-foreground">
        <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md mb-2 w-full">
          <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">Security Warning</p>
          <p className="text-amber-700 dark:text-amber-400">
            Never share your recovery passphrase or private key with anyone. Anyone with access to these can control
            your account.
          </p>
        </div>
        <p>This is a TestNet account. In a production environment, you would have additional security options.</p>
      </CardFooter>
    </Card>
  )
}
