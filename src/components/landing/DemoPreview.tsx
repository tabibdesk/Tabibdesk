"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { translations, Language } from "@/lib/landing-translations"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { cx } from "@/lib/utils"
import {
  RiArrowRightLine,
  RiCheckLine,
  RiMoneyDollarCircleLine,
  RiPhoneLine,
  RiRadioButtonLine,
  RiStethoscopeLine,
  RiTimeZoneLine,
  RiWhatsappLine,
  RiImageAddLine,
  RiPlayFill,
} from "@remixicon/react"

type DemoTab = "queue" | "patients" | "billing"

interface DemoPreviewProps {
  lang: Language
}

export function DemoPreview({ lang }: DemoPreviewProps) {
  const t = translations[lang]
  const [tab, setTab] = useState<DemoTab>("queue")

  const tabs = [
    { id: "queue" as DemoTab, label: t.demoTabQueue },
    { id: "patients" as DemoTab, label: t.demoTabPatients },
    { id: "billing" as DemoTab, label: t.demoTabBilling },
  ]

  return (
    <section id="demo" className="relative overflow-hidden bg-gray-950 dark:bg-black py-12 sm:py-16 lg:py-24">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white ring-1 ring-white/20">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            {t.demoEyebrow}
          </div>

          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            {t.demoTitle}
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-base sm:text-lg font-medium text-gray-200">
            {t.demoSubtitle}
          </p>
        </div>

        {/* Features bullets - centered */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[t.demoBullet1, t.demoBullet2, t.demoBullet3].map((bullet, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 hover:bg-white/10 transition-colors">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                  <RiCheckLine className="size-5 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-white leading-tight">
                  {bullet}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo interface - full width */}
        <div className="relative max-w-6xl mx-auto">
          {/* Browser-style window */}
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-gray-900/50 backdrop-blur-xl shadow-2xl">
            {/* Window header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-red-500 shadow-sm" />
                <span className="size-3 rounded-full bg-amber-500 shadow-sm" />
                <span className="size-3 rounded-full bg-emerald-500 shadow-sm" />
              </div>
              
              {/* Tab switcher */}
              <div className="flex items-center gap-2">
                {tabs.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={cx(
                      "rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all",
                      tab === item.id
                        ? "bg-primary-600 text-white shadow-lg"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {lang === "ar" ? "لايڤ" : "Live"}
                </span>
              </div>
            </div>

            {/* Content area */}
            <div className="p-4 sm:p-6 md:p-8 bg-gray-900/30 backdrop-blur-sm">
              {tab === "queue" ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {t.demoQueueTitle}
                    </p>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t.demoQueueMeta}
                    </span>
                  </div>

                  <div className="space-y-2 sm:space-y-2.5">
                    <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-white dark:bg-gray-800/50 p-3 sm:p-4 shadow-sm">
                      <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <RiRadioButtonLine className="size-4 sm:size-5 animate-pulse" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Sarah Ahmed</p>
                          <Badge variant="success" className="h-4 px-1.5 text-xs font-bold lowercase">
                            now
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 lowercase mt-0.5">consultation</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-white dark:bg-gray-800/50 p-3 sm:p-4 shadow-sm">
                      <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <RiTimeZoneLine className="size-4 sm:size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Mohamed Aly</p>
                          <Badge variant="default" className="h-4 px-1.5 text-xs font-bold lowercase">
                            next
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 lowercase mt-0.5">follow-up</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-white dark:bg-gray-800/50 p-3 sm:p-4 shadow-sm opacity-70">
                      <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        <RiTimeZoneLine className="size-4 sm:size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Khaled Omar</p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 lowercase">11:30 am</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 lowercase mt-0.5">waiting</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : tab === "patients" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {t.demoPatientsTitle}
                    </p>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t.demoPatientsMeta}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        name: "Mariam Hassan",
                        ageGender: lang === "ar" ? "34 • أنثى" : "34 • female",
                        complaint: lang === "ar" ? "صداع مزمن مع أرق" : "Chronic headache with insomnia",
                        phone: "+20 10 1234 5678",
                        status: "active" as const,
                      },
                      {
                        name: "Omar Youssef",
                        ageGender: lang === "ar" ? "41 • ذكر" : "41 • male",
                        complaint: lang === "ar" ? "ألم في الركبة بعد إصابة" : "Knee pain after injury",
                        phone: "+20 11 9876 5432",
                        status: "inactive" as const,
                      },
                    ].map((p) => (
                      <Card key={p.name} className="transition-shadow hover:shadow-lg">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 truncate">
                                {p.name}
                              </CardTitle>
                              <CardDescription className="mt-1 text-xs">
                                {p.ageGender}
                              </CardDescription>
                            </div>
                            <Badge variant={p.status === "active" ? "success" : "neutral"} className="text-xs shrink-0">
                              {lang === "ar" ? (p.status === "active" ? "نشط" : "غير نشط") : p.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <RiStethoscopeLine className="mt-0.5 size-4 shrink-0" />
                            <span className="line-clamp-2 overflow-hidden text-ellipsis">{p.complaint}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <RiPhoneLine className="size-3.5 shrink-0" />
                              <span>{p.phone}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {t.demoBillingTitle}
                    </p>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t.demoBillingMeta}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        patient: "Sarah Ahmed",
                        time: "10:00 am",
                        appointmentStatus: "completed" as const,
                        paymentStatus: "paid" as const,
                        paymentMethod: "cash",
                        fee: "450 EGP",
                      },
                      {
                        patient: "Khaled Omar",
                        time: "12:30 pm",
                        appointmentStatus: "scheduled" as const,
                        paymentStatus: "unpaid" as const,
                        paymentMethod: null,
                        fee: "350 EGP",
                      },
                    ].map((row) => (
                      <Card key={row.patient} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-50">
                                {row.patient}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {row.time}
                              </p>
                            </div>
                            <Badge variant={row.appointmentStatus === "completed" ? "success" : "neutral"}>
                              {row.appointmentStatus}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{lang === "ar" ? "الرسوم" : "Fee"}:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-50">
                              {row.fee}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{lang === "ar" ? "الدفع" : "Payment"}:</span>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant={row.paymentStatus === "paid" ? "success" : "neutral"}>
                                {row.paymentStatus}
                              </Badge>
                              {row.paymentMethod && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {lang === "ar" ? "عن طريق" : "via"} {row.paymentMethod}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2">
                            {row.paymentStatus === "paid" ? (
                              <span className="text-success-600 dark:text-success-400">
                                <RiCheckLine className="size-5" />
                              </span>
                            ) : (
                              <>
                                <Button variant="ghost" size="sm" className="pointer-events-none">
                                  <RiImageAddLine className="size-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="pointer-events-none">
                                  <RiWhatsappLine className="size-4" />
                                </Button>
                                <Button variant="primary" size="sm" className="pointer-events-none">
                                  <RiMoneyDollarCircleLine className="size-4" />
                                  {lang === "ar" ? "تحصيل" : "Collect"}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA and info */}
        <div className="mt-8 sm:mt-12 text-center">
          <Button asChild className="h-12 sm:h-14 px-8 sm:px-12 text-sm font-bold uppercase tracking-wide bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all">
            <Link href="/login">
              <RiPlayFill className="size-5 sm:size-6" />
              {lang === "ar" ? "افتح الديمو الآن" : "Open Demo Now"}
              <RiArrowRightLine className="size-5 sm:size-6 rtl:rotate-180" />
            </Link>
          </Button>

          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="relative size-10 overflow-hidden rounded-lg ring-2 ring-white/20">
              <Image
                src="/landing/pexels-karola-g-7195379.jpg"
                alt="Doctor"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md">
              {t.demoFootnote}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
