"use client"

import { translations, Language } from "@/lib/landing-translations"
import { RiShieldCheckLine, RiUserSettingsLine, RiHistoryLine } from "@remixicon/react"

interface TrustProps {
  lang: Language
}

export function Trust({ lang }: TrustProps) {
  const t = translations[lang]

  const trustItems = [
    {
      icon: RiShieldCheckLine,
      text: t.trust1,
    },
    {
      icon: RiUserSettingsLine,
      text: t.trust2,
    },
    {
      icon: RiHistoryLine,
      text: t.trust3,
    },
  ]

  return (
    <section className="bg-white py-12 dark:bg-gray-950 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-50 sm:text-4xl">
          {lang === "ar" ? "الأمان والثقة" : "Security & Trust"}
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
                <item.icon className="size-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-50">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

