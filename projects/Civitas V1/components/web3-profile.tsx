"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Wallet, Shield, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Web3ProfileProps {
  address: string
  label?: string
}

export function Web3Profile({ address, label = "Wallet Address" }: Web3ProfileProps) {
  const [balance, setBalance] = useState<string>("0")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Mock balance fetch - in real app, this would query Algorand
    const fetchBalance = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setBalance("1,234.56")
      } catch (error) {
        console.error("Error fetching balance:", error)
      } finally {
        setLoading(false)
      }
    }

    if (address) {
      fetchBalance()
    }
  }, [address])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      })
    }
  }

  const openExplorer = () => {
    // Open Algorand explorer - using testnet for demo
    window.open(`https://testnet.algoexplorer.io/address/${address}`, "_blank")
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 8)}`
  }

  if (!address) {
    return (
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-6 text-center">
          <Wallet className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">No Wallet Connected</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Connect your Algorand wallet to access Civitas features
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">{label}</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Algorand Blockchain</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
            <Badge
              variant="outline"
              className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
            >
              <Shield className="w-3 h-3 mr-1" />
              Secure
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-100 dark:border-blue-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</p>
              <p className="text-lg font-mono text-gray-900 dark:text-white">{formatAddress(address)}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyAddress} className="text-xs bg-transparent">
                <Copy className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={openExplorer} className="text-xs bg-transparent">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-100 dark:border-blue-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Balance</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {loading ? <span className="animate-pulse">Loading...</span> : `${balance} ALGO`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Testnet</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
            Powered by Algorand • Civitas Digital Identity Platform
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
