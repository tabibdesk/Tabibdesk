"use client"

import Image from "next/image"
import { translations, Language } from "@/lib/landing-translations"
import { 
  RiCloseCircleFill, 
  RiCheckboxCircleFill,
} from "@remixicon/react"

interface ProblemOutcomeProps {
  lang: Language
}

export function ProblemOutcome({ lang }: ProblemOutcomeProps) {
  const t = translations[lang]

  const problems = [t.problem1, t.problem2, t.problem3]
  const solutions = [t.outcome1, t.outcome2, t.outcome3]

  return (
    <section className="bg-white dark:bg-gray-950 py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Visual Side: Chaos vs Clarity Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src="/landing/pexels-karola-g-7195122.jpg"
                alt={lang === "ar" ? "الفوضى مقابل التنظيم" : "Chaos vs Clarity"}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              {/* Overlay with subtle gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
              
              {/* Floating clarity indicator */}
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-xl dark:bg-gray-900/95">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
                    <RiCheckboxCircleFill className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                      {lang === "ar" ? "نظام بديهي وسهل" : "Intuitive & Easy System"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {lang === "ar" ? "صمم خصيصاً للعيادات المشغولة" : "Designed specifically for busy clinics"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background blobs for depth */}
            <div className="absolute -z-10 -top-6 -left-6 size-32 bg-primary-100 rounded-full blur-3xl dark:bg-primary-900/20" />
            <div className="absolute -z-10 -bottom-6 -right-6 size-32 bg-blue-100 rounded-full blur-3xl dark:bg-blue-900/20" />
          </div>

          {/* Content Side */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              {t.problemTitle}
            </h2>
            
            <div className="mt-8 space-y-6">
              {/* Problems list */}
              <div className="space-y-4">
                {problems.map((text, i) => (
                  <div key={i} className="flex gap-3 items-start opacity-70">
                    <RiCloseCircleFill className="size-5 shrink-0 text-red-500 mt-0.5" />
                    <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400">
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Transition line */}
              <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-8" />

              {/* Outcomes list */}
              <div>
                <h3 className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-6">
                  {t.outcomeTitle}
                </h3>
                <div className="space-y-4">
                  {solutions.map((text, i) => (
                    <div key={i} className="flex gap-3 items-start group">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <RiCheckboxCircleFill className="size-5" />
                      </div>
                      <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-relaxed">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
