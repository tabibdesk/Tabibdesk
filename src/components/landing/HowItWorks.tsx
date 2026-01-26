"use client"

import Image from "next/image"
import { translations, Language } from "@/lib/landing-translations"
import { RiRobotLine, RiUserLine, RiVoiceprintLine, RiCheckLine } from "@remixicon/react"

interface HowItWorksProps {
  lang: Language
}

export function HowItWorks({ lang }: HowItWorksProps) {
  const t = translations[lang]

  const steps = [
    {
      icon: RiUserLine,
      title: t.step1,
      description: (t as any).step1Desc,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: RiVoiceprintLine,
      title: t.step2,
      description: (t as any).step2Desc,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: RiRobotLine,
      title: t.step3,
      description: (t as any).step3Desc,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
  ]

  return (
    <section className="bg-gray-50 dark:bg-gray-900/50 py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t.howItWorksTitle}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t.howItWorksSubtitle}
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className={`flex size-16 items-center justify-center rounded-2xl ${step.bgColor} ${step.color} mb-6 transition-transform group-hover:scale-110`}>
                  <step.icon className="size-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
              {/* Arrow decoration between steps (desktop only) */}
              {i < 2 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%-1rem)] w-8 h-px bg-gray-200 dark:bg-gray-800" />
              )}
            </div>
          ))}
        </div>

        {/* Featured Lifestyle Image */}
        <div className="mt-16 sm:mt-24 relative">
          <div className="relative aspect-[16/7] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800">
            <Image
              src="/landing/pexels-karola-g-7195374.jpg"
              alt={lang === "ar" ? "طبيب يستخدم تبييب ديسك" : "Doctor using TabibDesk"}
              fill
              className="object-cover"
              sizes="100vw"
            />
            {/* Minimal floating overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/40 to-transparent" />
            <div className="absolute bottom-8 left-8 max-w-xs">
              <div className="rounded-xl bg-white/10 backdrop-blur-md p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <RiCheckLine className="size-5 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {lang === "ar" ? "جاهز الآن" : "Ready to Use"}
                  </span>
                </div>
                <p className="text-xs text-white font-medium leading-relaxed">
                  {t.controlNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
