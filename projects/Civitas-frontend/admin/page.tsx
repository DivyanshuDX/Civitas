"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/components/language-provider"
import { getCurrentUserWithAccount } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { OrganizationRequests } from "@/app/admin/organization-requests"
import { ConsentStats } from "@/app/admin/consent-stats"
import { AccessStats } from "@/app/admin/access-stats"
import { AuditTrail } from "@/app/admin/audit-trail"
import { Web3Profile } from "@/components/web3-profile"
import { Building2, Users, FileCheck, Activity, TrendingUp } from "lucide-react"

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userWithAccount = await getCurrentUserWithAccount()

        if (userWithAccount && userWithAccount.user.user_type === "organization") {
          setIsLoggedIn(true)
          setUserAddress(userWithAccount.algorandAccount?.address || null)
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLoginSuccess = (address: string) => {
    setIsLoggedIn(true)
    setUserAddress(address)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading admin dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="flex-1 container py-8">
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-12 h-12 border-2 border-blue-600 rounded-lg rotate-45" />
                  <div className="absolute inset-2 w-6 h-6 bg-blue-600 rounded-sm" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Civitas Admin</h1>
              <p className="text-gray-600 dark:text-gray-300">Organization dashboard for consent management</p>
            </div>
            <LoginForm type="organization" onLoginSuccess={handleLoginSuccess} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Civitas Admin Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Manage access requests, consents, and organizational compliance
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  >
                    <Building2 className="w-3 h-3 mr-1" />
                    Organization
                  </Badge>
                </div>
              </div>

              {/* Quick Stats - Single Color Scheme */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                        <Users className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Users</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">1,247</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                        <FileCheck className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Pending Requests</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">23</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                        <Activity className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Consents</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">892</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Compliance Score</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">98%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Organization Wallet */}
              {userAddress && <Web3Profile address={userAddress} label="Organization Algorand Wallet" />}
            </div>

            {/* Main Admin Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <Tabs defaultValue="requests" className="w-full">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-700">
                    <TabsTrigger
                      value="requests"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                    >
                      Access Requests
                    </TabsTrigger>
                    <TabsTrigger
                      value="consents"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                    >
                      Consent Analytics
                    </TabsTrigger>
                    <TabsTrigger
                      value="access"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                    >
                      Access Analytics
                    </TabsTrigger>
                    <TabsTrigger
                      value="audit"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                    >
                      Audit Trail
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="requests" className="mt-0">
                    <OrganizationRequests />
                  </TabsContent>
                  <TabsContent value="consents" className="mt-0">
                    <ConsentStats />
                  </TabsContent>
                  <TabsContent value="access" className="mt-0">
                    <AccessStats />
                  </TabsContent>
                  <TabsContent value="audit" className="mt-0">
                    <AuditTrail />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
