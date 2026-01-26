"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Language, translations } from "@/lib/landing-translations"
import { Button } from "@/components/Button"
import { LanguageToggle } from "@/components/landing/LanguageToggle"
import { Hero } from "@/components/landing/Hero"
import { ProblemOutcome } from "@/components/landing/ProblemOutcome"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Pricing } from "@/components/landing/Pricing"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { RiMenuLine, RiCloseLine } from "@remixicon/react"

function LandingPageContent() {
  const searchParams = useSearchParams()
  const lang = (searchParams.get("lang") || "en") as Language
  const dir = lang === "ar" ? "rtl" : "ltr"
  const t = translations[lang]
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div dir={dir} lang={lang}>
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex aspect-square size-7 items-center justify-center rounded bg-primary-600 text-xs font-bold text-white dark:bg-primary-500">
                TD
              </span>
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-50">
                TabibDesk
              </span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href={`/?lang=${lang}#pricing`}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {t.navPricing}
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-4 sm:flex">
                <LanguageToggle />
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    {t.navLogin}
                  </Link>
                  <span className="text-gray-300 dark:text-gray-700">|</span>
                  <Link
                    href="/register"
                    className="text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    {t.navSignup}
                  </Link>
                </div>
              </div>

              <button
                type="button"
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 hover:dark:bg-gray-900 md:hidden"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setIsMobileMenuOpen((v) => !v)}
              >
                {isMobileMenuOpen ? <RiCloseLine className="size-5" /> : <RiMenuLine className="size-5" />}
              </button>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-950 md:hidden">
            <div className="space-y-2">
              <Link
                href={`/?lang=${lang}#pricing`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-900"
              >
                {t.navPricing}
              </Link>
            </div>

            <div className="my-4 border-t border-gray-100 dark:border-gray-800" />
            <div className="flex items-center justify-between gap-3">
              <LanguageToggle />
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t.navLogin}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  {t.navSignup}
                </Link>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full" variant="primary">
                  {t.navLogin}
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full" variant="secondary">
                  {t.navSignup}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
      <main>
        <Hero lang={lang} />
        <ProblemOutcome lang={lang} />
        <HowItWorks lang={lang} />
        <Pricing lang={lang} />
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
