"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

export function MockLoginButton() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleMockLogin = async () => {
    try {
      setLoading(true)

      // Call mock login API
      const response = await fetch("/api/mock-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Update auth context
      await login("test@example.com", "password123")

      // Reload page to ensure auth state is updated
      window.location.reload()
    } catch (error) {
      console.error("Mock login error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleMockLogin} disabled={loading} variant="outline" size="sm">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging in...
        </>
      ) : (
        "Quick Login (Demo)"
      )}
    </Button>
  )
}
