"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/components/language-provider"
import { getCurrentUserWithAccount } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { AccessRequestList } from "@/app/dashboard/access-request-list"
import { UserDocuments } from "@/app/dashboard/user-documents"
import { AccessHistory } from "@/app/dashboard/access-history"
import { Web3Profile } from "@/components/web3-profile"
import { DigiLocker } from "@/app/dashboard/digilocker"
import { SchemesAvailable } from "@/app/dashboard/schemes-available"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Globe, Clock, Award, FileText } from "lucide-react"

export default function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // State for DigiLocker and Digital Twins
  const [digiLockerConnected, setDigiLockerConnected] = useState(false)
  const [digitalTwinsCount, setDigitalTwinsCount] = useState(0)

  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userWithAccount = await getCurrentUserWithAccount()

        if (userWithAccount && userWithAccount.user.user_type === "user") {
          setIsLoggedIn(true)
          setUserAddress(userWithAccount.algorandAccount?.address || null)
          setUserId(userWithAccount.user.id)
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

  const handleDigiLockerConnection = (connected: boolean) => {
    setDigiLockerConnected(connected)
  }

  const handleDigitalTwinsUpdate = (count: number) => {
    setDigitalTwinsCount(count)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Civitas</h1>
              <p className="text-gray-600 dark:text-gray-300">Your global gateway to government services</p>
            </div>
            <LoginForm type="user" onLoginSuccess={handleLoginSuccess} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Civitas</h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Manage your digital identity and document access permissions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>

              {/* Quick Stats - Single Color Scheme */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                        <User className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Digital Identity</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Blockchain Verified</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                        <Globe className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Global Access</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {digiLockerConnected ? "DigiLocker Connected" : "DigiLocker Disconnected"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Digital Twins</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{digitalTwinsCount} Verified Badges</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Wallet Connection */}
              {userAddress && <Web3Profile address={userAddress} label="Your Algorand Wallet" />}
            </div>

            {/* DigiLocker Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">DigiLocker Integration</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect your DigiLocker account to create verified digital twins of your documents
                </p>
              </div>
              <div className="p-6">
                <DigiLocker
                  onConnectionChange={handleDigiLockerConnection}
                  onDigitalTwinsUpdate={handleDigitalTwinsUpdate}
                />
              </div>
            </div>

            {/* Schemes Available Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Schemes Available for You</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Based on your DigiLocker documents and eligibility score, here are the government schemes you can
                  apply for
                </p>
              </div>
              <div className="p-6">
                <SchemesAvailable
                  userId={userId}
                  userAddress={userAddress}
                  digiLockerConnected={digiLockerConnected}
                  digitalTwinsCount={digitalTwinsCount}
                />
              </div>
            </div>

            {/* Main Dashboard Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <Tabs defaultValue="requests" className="w-full">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700">
                    <TabsTrigger
                      value="requests"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                    >
                      {t("dashboard.requests")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="documents"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                    >
                      {t("dashboard.myDocuments")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                    >
                      {t("dashboard.history")}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="requests" className="mt-0">
                    <AccessRequestList userAddress={userAddress} />
                  </TabsContent>
                  <TabsContent value="documents" className="mt-0">
                    <UserDocuments />
                  </TabsContent>
                  <TabsContent value="history" className="mt-0">
                    <AccessHistory userAddress={userAddress} />
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
