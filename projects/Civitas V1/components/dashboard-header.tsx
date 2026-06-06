"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Menu, X } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { getCurrentUserWithAccount, logoutUser } from "@/lib/auth"

export function DashboardHeader() {
  const { t } = useLanguage()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userWithAccount = await getCurrentUserWithAccount()
        if (userWithAccount) {
          setCurrentUser({
            ...userWithAccount.user,
            address: userWithAccount.algorandAccount?.address,
          })
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
      setCurrentUser(null)
      // Refresh the page to show login form
      window.location.reload()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="w-8 h-8 border-2 border-blue-600 rounded-lg rotate-45" />
              <div className="absolute inset-1 w-4 h-4 bg-blue-600 rounded-sm" />
            </div>
            <span className="text-xl">Civitas</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/dashboard"
              className="font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t("dashboard.title")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!loading && currentUser && (
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 text-sm border border-blue-200 dark:border-blue-800">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  {currentUser.address ? (
                    <>
                      {currentUser.address.substring(0, 6)}...
                      {currentUser.address.substring(currentUser.address.length - 4)}
                    </>
                  ) : (
                    "Connected"
                  )}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <nav className="container px-4 py-4 space-y-3">
            <Link
              href="/dashboard"
              className="block font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("dashboard.title")}
            </Link>
            <Link
              href="/admin"
              className="block font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("admin.title")}
            </Link>

            {!loading && currentUser && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currentUser.address ? (
                        <>
                          {currentUser.address.substring(0, 6)}...
                          {currentUser.address.substring(currentUser.address.length - 4)}
                        </>
                      ) : (
                        "Connected"
                      )}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
