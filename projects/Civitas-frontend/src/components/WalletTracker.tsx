import { useEffect, useRef } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'

const API_URL = import.meta.env.VITE_API_URL || ''

declare global {
  interface Window {
    chatbase?: (...args: unknown[]) => void
  }
}

const WalletTracker = () => {
  const { activeAddress } = useWallet()
  const trackedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!activeAddress || trackedRef.current === activeAddress) return
    trackedRef.current = activeAddress

    // Track wallet connection
    fetch(`${API_URL}/v1/wallet/track-connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: activeAddress }),
    }).catch(() => {})

    // Identify wallet with Chatbase
    fetch(`${API_URL}/v1/wallet/chatbase-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: activeAddress }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token && window.chatbase) {
          window.chatbase('identify', { token: data.token })
        }
      })
      .catch(() => {})
  }, [activeAddress])

  return null
}

export default WalletTracker
