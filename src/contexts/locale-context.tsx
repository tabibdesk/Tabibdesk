"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"

const COOKIE_NAME = "tabibdesk-lang"
const STORAGE_KEY = "tabibdesk-lang"

export type Language = "ar" | "en"

function getStoredLang(): Language | null {
  if (typeof window === "undefined") return null
  // Cookie first (for landing-to-app handoff)
  const cookies = document.cookie.split(";")
  for (const c of cookies) {
    const [name, value] = c.trim().split("=")
    if (name === COOKIE_NAME && (value === "ar" || value === "en")) {
      return value as Language
    }
  }
  // localStorage fallback
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "ar" || stored === "en") return stored as Language
  // Browser preference
  if (navigator.language?.startsWith("ar")) return "ar"
  return null
}

function persistLang(lang: Language): void {
  if (typeof window === "undefined") return
  document.cookie = `${COOKIE_NAME}=${lang};path=/;max-age=31536000;SameSite=Lax`
  localStorage.setItem(STORAGE_KEY, lang)
}

interface LocaleContextType {
  lang: Language
  dir: "ltr" | "rtl"
  isRtl: boolean
  setLanguage: (lang: Language) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en")

  const setLanguage = useCallback((newLang: Language) => {
    setLangState(newLang)
    persistLang(newLang)
  }, [])

  useEffect(() => {
    const stored = getStoredLang()
    if (stored && stored !== lang) {
      setLangState(stored)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount

  const dir = lang === "ar" ? "rtl" : "ltr"
  const isRtl = lang === "ar"

  return (
    <LocaleContext.Provider
      value={{
        lang,
        dir,
        isRtl,
        setLanguage,
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextType {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return ctx
}

/** Call from landing page to persist lang before navigating to app */
export function persistLocaleForApp(lang: Language): void {
  persistLang(lang)
}
