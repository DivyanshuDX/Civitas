"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "hi"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    "dashboard.title": "Dashboard",
    "dashboard.connect": "Connect Wallet",
    "dashboard.requests": "Access Requests",
    "dashboard.myDocuments": "My Documents",
    "dashboard.history": "Access History",
    "document.aadhaar": "Aadhaar",
    "document.pan": "PAN Card",
    "document.passport": "Passport",
    "document.driving_license": "Driving License",
    "document.voter_id": "Voter ID",
    "access.org": "Organization",
    "access.purpose": "Purpose",
    "access.expiry": "Expiry Date",
    "access.status": "Status",
    "access.actions": "Actions",
    "access.approve": "Approve",
    "access.reject": "Reject",
    "access.revoke": "Revoke",
    "access.pending": "Pending",
    "access.approved": "Approved",
    "access.rejected": "Rejected",
    "access.expired": "Expired",
    "access.documents": "Requested Documents",
    "access.fields": "Requested Fields",
    "admin.title": "Organization Dashboard",
    "admin.login": "Login as Organization",
    "admin.requests": "Document Requests",
    "admin.access": "Granted Access",
    "admin.audit": "Audit Trail",
    "admin.stats": "Access Statistics",
    "admin.newRequest": "New Request",
    "admin.filter": "Filter",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
  },
  hi: {
    "dashboard.title": "डैशबोर्ड",
    "dashboard.connect": "वॉलेट कनेक्ट करें",
    "dashboard.requests": "एक्सेस अनुरोध",
    "dashboard.myDocuments": "मेरे दस्तावेज़",
    "dashboard.history": "एक्सेस इतिहास",
    "document.aadhaar": "आधार",
    "document.pan": "पैन कार्ड",
    "document.passport": "पासपोर्ट",
    "document.driving_license": "ड्राइविंग लाइसेंस",
    "document.voter_id": "वोटर आईडी",
    "access.org": "संगठन",
    "access.purpose": "उद्देश्य",
    "access.expiry": "समाप्ति तिथि",
    "access.status": "स्थिति",
    "access.actions": "कार्रवाई",
    "access.approve": "स्वीकृत करें",
    "access.reject": "अस्वीकार करें",
    "access.revoke": "वापस लें",
    "access.pending": "लंबित",
    "access.approved": "स्वीकृत",
    "access.rejected": "अस्वीकृत",
    "access.expired": "समाप्त",
    "access.documents": "अनुरोधित दस्तावेज़",
    "access.fields": "अनुरोधित फ़ील्ड",
    "admin.title": "संगठन डैशबोर्ड",
    "admin.login": "संगठन के रूप में लॉगिन करें",
    "admin.requests": "दस्तावेज़ अनुरोध",
    "admin.access": "दी गई एक्सेस",
    "admin.audit": "ऑडिट ट्रेल",
    "admin.stats": "एक्सेस आंकड़े",
    "admin.newRequest": "नया अनुरोध",
    "admin.filter": "फ़िल्टर",
    "common.submit": "जमा करें",
    "common.cancel": "रद्द करें",
    "common.save": "सहेजें",
    "common.delete": "हटाएं",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "hi")) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
