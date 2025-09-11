import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { AuthProvider } from "@/components/auth-provider"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Civitas - Your Global Gateway to Government Services",
  description:
    "Secure, blockchain-verified digital identity platform for global government service access with DigiLocker integration and time-bound consent management.",
  keywords: "digital identity, blockchain, government services, DigiLocker, consent management, DPDPA compliance",
  authors: [{ name: "Civitas Team" }],
  creator: "Civitas",
  publisher: "Civitas",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://civitas.app",
    title: "Civitas - Your Global Gateway to Government Services",
    description: "Secure, blockchain-verified digital identity platform for global government service access",
    siteName: "Civitas",
  },
  twitter: {
    card: "summary_large_image",
    title: "Civitas - Your Global Gateway to Government Services",
    description: "Secure, blockchain-verified digital identity platform for global government service access",
    creator: "@civitas",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <LanguageProvider>
            <AuthProvider>
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">{children}</div>
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
