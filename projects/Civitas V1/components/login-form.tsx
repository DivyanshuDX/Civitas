"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Shield, Building, User } from "lucide-react"

interface LoginFormProps {
  type: "user" | "admin"
  onLoginSuccess: (address: string) => void
}

export function LoginForm({ type, onLoginSuccess }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: type,
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mock login - in real app, this would authenticate with backend
      const response = await fetch("/api/mock-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          userType: formData.userType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Login Successful",
          description: `Welcome to Civitas ${type === "admin" ? "Admin Dashboard" : "User Dashboard"}`,
        })
        onLoginSuccess(data.address || "")
      } else {
        throw new Error("Login failed")
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader className="text-center pb-6">
        <div className="flex items-center justify-center mb-4">

        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          {type === "admin" ? "Admin Login" : "User Login"}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          {type === "admin" ? "Access your organization dashboard" : "Access your digital identity dashboard"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Account Type
            </Label>
            <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Individual User</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>Organization Admin</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Sign In to Civitas
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to Civitas's terms of service and privacy policy.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
