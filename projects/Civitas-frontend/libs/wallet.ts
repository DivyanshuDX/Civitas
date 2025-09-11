// Mock wallet integration

import { v4 as uuidv4 } from "uuid"

// Types
export type WalletState = {
  connected: boolean
  address: string | null
  balance: string | null
}

// Initial wallet state
const initialWalletState: WalletState = {
  connected: false,
  address: null,
  balance: null,
}

// Connect wallet
export async function connectWallet(): Promise<WalletState> {
  // In a real implementation, this would connect to MetaMask or another wallet
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate connection delay

  // Generate a random wallet address
  const address = `0x${uuidv4().replace(/-/g, "").substring(0, 40)}`

  // Generate a random balance (between 0.1 and 10 ETH)
  const balance = (Math.random() * 9.9 + 0.1).toFixed(4)

  return {
    connected: true,
    address,
    balance: `${balance} ETH`,
  }
}

// Disconnect wallet
export async function disconnectWallet(): Promise<WalletState> {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate disconnection delay
  return initialWalletState
}

// Get wallet state from localStorage
export function getWalletState(): WalletState {
  if (typeof window === "undefined") {
    return initialWalletState
  }

  const savedState = localStorage.getItem("walletState")
  if (!savedState) {
    return initialWalletState
  }

  try {
    return JSON.parse(savedState) as WalletState
  } catch (error) {
    console.error("Failed to parse wallet state from localStorage", error)
    return initialWalletState
  }
}

// Save wallet state to localStorage
export function saveWalletState(state: WalletState): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("walletState", JSON.stringify(state))
}
