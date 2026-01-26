"use client"

import { translations, Language } from "@/lib/landing-translations"
import { RiShieldCheckFill, RiUserSettingsFill, RiHistoryFill } from "@remixicon/react"

interface TrustProps {
  lang: Language
}

export function Trust({ lang }: TrustProps) {
  const t = translations[lang]

  const trustItems = [
    {
      icon: RiShieldCheckFill,
      title: lang === "ar" ? "تشفير تام" : "End-to-End Encryption",
      text: t.trust1,
    },
    {
      icon: RiUserSettingsFill,
      title: lang === "ar" ? "تحكم كامل" : "Full Control",
      text: t.trust2,
    },
    {
      icon: RiHistoryFill,
      title: lang === "ar" ? "شفافية مطلقة" : "Complete Transparency",
      text: t.trust3,
    },
  ]

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <RiShieldCheckFill className="size-3" />
            {lang === "ar" ? "الأمان" : "Security"}
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t.trustTitle}
          </h2>
          <div className="mx-auto mt-3 sm:mt-4 max-w-2xl">
            <p className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300">
              {t.trustSubtitle.split(" • ").map((item, i, arr) => (
                <span key={i}>
                  {item}
                  {i < arr.length - 1 && (
                    <span className="mx-2 text-emerald-600 dark:text-emerald-400">•</span>
                  )}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-center text-center p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="mb-4 sm:mb-6 flex size-12 sm:size-14 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-md">
                <item.icon className="size-6 sm:size-7" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                {item.title}
              </h3>
              <p className="mt-2 sm:mt-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
