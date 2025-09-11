"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Shield,
  Globe,
  Zap,
  Users,
  Lock,
  ArrowRight,
  CheckCircle,
  Twitter,
  MessageCircle,
  User,
  Fingerprint,
  Eye,
  Network,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"

// Floating particle component
function FloatingParticle({ delay = 0, duration = 20 }) {
  return (
    <div
      className="absolute w-2 h-2 bg-blue-500/30 rounded-full animate-pulse"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  )
}

// Animated logo component
function CivitasLogo() {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-10 h-10 border-2 border-blue-600 rounded-lg rotate-45 animate-pulse" />
        <div
          className="absolute inset-1 w-6 h-6 bg-blue-600 rounded-sm animate-spin"
          style={{ animationDuration: "8s" }}
        />
      </div>
      <span className="text-2xl font-bold text-gray-900 dark:text-white">Civitas</span>
    </div>
  )
}

// Digital Twin Layout Component with mobile responsiveness
function DigitalTwinLayout() {
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden md:block relative h-[500px] flex items-center justify-center">
        {/* SVG for connecting lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradient for light theme */}
            <linearGradient id="connectionGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>

            {/* Gradient for dark theme */}
            <linearGradient id="connectionGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Curved connecting lines */}
          {/* Top-left to center */}
          <path
            d="M 150 120 Q 300 180 400 250"
            stroke="url(#connectionGradientLight)"
            strokeWidth="3"
            fill="none"
            className="animate-pulse dark:hidden"
            strokeDasharray="5,5"
          >
            <animate attributeName="stroke-dashoffset" values="0;10;0" dur="3s" repeatCount="indefinite" />
          </path>
          <path
            d="M 150 120 Q 300 180 400 250"
            stroke="url(#connectionGradientDark)"
            strokeWidth="3"
            fill="none"
            className="animate-pulse hidden dark:block"
            strokeDasharray="5,5"
          >
            <animate attributeName="stroke-dashoffset" values="0;10;0" dur="3s" repeatCount="indefinite" />
          </path>

          {/* Top-right to center */}
          <path
            d="M 650 120 Q 500 180 400 250"
            stroke="url(#connectionGradientLight)"
            strokeWidth="3"
            fill="none"
            className="animate-pulse dark:hidden"
            strokeDasharray="5,5"
          >
            <animate attributeName="stroke-dashoffset" values="0;10;0" dur="3s" repeatCount="indefinite" begin="0.5s" />
          </path>
          <path
            d="M 650 120 Q 500 180 400 250"
            stroke="url(#connectionGradientDark)"
            strokeWidth="3"
            fill="none"
            className="animate-pulse hidden dark:block"
            strokeDasharray="5,5"
          >
            <animate attributeName="stroke-dashoffset" values="0;10;0" dur="3s" repeatCount="indefinite" begin="0.5s" />
          </path>

          {/* Bottom-left to center */}
          <path
            d="M 150 380 Q 300 320 400 250"
            stroke="url(#connectionGradientLight)"
            strokeWidth="3"
            fill="none"
            className="animate-pulse dark:hidden"
            strokeDasharray="5,5"
          >
            <animate attributeName="stroke-dashoffset" values="0;10;0" dur="3s" repeatCount="indefinite" begin="1s" />
          </path>
          <path
            d="M 150 380 Q 300 320 400 250"
            stroke="url(#connectionGradientDark)"
            strokeWidth="3"
            fill="none"
            className="animate-pulse hidden dark:block"
            strokeDasharray="5,5"
          >
            <animate attributeName="stroke-dashoffset" values="0;10;0" dur="3s" repeatCount="indefinite" begin="1s" />
          </path>

          {/* Bottom-right to center */}
          <path
            d="M 650 380 Q 500 320 400 250"
            stroke="url(#connectionGradientLight)"
            strokeWidth="3"
            fill="none"
            className="animate-pulse dark:hidden"
            strokeDasharray="5,5"
          >
            <animate attributeName="stroke-dashoffset" values="0;10;0" dur="3s" repeatCount="indefinite" begin="1.5s" />
          </path>
          <path
            d="M 650 380 Q 500 320 400 250"
            stroke="url(#connectionGradientDark)"
            strokeWidth="3"
            fill="none"
            className="animate-pulse hidden dark:block"
            strokeDasharray="5,5"
          >
            <animate attributeName="stroke-dashoffset" values="0;10;0" dur="3s" repeatCount="indefinite" begin="1.5s" />
          </path>
        </svg>

        {/* Center Card - Your Digital Twin */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <Card className="w-56 h-40 bg-white dark:bg-gray-800 shadow-2xl border-2 border-blue-100 dark:border-blue-800 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Your Digital Twin</h3>
              <div className="w-12 h-1 bg-blue-500 rounded-full mt-3 animate-pulse"></div>
            </CardContent>
          </Card>
        </div>

        {/* Top-left Card - Biometric Auth */}
        <div className="absolute top-8 left-8 z-10 animate-float">
          <Card className="w-48 h-32 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg shadow-blue-600/25">
                <Fingerprint className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Biometric Auth</h4>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top-right Card - AI Verification */}
        <div className="absolute top-8 right-8 z-10 animate-float" style={{ animationDelay: "0.5s" }}>
          <Card className="w-48 h-32 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg shadow-blue-600/25">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">AI Verification</h4>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom-left Card - Zero-Knowledge */}
        <div className="absolute bottom-8 left-8 z-10 animate-float" style={{ animationDelay: "1s" }}>
          <Card className="w-48 h-32 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg shadow-blue-600/25">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Zero-Knowledge</h4>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom-right Card - Global Network */}
        <div className="absolute bottom-8 right-8 z-10 animate-float" style={{ animationDelay: "1.5s" }}>
          <Card className="w-48 h-32 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg shadow-blue-600/25">
                <Network className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Global Network</h4>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Layout - Visible only on mobile */}
      <div className="md:hidden space-y-6 px-4">
        {/* Center Card - Your Digital Twin - Featured at top */}
        <div className="flex justify-center">
          <Card className="w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl border-2 border-blue-100 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Your Digital Twin</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Secure blockchain identity</p>
              <div className="w-12 h-1 bg-blue-500 rounded-full mt-3 mx-auto animate-pulse"></div>
            </CardContent>
          </Card>
        </div>

        {/* Grid of feature cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Biometric Auth */}
          <Card className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg shadow-blue-600/25">
                <Fingerprint className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Biometric Auth</h4>
              <div className="flex justify-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </CardContent>
          </Card>

          {/* AI Verification */}
          <Card className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg shadow-blue-600/25">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">AI Verification</h4>
              <div className="flex justify-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </CardContent>
          </Card>

          {/* Zero-Knowledge */}
          <Card className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg shadow-blue-600/25">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Zero-Knowledge</h4>
              <div className="flex justify-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </CardContent>
          </Card>

          {/* Global Network */}
          <Card className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg shadow-blue-600/25">
                <Network className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Global Network</h4>
              <div className="flex justify-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// Feature card component
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}

// Step component for How It Works
function StepCard({ number, title, description, isLast = false }) {
  return (
    <div className="relative">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/30">
            {number}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>
      {!isLast && <div className="absolute left-6 top-12 w-0.5 h-16 bg-blue-200 dark:bg-blue-800" />}
    </div>
  )
}

// Roadmap item component
function RoadmapItem({ quarter, title, description, status = "upcoming" }) {
  const statusColors = {
    completed: "bg-green-500",
    current: "bg-blue-500 animate-pulse",
    upcoming: "bg-gray-300 dark:bg-gray-600",
  }

  return (
    <div className="relative">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className={`w-4 h-4 rounded-full ${statusColors[status]}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{quarter}</span>
            {status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const features = [
    {
      icon: Shield,
      title: "Blockchain-Verified Identity",
      description:
        "Your documents are verified on Algorand blockchain with tamper-proof badges linked to your KYC'd account.",
    },
    {
      icon: Globe,
      title: "Global Government Access",
      description: "Connect your National Id and access government services with a single verified identity.",
    },
    {
      icon: Lock,
      title: "Time-Bound Consent",
      description: "Grant organizations access to your documents with automatic expiration and full audit trails.",
    },
    {
      icon: Users,
      title: "Compliant",
      description: "Full compliance with data protection regulations and PII governance standards.",
    },
    {
      icon: Zap,
      title: "Non-Custodial Wallets",
      description: "Regulatory compliant wallet management with HashiCorp integration for government reporting.",
    },
  ]

  const steps = [
    {
      number: 1,
      title: "Connect DigiLocker",
      description: "Link your existing DigiLocker account to access your verified government documents.",
    },
    {
      number: 2,
      title: "Receive Blockchain Badge",
      description: "Get a verified badge on Algorand blockchain linked to your KYC'd account for fraud prevention.",
    },
    {
      number: 3,
      title: "Grant Time-Bound Access",
      description: "Organizations request access, you verify the purpose and grant time-limited permissions.",
    },
    {
      number: 4,
      title: "Audit & Compliance",
      description: "Full audit trail maintained for DPDPA compliance with automatic link expiration.",
    },
  ]

  const roadmapItems = [
    {
      quarter: "Q3 2025",
      title: "Core Platform Launch",
      description: "DigiLocker integration, blockchain badges, and basic schemes",
      status: "completed",
    },
    {
      quarter: "Q4 2025",
      title: "Enhanced Security",
      description: "Advanced fraud detection, 2FA and AI integration",
      status: "current",
    },
    {
      quarter: "Q1 2026",
      title: "Global Expansion",
      description: "Support for international identity systems and cross-border verification",
      status: "upcoming",
    },
    {
      quarter: "Q2 2026",
      title: "Granular Access Control",
      description: "Field-level permissions and advanced document type support",
      status: "upcoming",
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Floating particles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.5} duration={15 + Math.random() * 10} />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <CivitasLogo />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#roadmap"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Roadmap
              </Link>
              <ModeToggle />
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              <ModeToggle />
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
              <nav className="px-4 py-4 space-y-3">
                <Link
                  href="#features"
                  className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="#roadmap"
                  className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Roadmap
                </Link>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-transparent mt-4"
                  >
                    Sign In
                  </Button>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Combined with navbar to fill viewport */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: "calc(100vh - 88px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              <span className="block text-blue-600 dark:text-blue-400">Your Global Gateway</span>
              <span className="block text-gray-700 dark:text-gray-300">to Government Services</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              One identity. Infinite access. Anywhere in the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating 3D elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-20 left-10 w-20 h-20 border border-blue-200 dark:border-blue-800 rounded-full animate-bounce"
            style={{ animationDuration: "3s" }}
          />
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg rotate-45 animate-pulse" />
          <div
            className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-blue-300 dark:border-blue-700 rounded-full animate-spin"
            style={{ animationDuration: "8s" }}
          />
        </div>
      </section>

      {/* Digital Twin Layout Section - Full viewport height */}
      <section className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Revolutionizing Digital Identity</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the future of government services with blockchain-powered identity verification
            </p>
          </div>
          <DigitalTwinLayout />
        </div>
      </section>

      {/* Key Features - Full viewport height */}
      <section id="features" className="min-h-screen flex items-center justify-center py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Secure, compliant, and user-controlled access to government services worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Full viewport height */}
      <section
        id="how-it-works"
        className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center py-20 transition-colors duration-300"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Simple, secure, and transparent process</p>
          </div>
          <div className="space-y-12">
            {steps.map((step, index) => (
              <StepCard key={index} {...step} isLast={index === steps.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Future Roadmap - Full viewport height */}
      <section id="roadmap" className="min-h-screen flex items-center justify-center py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Future Roadmap</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Our journey towards global digital identity</p>
          </div>
          <div className="relative">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-12">
              {roadmapItems.map((item, index) => (
                <RoadmapItem key={index} {...item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-8 h-8 border-2 border-blue-400 rounded-lg rotate-45" />
                  <div className="absolute inset-1 w-4 h-4 bg-blue-400 rounded-sm" />
                </div>
                <span className="text-xl font-bold">Civitas</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering individuals with secure, blockchain-verified digital identity for global government services.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#roadmap" className="hover:text-white transition-colors">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/docs" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white transition-colors">
                    For Organizations
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Civitas. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
