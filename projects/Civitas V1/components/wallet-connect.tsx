"use client"

import { useState, useEffect } from "react"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { connectWallet, disconnectWallet, getWalletState, saveWalletState, type WalletState } from "@/lib/wallet"
import { useLanguage } from "@/components/language-provider"

export function WalletConnect() {
  const [walletState, setWalletState] = useState<WalletState>({ connected: false, address: null, balance: null })
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    // Load wallet state from localStorage on component mount
    const savedState = getWalletState()
    setWalletState(savedState)
  }, [])

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      const newState = await connectWallet()
      setWalletState(newState)
      saveWalletState(newState)

      toast({
        title: "Wallet Connected",
        description: `Address: ${newState.address?.substring(0, 8)}...${newState.address?.substring(36)}`,
      })
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast({
        title: "Connection Failed",
        description: "Could not connect to wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      const newState = await disconnectWallet()
      setWalletState(newState)
      saveWalletState(newState)

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      })
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
      toast({
        title: "Disconnection Failed",
        description: "Could not disconnect wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (walletState.connected && walletState.address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="font-medium">
            {walletState.address.substring(0, 6)}...{walletState.address.substring(38)}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleConnect} disabled={isConnecting}>
      <Wallet className="mr-2 h-4 w-4" />
      {isConnecting ? "Connecting..." : t("dashboard.connect")}
    </Button>
  )
}
