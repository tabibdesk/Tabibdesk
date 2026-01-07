"use client"

import { translations, Language } from "@/lib/landing-translations"
import { RiUserLine, RiEditLine, RiCheckLine } from "@remixicon/react"
import Image from "next/image"

interface HowItWorksProps {
  lang: Language
}

export function HowItWorks({ lang }: HowItWorksProps) {
  const t = translations[lang]

  const steps = [
    {
      icon: RiUserLine,
      title: t.step1,
      number: "1",
    },
    {
      icon: RiEditLine,
      title: t.step2,
      number: "2",
    },
    {
      icon: RiCheckLine,
      title: t.step3,
      number: "3",
    },
  ]

  return (
    <section className="bg-gray-50 py-12 dark:bg-gray-900 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-50 sm:text-4xl">
          {lang === "ar" ? "ازاي بيشتغل؟" : "How it works"}
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white dark:bg-indigo-500">
                  {step.number}
                </div>
                <div className="mt-6 rounded-lg bg-primary-100 p-4 dark:bg-primary-900/20">
                  <step.icon className="size-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-50">
                  {step.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-lg bg-blue-50 p-6 text-center dark:bg-blue-900/10">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t.controlNote}
          </p>
        </div>
        <div className="mt-12 flex justify-center">
          <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl">
            <Image
              src="/landing/pexels-karola-g-7195374.jpg"
              alt={lang === "ar" ? "سير العمل" : "Workflow"}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

