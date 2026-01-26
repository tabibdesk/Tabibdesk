"use client"

import Link from "next/link"
import { translations, Language } from "@/lib/landing-translations"
import { Button } from "@/components/Button"
import { RiPlayFill, RiArrowRightLine } from "@remixicon/react"

interface FinalCTAProps {
  lang: Language
}

export function FinalCTA({ lang }: FinalCTAProps) {
  const t = translations[lang]

  return (
    <section className="bg-white dark:bg-gray-950 py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-600 to-primary-800 p-8 sm:p-12 lg:p-16 text-center shadow-2xl">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {t.finalCTATitle}
            </h2>
            <p className="mt-6 text-lg text-primary-50 font-medium max-w-2xl mx-auto opacity-90">
              {t.finalCTASubtitle}
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                className="h-14 px-10 text-base font-bold uppercase tracking-wider bg-white text-primary-600 hover:bg-gray-50 shadow-xl transition-transform hover:scale-105"
              >
                <Link href="/login" className="flex items-center gap-2">
                  <RiPlayFill className="size-5" />
                  {lang === "ar" ? "ابدأ الديمو المباشر" : "Start Live Demo"}
                </Link>
              </Button>
              <Link
                href="/register"
                className="group flex items-center gap-2 text-sm font-bold text-white transition-opacity hover:opacity-80"
              >
                {t.navSignup}
                <RiArrowRightLine className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6 text-[10px] uppercase tracking-widest text-primary-100 font-bold opacity-70">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-400" />
                {lang === "ar" ? "دخول فوري" : "Instant Access"}
              </div>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-400" />
                {lang === "ar" ? "بدون تسجيل" : "No Signup Required"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
