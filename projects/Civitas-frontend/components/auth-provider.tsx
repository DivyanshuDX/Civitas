"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { loginUser, logoutUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

type User = {
  id: string
  email: string
  user_type: "user" | "admin"
}

type AlgorandAccount = {
  address: string
  passphrase: string
  privateKey: string
}

type AuthContextType = {
  user: User | null
  algorandAccount: AlgorandAccount | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<boolean>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  algorandAccount: null,
  loading: true,
  login: async () => false,
  logout: async () => false,
  isAdmin: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [algorandAccount, setAlgorandAccount] = useState<AlgorandAccount | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        setLoading(true)
        console.log("Checking session...")

        // First try to get user from localStorage
        const storedUser = localStorage.getItem("user")
        const storedAccount = localStorage.getItem("algorandAccount")

        if (storedUser && storedAccount) {
          console.log("Found stored user and account")
          setUser(JSON.parse(storedUser))
          setAlgorandAccount(JSON.parse(storedAccount))
          setLoading(false)
          return
        }

        // If no stored user, check session
        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
          console.log("No session found")
          setLoading(false)
          return
        }

        // Get user data from our custom table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.session.user.id)
          .single()

        if (userError || !userData) {
          console.log("No user data found")
          setLoading(false)
          return
        }

        // Get Algorand account
        const { data: accountData, error: accountError } = await supabase
          .from("algorand_accounts")
          .select("*")
          .eq("user_id", userData.id)
          .single()

        if (accountError || !accountData) {
          console.log("No account data found")
          setUser(userData)
          setLoading(false)
          return
        }

        const account = {
          address: accountData.address,
          passphrase: accountData.passphrase,
          privateKey: accountData.private_key,
        }

        setUser(userData)
        setAlgorandAccount(account)

        // Store in localStorage for faster access
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("algorandAccount", JSON.stringify(account))
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (event === "SIGNED_OUT") {
        setUser(null)
        setAlgorandAccount(null)
        localStorage.removeItem("user")
        localStorage.removeItem("algorandAccount")
        return
      }

      if (event === "SIGNED_IN" && session) {
        checkSession()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await loginUser(email, password)

      if (!result) {
        return false
      }

      setUser(result.user)
      setAlgorandAccount(result.algorandAccount)

      // Store in localStorage for faster access
      localStorage.setItem("user", JSON.stringify(result.user))
      localStorage.setItem("algorandAccount", JSON.stringify(result.algorandAccount))

      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      const success = await logoutUser()

      if (success) {
        setUser(null)
        setAlgorandAccount(null)
        localStorage.removeItem("user")
        localStorage.removeItem("algorandAccount")
      }

      return success
    } catch (error) {
      console.error("Logout error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Check if user is admin
  const isAdmin = user?.user_type === "admin"

  return (
    <AuthContext.Provider value={{ user, algorandAccount, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
