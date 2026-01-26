"use client"

import { translations, Language } from "@/lib/landing-translations"
import {
  RiBarChartLine,
  RiFlashlightLine,
  RiVoiceprintLine,
  RiWhatsappLine,
  RiTaskLine,
} from "@remixicon/react"
import { cx } from "@/lib/utils"

interface DifferentiatorsProps {
  lang: Language
}

export function Differentiators({ lang }: DifferentiatorsProps) {
  const t = translations[lang]

  const differentiators = [
    {
      icon: RiBarChartLine,
      title: t.diff1,
      description: t.diff1Note,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: RiWhatsappLine,
      title: t.diff2,
      description: lang === "ar" ? "يعيد ملء المواعيد الملغاة لمرضى آخرين فوراً." : "Instantly offers cancelled slots to waiting patients.",
      color: "text-green-600 bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: RiFlashlightLine,
      title: t.diff3,
      description: lang === "ar" ? "ابدأ العمل فوراً دون إعدادات معقدة." : "Start working immediately with zero complexity.",
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    },
    {
      icon: RiTaskLine,
      title: t.diff4,
      description: lang === "ar" ? "توجيه آلي للسكرتارية لمتابعة الإلغاءات." : "Auto-tasks staff to call back cancellations.",
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      icon: RiVoiceprintLine,
      title: t.diff5,
      description: lang === "ar" ? "نوت سريعة بصوتك وأنت في الطريق." : "Quick voice notes while you're on the go.",
      color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
    },
  ]

  return (
    <section className="bg-white py-16 dark:bg-gray-950 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-50">
            {t.diffTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            {t.diffSubtitle}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((diff, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-center text-center p-8 rounded-3xl transition-all hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <div className={cx("mb-6 flex size-16 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3", diff.color)}>
                <diff.icon className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {diff.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 max-w-xs">
                {diff.description}
              </p>
            </div>
          ))}
          
          {/* Visual USP Card */}
          <div className="flex flex-col items-center justify-center rounded-3xl bg-primary-50 p-8 text-center dark:bg-primary-900/10 lg:col-span-1">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              50%
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
              {lang === "ar" ? "توفير في الوقت الإداري" : "Admin Time Saved"}
            </p>
            <div className="mt-4 h-1.5 w-full max-w-[120px] rounded-full bg-gray-200 dark:bg-gray-800">
              <div className="h-full w-1/2 rounded-full bg-primary-600 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
