"use client"

import { translations, Language } from "@/lib/landing-translations"
import { Button } from "@/components/Button"
import {
  RiCheckLine,
  RiMoneyDollarCircleLine,
  RiPlayFill,
  RiSparklingLine,
} from "@remixicon/react"
import Link from "next/link"

interface PricingProps {
  lang: Language
}

export function Pricing({ lang }: PricingProps) {
  const t = translations[lang]

  const tiers = [
    {
      name: t.planStarter,
      price: t.planStarterPrice,
      description: t.planStarterDesc,
      features: [
        lang === "ar" ? "عيادة واحدة • طبيب • سكرتارية" : "1 Clinic • 1 Doctor • 1 Staff",
        lang === "ar" ? "ملفات المرضى والمواعيد" : "Patient files & Appointments",
        lang === "ar" ? "إدارة المهام والحسابات الأساسية" : "Tasks & Basic accounting",
        lang === "ar" ? "تذكيرات واتساب (يدوية)" : "WhatsApp reminders (manual link)",
      ],
      cta: t.ctaSecondary,
      featured: false,
    },
    {
      name: t.planPro,
      price: t.planProPrice,
      description: t.planProDesc,
      features: [
        lang === "ar" ? "كل ما في باقة Starter" : "Everything in Starter",
        lang === "ar" ? "ملخص الزيارة بالذكاء الاصطناعي" : "AI Visit Note Summary",
        lang === "ar" ? "بحث ذكي وتلخص للملفات" : "Smart patient summary",
        lang === "ar" ? "أرشفة التحاليل والتقارير" : "Lab upload & extraction",
      ],
      cta: t.ctaSecondary,
      featured: true,
    },
    {
      name: t.planClinic,
      price: t.planClinicPrice,
      description: t.planClinicDesc,
      features: [
        lang === "ar" ? "عدة أطباء وسكرتارية" : "Multiple Doctors & Staff",
        lang === "ar" ? "صلاحيات وأدوار متقدمة" : "Role-based access control",
        lang === "ar" ? "تقارير أداء العيادة وتحليل الإيرادات" : "Advanced clinic insights",
        lang === "ar" ? "دعم فني مخصص" : "Priority support",
      ],
      cta: t.ctaSecondary,
      featured: false,
    },
  ]

  return (
    <section id="pricing" className="bg-white dark:bg-gray-950 py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            <RiMoneyDollarCircleLine className="size-3" />
            {t.navPricing}
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t.pricingTitle}
          </h2>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {t.pricingCancel}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative flex flex-col rounded-3xl p-8 transition-all hover:shadow-2xl ${
                tier.featured
                  ? "bg-primary-600 text-white shadow-xl scale-105 z-10"
                  : "bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                  {lang === "ar" ? "الأكثر طلباً" : "Most Popular"}
                </div>
              )}
              
              <div className="mb-8">
                <h3 className={`text-lg font-bold ${tier.featured ? "text-white" : "text-gray-900 dark:text-white"}`}>
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold tracking-tight ${tier.featured ? "text-white" : "text-gray-900 dark:text-white"}`}>
                    {tier.price}
                  </span>
                  <span className={`text-xs font-semibold ${tier.featured ? "text-primary-100" : "text-gray-500 dark:text-gray-400"}`}>
                    {t.planPeriod}
                  </span>
                </div>
                <p className={`mt-2 text-xs font-medium ${tier.featured ? "text-primary-100" : "text-gray-500 dark:text-gray-400"}`}>
                  {tier.description}
                </p>
              </div>

              <ul className="mb-8 space-y-4 flex-1">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <RiCheckLine className={`size-5 shrink-0 ${tier.featured ? "text-emerald-400" : "text-emerald-500"}`} />
                    <span className={`text-sm font-medium ${tier.featured ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full h-12 text-sm font-bold uppercase tracking-wider transition-all ${
                  tier.featured
                    ? "bg-white text-primary-600 hover:bg-gray-50"
                    : "variant-secondary"
                }`}
              >
                <Link href="/login" className="flex items-center justify-center gap-2">
                  <RiPlayFill className="size-4" />
                  {tier.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Add-ons Section - Minimal */}
        <div className="mt-12 flex flex-col items-center">
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-900/50 p-6 w-full max-w-3xl border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <RiSparklingLine className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t.addonTitle}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{lang === "ar" ? "باقات مخصصة حسب احتياجك" : "Custom packs based on your needs"}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700">
                  {t.addonWhatsApp}
                </span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700">
                  {t.addonAI}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
