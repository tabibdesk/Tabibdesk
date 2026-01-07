"use client"

import { translations, Language } from "@/lib/landing-translations"
import {
  RiCalendarLine,
  RiUserLine,
  RiFileTextLine,
  RiTaskLine,
  RiFileListLine,
  RiMedicineBottleLine,
  RiBarChartLine,
  RiVideoLine,
} from "@remixicon/react"

interface FeatureGridProps {
  lang: Language
}

export function FeatureGrid({ lang }: FeatureGridProps) {
  const t = translations[lang]

  const features = [
    { icon: RiCalendarLine, title: t.module1 },
    { icon: RiUserLine, title: t.module2 },
    { icon: RiFileTextLine, title: t.module3 },
    { icon: RiTaskLine, title: t.module4 },
    { icon: RiFileListLine, title: t.module5 },
    { icon: RiMedicineBottleLine, title: t.module6 },
    { icon: RiBarChartLine, title: t.module7 },
    { icon: RiVideoLine, title: t.module8 },
  ]

  return (
    <section className="bg-white py-12 dark:bg-gray-950 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-50 sm:text-4xl">
          {lang === "ar" ? "إيه اللي هتحصل عليه؟" : "What you get"}
        </h2>
        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900/20">
                <feature.icon className="size-6 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-50">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

