"use client"

import { translations, Language } from "@/lib/landing-translations"
import { RiCloseCircleLine, RiCheckboxCircleLine } from "@remixicon/react"

interface ProblemOutcomeProps {
  lang: Language
}

export function ProblemOutcome({ lang }: ProblemOutcomeProps) {
  const t = translations[lang]

  return (
    <section className="bg-gray-50 py-12 dark:bg-gray-900 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              {lang === "ar" ? "المشاكل اللي بتواجهها" : "Problems you face"}
            </h2>
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <RiCloseCircleLine className="size-6 shrink-0 text-red-500" />
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {t.problem1}
                </p>
              </div>
              <div className="flex gap-4">
                <RiCloseCircleLine className="size-6 shrink-0 text-red-500" />
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {t.problem2}
                </p>
              </div>
              <div className="flex gap-4">
                <RiCloseCircleLine className="size-6 shrink-0 text-red-500" />
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {t.problem3}
                </p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              {lang === "ar" ? "الحل مع TabibDesk" : "Solution with TabibDesk"}
            </h2>
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <RiCheckboxCircleLine className="size-6 shrink-0 text-green-500" />
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {t.outcome1}
                </p>
              </div>
              <div className="flex gap-4">
                <RiCheckboxCircleLine className="size-6 shrink-0 text-green-500" />
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {t.outcome2}
                </p>
              </div>
              <div className="flex gap-4">
                <RiCheckboxCircleLine className="size-6 shrink-0 text-green-500" />
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {t.outcome3}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

