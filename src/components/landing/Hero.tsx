"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { translations, Language } from "@/lib/landing-translations"
import {
  RiArrowRightLine,
  RiPlayFill,
  RiSparklingLine,
  RiRadioButtonLine,
  RiTimeZoneLine,
} from "@remixicon/react"

interface HeroProps {
  lang: Language
}

export function Hero({ lang }: HeroProps) {
  const t = translations[lang]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div className="flex flex-col text-center lg:text-left rtl:lg:text-right">
            <div className="inline-flex self-center lg:self-start items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-700 ring-1 ring-inset ring-primary-600/10 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-500/30">
              <RiSparklingLine className="size-3" />
              <span>{t.heroEyebrow}</span>
            </div>
            
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              {t.heroHeadline}
            </h1>
            
            <div className="mt-4 sm:mt-6 max-w-xl mx-auto lg:mx-0">
              <p className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200 leading-relaxed">
                {t.heroSubheadline.split(" • ").map((item, i, arr) => (
                  <span key={i}>
                    {item}
                    {i < arr.length - 1 && (
                      <span className="mx-2 text-primary-600 dark:text-primary-400">•</span>
                    )}
                  </span>
                ))}
              </p>
            </div>
            
            <div className="mt-8 sm:mt-10 flex justify-center lg:justify-start">
              <Button asChild className="h-12 sm:h-14 px-8 sm:px-10 text-sm font-bold uppercase tracking-wide shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <Link href="/login" className="flex items-center justify-center gap-2">
                  <RiPlayFill className="size-5 sm:size-6" />
                  {lang === "ar" ? "جرّب الديمو المباشر" : "Try Live Demo Now"}
                  <RiArrowRightLine className="size-5 sm:size-6 rtl:rotate-180" />
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 sm:mt-8 flex items-center justify-center lg:justify-start gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="font-semibold">{lang === "ar" ? "مجاني" : "Free Demo"}</span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="font-semibold">{lang === "ar" ? "بدون تسجيل" : "No Signup"}</span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="font-semibold">{lang === "ar" ? "جاهز الآن" : "Instant Access"}</span>
              </div>
            </div>
          </div>

          {/* Exact Dashboard Queue Screenshot - Optimized for mobile/dark */}
          <div className="relative mt-8 lg:mt-0">
            {/* Floating badge */}
            <div className="absolute -top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-white dark:bg-gray-900 px-3 py-1.5 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
              <span className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {lang === "ar" ? "من الديمو الفعلي" : "From Live Demo"}
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-950">
              {/* Header matching dashboard exactly */}
              <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {lang === "ar" ? "طابور الآن" : "now queue"}
                  </h2>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 lowercase tracking-wider">
                    {lang === "ar" ? "لايڤ" : "live"}
                  </span>
                </div>
              </div>

              {/* Queue items - exact replica */}
              <div className="p-4 space-y-3 bg-white dark:bg-gray-950">
                {/* First patient - NOW */}
                <div className="widget-row">
                  <div className="widget-content-stack">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      <RiRadioButtonLine className="size-5 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                          Sarah Ahmed
                        </p>
                        <Badge
                          variant="success"
                          className="h-4 px-1.5 text-xs font-bold lowercase tracking-wider"
                        >
                          now
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate lowercase font-medium">
                          consultation
                        </p>
                        <span className="flex items-center gap-1 text-xs font-bold lowercase tracking-wider text-green-600 dark:text-green-400">
                          <span className="size-1 rounded-full bg-green-500 animate-pulse" />
                          live
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="btn-secondary-widget pointer-events-none opacity-90 hidden sm:flex"
                  >
                    open profile
                  </Button>
                </div>

                {/* Second patient - NEXT */}
                <div className="widget-row">
                  <div className="widget-content-stack">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      <RiArrowRightLine className="size-5" />
                    </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            Mohamed Aly
                          </p>
                          <Badge
                            variant="default"
                            className="h-4 px-1.5 text-xs font-bold lowercase tracking-wider"
                          >
                            next
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate lowercase font-medium">
                          follow-up
                        </p>
                      </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="btn-secondary-widget pointer-events-none opacity-90 hidden sm:flex"
                  >
                    open profile
                  </Button>
                </div>

                {/* Third patient - Waiting */}
                <div className="widget-row opacity-80">
                  <div className="widget-content-stack">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      <RiTimeZoneLine className="size-5" />
                    </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 justify-between">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            Khaled Omar
                          </p>
                          <span className="shrink-0 text-xs font-bold tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded-sm lowercase">
                            11:30 am
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate lowercase font-medium">
                          checkup
                        </p>
                      </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA arrow on desktop */}
            <div className="hidden lg:block absolute -left-12 top-1/2 -translate-y-1/2">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                <RiArrowRightLine className="size-6 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
