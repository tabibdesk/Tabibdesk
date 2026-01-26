"use client"

import Link from "next/link"
import { translations, Language } from "@/lib/landing-translations"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { RiMailLine, RiWhatsappLine } from "@remixicon/react"

const CONTACT_EMAIL = "hello@tabibdesk.com"

interface ContactUsProps {
  lang: Language
}

export function ContactUs({ lang }: ContactUsProps) {
  const t = translations[lang]

  const emailSubject = encodeURIComponent(t.contactEmailSubject)
  const emailBody = encodeURIComponent(t.contactEmailBody)
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${emailSubject}&body=${emailBody}`

  const whatsappText = encodeURIComponent(t.contactWhatsAppMessage)
  const whatsapp = `https://wa.me/?text=${whatsappText}`

  return (
    <section id="contact" className="bg-gray-50 py-12 dark:bg-gray-900 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
            {t.contactTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-600 dark:text-gray-400 sm:text-lg">
            {t.contactSubtitle}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6">
          <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 sm:text-base">
                  {t.contactWhatsAppTitle}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t.contactWhatsAppDesc}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                <RiWhatsappLine className="size-5" />
              </div>
            </div>
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href={whatsapp} target="_blank" rel="noopener noreferrer">
                  {t.contactWhatsAppCTA}
                </Link>
              </Button>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {t.contactNote}
              </p>
            </div>
          </Card>

          <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 sm:text-base">
                  {t.contactEmailTitle}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t.contactEmailDesc}
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <RiMailLine className="size-5" />
              </div>
            </div>
            <div className="mt-6">
              <Button asChild variant="secondary" className="w-full">
                <Link href={mailto}>
                  {t.contactEmailCTA}
                </Link>
              </Button>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {CONTACT_EMAIL}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

