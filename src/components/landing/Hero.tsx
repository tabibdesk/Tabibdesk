"use client"

import Link from "next/link"
import { Button } from "@/components/Button"
import { translations, Language } from "@/lib/landing-translations"
import Image from "next/image"
import {
  RiTimeLine,
  RiRefreshLine,
  RiFileList3Line,
} from "@remixicon/react"

interface HeroProps {
  lang: Language
}

export function Hero({ lang }: HeroProps) {
  const t = translations[lang]

  return (
    <section className="relative overflow-hidden bg-white py-12 dark:bg-gray-950 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-gray-50">
              {t.heroHeadline}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              {t.heroSubheadline}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild className="px-6 py-3 text-base">
                <Link href="/register">{t.ctaPrimary}</Link>
              </Button>
              <Button asChild className="px-6 py-3 text-base" variant="secondary">
                <Link href="/login">{t.ctaSecondary}</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="flex flex-col items-start">
                <div className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900/20">
                  <RiTimeLine className="size-6 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-50">
                  {t.heroFeature1}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <div className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900/20">
                  <RiRefreshLine className="size-6 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-50">
                  {t.heroFeature2}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <div className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900/20">
                  <RiFileList3Line className="size-6 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-50">
                  {t.heroFeature3}
                </p>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/landing/pexels-karola-g-7195379.jpg"
                alt={lang === "ar" ? "عيادة طبية حديثة" : "Modern medical clinic"}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

