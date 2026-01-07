"use client"

import { translations, Language } from "@/lib/landing-translations"
import {
  RiMicLine,
  RiRobotLine,
  RiTaskLine,
  RiFileUploadLine,
  RiSettingsLine,
} from "@remixicon/react"

interface DifferentiatorsProps {
  lang: Language
}

export function Differentiators({ lang }: DifferentiatorsProps) {
  const t = translations[lang]

  const features = [
    {
      icon: RiMicLine,
      title: t.diff1,
      note: t.diff1Note,
    },
    {
      icon: RiRobotLine,
      title: t.diff2,
    },
    {
      icon: RiTaskLine,
      title: t.diff3,
    },
    {
      icon: RiFileUploadLine,
      title: t.diff4,
    },
    {
      icon: RiSettingsLine,
      title: t.diff5,
    },
  ]

  return (
    <section className="bg-white py-12 dark:bg-gray-950 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-50 sm:text-4xl">
          {lang === "ar" ? "ليه TabibDesk مختلف؟" : "Why TabibDesk is different?"}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-600 dark:text-gray-400">
          {lang === "ar"
            ? "AI يعمل معاك، مش بدالك"
            : "AI works with you, not instead of you"}
        </p>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="rounded-lg bg-primary-100 p-3 w-fit dark:bg-primary-900/20">
                <feature.icon className="size-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
                {feature.title}
              </h3>
              {feature.note && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {feature.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

