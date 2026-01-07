"use client"

import Link from "next/link"
import { translations, Language } from "@/lib/landing-translations"
import { Button } from "@/components/Button"

interface FinalCTAProps {
  lang: Language
}

export function FinalCTA({ lang }: FinalCTAProps) {
  const t = translations[lang]

  return (
    <section className="bg-primary-600 py-12 dark:bg-primary-900 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t.finalCTATitle}
          </h2>
          <p className="mt-6 text-lg leading-8 text-primary-100">
            {t.finalCTASubtitle}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild className="px-6 py-3 text-base" variant="secondary">
              <Link href="/register">{t.ctaPrimary}</Link>
            </Button>
            <Button asChild className="px-6 py-3 text-base" variant="light">
              <Link href="/login">{t.ctaSecondary}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

