"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  FileText,
  Home,
  GraduationCap,
  Heart,
  Briefcase,
  ExternalLink,
  CheckCircle,
  XCircle,
  Award,
  IndianRupee,
  Calculator,
  Loader2,
} from "lucide-react"

interface UserScheme {
  id: string
  user_id: string
  scheme_name: string
  description: string
  category: string
  benefit: string
  eligibility: boolean
  created_at: string
}

interface SchemesAvailableProps {
  userId: string | null
  userAddress: string | null
  digiLockerConnected: boolean
  digitalTwinsCount: number
}

export function SchemesAvailable({
  userId,
  userAddress,
  digiLockerConnected,
  digitalTwinsCount,
}: SchemesAvailableProps) {
  const [userScore, setUserScore] = useState<number | null>(null)
  const [schemes, setSchemes] = useState<UserScheme[]>([])
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)

  // Mock data based on the provided schema
  const mockSchemes: UserScheme[] = [
    {
      id: "1",
      user_id: "user_123",
      scheme_name: "Education Loan Scheme",
      description: "Get government-backed loans for higher studies with interest subsidy.",
      category: "Education",
      benefit: "₹5,00,000 loan at 0% interest",
      eligibility: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      user_id: "user_123",
      scheme_name: "Housing Subsidy (PMAY)",
      description: "First home loan subsidy under PM Awas Yojana.",
      category: "Housing",
      benefit: "₹2,67,000 subsidy",
      eligibility: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      user_id: "user_123",
      scheme_name: "Startup Loan (Stand-Up India)",
      description: "Government support for entrepreneurs with business loans.",
      category: "Entrepreneurship",
      benefit: "Up to ₹10,00,000 loan",
      eligibility: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      user_id: "user_123",
      scheme_name: "National Scholarship",
      description: "Scholarship for meritorious students pursuing higher education.",
      category: "Education",
      benefit: "₹12,000 annual stipend",
      eligibility: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "5",
      user_id: "user_123",
      scheme_name: "Healthcare Insurance Scheme",
      description: "Free health insurance coverage under Ayushman Bharat.",
      category: "Health",
      benefit: "₹5,00,000 coverage",
      eligibility: false,
      created_at: new Date().toISOString(),
    },
  ]

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "education":
        return GraduationCap
      case "housing":
        return Home
      case "entrepreneurship":
        return Briefcase
      case "health":
        return Heart
      default:
        return Award
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "education":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
      case "housing":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
      case "entrepreneurship":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800"
      case "health":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const calculateScore = async () => {
    setCalculating(true)

    // Simulate score calculation based on digital twins
    setTimeout(() => {
      // Calculate score based on number of digital twins
      const baseScore = 60
      const twinBonus = digitalTwinsCount * 10 // 10 points per digital twin
      const mockScore = Math.min(baseScore + twinBonus, 100) // Cap at 100

      setUserScore(mockScore)

      // Update scheme eligibility based on score
      const updatedSchemes = mockSchemes.map((scheme) => ({
        ...scheme,
        eligibility: mockScore >= 70 ? scheme.eligibility : false,
      }))

      setSchemes(updatedSchemes)
      setCalculating(false)
    }, 2000)
  }

  // If DigiLocker is not connected
  if (!digiLockerConnected) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Connect DigiLocker First</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Please connect your DigiLocker account above to see available schemes
        </p>
      </div>
    )
  }

  // If no digital twins created yet
  if (digitalTwinsCount === 0) {
    return (
      <div className="text-center py-8">
        <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Create Digital Twins First</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Create verified badges from your DigiLocker documents to calculate your eligibility score
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You have {digitalTwinsCount} digital twins. Create at least 1 to proceed.
        </p>
      </div>
    )
  }

  // If score hasn't been calculated yet
  if (userScore === null) {
    return (
      <div className="text-center py-8">
        <div className="mb-6">
          <Calculator className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Calculate Your Eligibility Score</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Based on your {digitalTwinsCount} verified digital twins, we'll calculate your eligibility score for
            government schemes
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>DigiLocker Connected</span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>{digitalTwinsCount} Digital Twins Created</span>
            </div>
          </div>
        </div>

        <Button
          onClick={calculateScore}
          disabled={calculating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
        >
          {calculating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Calculating Score...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-5 w-5" />
              Calculate Your Score
            </>
          )}
        </Button>

        {calculating && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Analyzing your {digitalTwinsCount} verified documents...
            </div>
            <Progress value={50} className="h-2" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Score Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <TrendingUp className="w-5 h-5" />
            Your Eligibility Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Overall Score</span>
                <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">{userScore}/100</span>
              </div>
              <Progress value={userScore} className="h-3" />
            </div>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-3">
            Based on your {digitalTwinsCount} DigiLocker documents and verified digital twins
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={calculateScore}
            disabled={calculating}
            className="mt-3 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20 bg-transparent"
          >
            {calculating ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Recalculating...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-3 w-3" />
                Recalculate Score
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Schemes Grid with Glowing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.map((scheme) => {
          const IconComponent = getCategoryIcon(scheme.category)
          const isEligible = scheme.eligibility

          return (
            <Card
              key={scheme.id}
              className={`
                relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl
                ${
                  isEligible
                    ? "border-green-200 dark:border-green-800 shadow-green-100 dark:shadow-green-900/20 hover:shadow-green-200 dark:hover:shadow-green-900/40"
                    : "border-red-200 dark:border-red-800 shadow-red-100 dark:shadow-red-900/20 hover:shadow-red-200 dark:hover:shadow-red-900/40"
                }
                ${
                  isEligible
                    ? "hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] dark:hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    : "hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                }
              `}
            >
              {/* Glowing Edge Effect */}
              <div
                className={`
                  absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300
                  ${
                    isEligible
                      ? "bg-gradient-to-r from-green-400/10 via-transparent to-green-400/10"
                      : "bg-gradient-to-r from-red-400/10 via-transparent to-red-400/10"
                  }
                `}
              />

              <CardHeader className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        p-2 rounded-lg
                        ${isEligible ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}
                      `}
                    >
                      <IconComponent
                        className={`
                          w-5 h-5
                          ${isEligible ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                        `}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{scheme.scheme_name}</CardTitle>
                      <Badge variant="outline" className={`mt-1 text-xs ${getCategoryColor(scheme.category)}`}>
                        {scheme.category}
                      </Badge>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`
                      flex items-center gap-1 font-medium
                      ${
                        isEligible
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                      }
                    `}
                  >
                    {isEligible ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {isEligible ? "Eligible" : "Not Eligible"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="relative z-10">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{scheme.description}</p>

                {/* Benefit Amount */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-sm text-gray-900 dark:text-white">Benefit Amount:</span>
                  </div>
                  <div
                    className={`
                      p-3 rounded-lg font-semibold text-sm
                      ${
                        isEligible
                          ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }
                    `}
                  >
                    {scheme.benefit}
                  </div>
                </div>

                {/* Action Button */}
                {isEligible ? (
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200">
                    Apply Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
                    disabled
                  >
                    Not Currently Eligible
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {schemes.filter((s) => s.eligibility).length}
            </div>
            <div className="text-sm font-medium text-green-800 dark:text-green-300">Eligible Schemes</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">Ready to apply</div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {schemes.filter((s) => !s.eligibility).length}
            </div>
            <div className="text-sm font-medium text-red-800 dark:text-red-300">Not Eligible</div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">Requirements not met</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
