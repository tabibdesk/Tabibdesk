"use client"

import { translations, Language } from "@/lib/landing-translations"
import {
  RiCalendarLine,
  RiUserLine,
  RiBarChartLine,
  RiWhatsappLine,
  RiMoneyDollarCircleLine,
  RiFlashlightLine,
} from "@remixicon/react"
import { cx } from "@/lib/utils"

interface FeatureGridProps {
  lang: Language
}

export function FeatureGrid({ lang }: FeatureGridProps) {
  const t = translations[lang]

  const bentoItems = [
    {
      title: t.featureCrmTitle,
      description: t.featureCrmDesc,
      icon: RiWhatsappLine,
      className: "lg:col-span-1 lg:row-span-1 bg-green-50 dark:bg-green-900/10",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: t.featureInsightsTitle,
      description: t.featureInsightsDesc,
      icon: RiBarChartLine,
      className: "lg:col-span-2 lg:row-span-1 bg-slate-50 dark:bg-slate-900/10",
      iconColor: "text-slate-600 dark:text-slate-400",
    },
    {
      title: t.module8,
      description: t.featureBillingDesc,
      icon: RiMoneyDollarCircleLine,
      className: "lg:col-span-1 lg:row-span-1 bg-emerald-50 dark:bg-emerald-900/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: t.module1,
      description: t.featureSchedulingDesc,
      icon: RiCalendarLine,
      className: "lg:col-span-1 lg:row-span-2 bg-blue-50 dark:bg-blue-900/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: t.module2,
      description: t.featureTimelineDesc,
      icon: RiUserLine,
      className: "lg:col-span-1 lg:row-span-1 bg-rose-50 dark:bg-rose-900/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    {
      title: t.featureNotesTitle,
      description: t.featureNotesDesc,
      icon: RiFlashlightLine,
      className: "lg:col-span-2 lg:row-span-1 bg-amber-50 dark:bg-amber-900/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ]

  return (
    <section id="features" className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            <RiFlashlightLine className="size-3" />
            {lang === "ar" ? "المميزات" : "Features"}
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t.moduleTitle}
          </h2>
          <div className="mt-3 sm:mt-4 max-w-2xl mx-auto">
            <p className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300">
              {t.moduleSubtitle.split(" • ").map((item, i, arr) => (
                <span key={i}>
                  {item}
                  {i < arr.length - 1 && (
                    <span className="mx-2 text-primary-600 dark:text-primary-400">•</span>
                  )}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
          {bentoItems.map((item, index) => (
            <div
              key={index}
              className={cx(
                "group relative overflow-hidden rounded-xl sm:rounded-2xl border p-5 sm:p-6 lg:p-8 transition-all hover:shadow-xl hover:-translate-y-1",
                item.className,
                "border-transparent dark:border-transparent"
              )}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className={cx("mb-3 sm:mb-4 inline-flex size-10 sm:size-11 items-center justify-center rounded-lg sm:rounded-xl bg-white shadow-md dark:bg-gray-800 ring-1 ring-gray-200/50 dark:ring-gray-700 transition-transform group-hover:scale-110 group-hover:rotate-3")}>
                  <item.icon className={cx("size-5 sm:size-6", item.iconColor)} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                  {item.title}
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                  {item.description.split(" • ").map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && <span className="mx-1 text-primary-600 dark:text-primary-400">•</span>}
                    </span>
                  ))}
                </p>
              </div>

              {/* Decorative Background Icon */}
              <item.icon className={cx("absolute -right-6 sm:-right-8 -bottom-6 sm:-bottom-8 size-24 sm:size-32 opacity-[0.04] dark:opacity-[0.06] transition-transform group-hover:scale-110 group-hover:rotate-6", item.iconColor)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
