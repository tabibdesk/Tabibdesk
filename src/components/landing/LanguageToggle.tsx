"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Language } from "@/lib/landing-translations"

function LanguageToggleContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentLang = (searchParams.get("lang") || "ar") as Language

  const toggleLanguage = () => {
    const newLang = currentLang === "ar" ? "en" : "ar"
    const params = new URLSearchParams(searchParams.toString())
    params.set("lang", newLang)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 hover:dark:bg-gray-800"
    >
      <span className={currentLang === "ar" ? "font-semibold" : ""}>
        العربية
      </span>
      <span className="text-gray-400">|</span>
      <span className={currentLang === "en" ? "font-semibold" : ""}>
        English
      </span>
    </button>
  )
}

export function LanguageToggle() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm">
          <span>العربية</span>
          <span className="text-gray-400">|</span>
          <span>English</span>
        </div>
      }
    >
      <LanguageToggleContent />
    </Suspense>
  )
}

