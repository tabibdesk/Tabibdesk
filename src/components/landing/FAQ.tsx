"use client"

import { translations, Language } from "@/lib/landing-translations"
import { RiAddLine, RiSubtractLine } from "@remixicon/react"

interface FAQProps {
  lang: Language
}

export function FAQ({ lang }: FAQProps) {
  const t = translations[lang]

  const faqs = [
    { q: t.faqQ1, a: t.faqA1 },
    { q: t.faqQ2, a: t.faqA2 },
    { q: t.faqQ3, a: t.faqA3 },
    { q: t.faqQ4, a: t.faqA4 },
    { q: t.faqQ5, a: t.faqA5 },
  ]

  return (
    <section id="faq" className="bg-white py-12 dark:bg-gray-950 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            <RiAddLine className="size-3" />
            {lang === "ar" ? "الأسئلة" : "FAQ"}
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t.faqTitle}
          </h2>
          <p className="mt-3 sm:mt-4 text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.faqSubtitle}
          </p>
        </div>

        <div className="mt-8 sm:mt-12 lg:mt-16 divide-y divide-gray-200 dark:divide-gray-700 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 shadow-lg overflow-hidden">
          {faqs.map((item) => (
            <details key={item.q} className="group p-4 sm:p-5 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <summary className="flex cursor-pointer list-none items-start sm:items-center justify-between gap-3 sm:gap-4">
                <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight flex-1">
                  {item.q}
                </span>
                <span className="shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-300 group-open:bg-primary-50 group-open:text-primary-700 dark:group-open:bg-primary-900/30 dark:group-open:text-primary-300 transition-colors">
                  <RiAddLine className="size-4 group-open:hidden" />
                  <RiSubtractLine className="size-4 hidden group-open:block" />
                </span>
              </summary>
              <p className="mt-3 sm:mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300 pr-8">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

