"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Language } from "@/lib/landing-translations"
import { Button } from "@/components/Button"
import { LanguageToggle } from "@/components/landing/LanguageToggle"
import { Hero } from "@/components/landing/Hero"
import { ProblemOutcome } from "@/components/landing/ProblemOutcome"
import { Differentiators } from "@/components/landing/Differentiators"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { FeatureGrid } from "@/components/landing/FeatureGrid"
import { Pricing } from "@/components/landing/Pricing"
import { Trust } from "@/components/landing/Trust"
import { FinalCTA } from "@/components/landing/FinalCTA"

function LandingPageContent() {
  const searchParams = useSearchParams()
  const lang = (searchParams.get("lang") || "ar") as Language
  const dir = lang === "ar" ? "rtl" : "ltr"

  return (
    <div dir={dir} lang={lang}>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex aspect-square size-8 items-center justify-center rounded bg-primary-600 p-2 text-xs font-medium text-white dark:bg-primary-500">
                TD
              </span>
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                TabibDesk
              </span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50"
                >
                  {lang === "ar" ? "تسجيل الدخول" : "Sign in"}
                </Link>
                <Link href="/register">
                  <Button variant="primary" className="text-sm">
                    {lang === "ar" ? "ابدأ مجاناً" : "Get Started"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main>
        <Hero lang={lang} />
        <ProblemOutcome lang={lang} />
        <Differentiators lang={lang} />
        <HowItWorks lang={lang} />
        <FeatureGrid lang={lang} />
        <Pricing lang={lang} />
        <Trust lang={lang} />
        <FinalCTA lang={lang} />
      </main>
      <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {lang === "ar"
              ? "© 2024 TabibDesk. جميع الحقوق محفوظة."
              : "© 2024 TabibDesk. All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      }
    >
      <LandingPageContent />
    </Suspense>
  )
}

