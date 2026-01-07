"use client"

import { translations, Language } from "@/lib/landing-translations"
import { Button } from "@/components/Button"

interface PricingProps {
  lang: Language
}

export function Pricing({ lang }: PricingProps) {
  const t = translations[lang]

  return (
    <section className="bg-gray-50 py-12 dark:bg-gray-900 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-50 sm:text-4xl">
          {t.pricingTitle}
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Solo Basic */}
          <div className="rounded-lg border-2 border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {t.planBasic}
            </h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-gray-50">
                {t.planBasicPrice}
              </span>
              <span className="text-lg text-gray-600 dark:text-gray-400">
                {t.planBasicPeriod}
              </span>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {t.planBasicDesc}
            </p>
            <Button className="mt-8 w-full px-6 py-3 text-base">
              {t.ctaPrimary}
            </Button>
          </div>

          {/* Solo Pro */}
          <div className="rounded-lg border-2 border-primary-600 bg-white p-8 dark:border-primary-500 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {t.planPro}
              </h3>
              <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                {lang === "ar" ? "الأكثر شعبية" : "Most Popular"}
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-gray-50">
                {t.planProPrice}
              </span>
              <span className="text-lg text-gray-600 dark:text-gray-400">
                {t.planProPeriod}
              </span>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {t.planProDesc}
            </p>
            <Button className="mt-8 w-full px-6 py-3 text-base">
              {t.ctaPrimary}
            </Button>
          </div>
        </div>

        {/* Add-ons */}
        <div className="mt-16">
          <h3 className="text-center text-xl font-semibold text-gray-900 dark:text-gray-50">
            {lang === "ar" ? "إضافات AI" : "AI Add-ons"}
          </h3>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {t.addonAINotes}
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-50">
                {t.addonAINotesPrice}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {t.addonVoice}
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-50">
                {t.addonVoicePrice}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {t.addonLabAI}
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-50">
                {t.addonLabAIPrice}
              </p>
            </div>
            <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 text-center dark:border-primary-800 dark:bg-primary-900/20">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {t.addonAIBundle}
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900 dark:text-gray-50">
                {t.addonAIBundlePrice}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          {t.pricingCancel}
        </p>
      </div>
    </section>
  )
}

