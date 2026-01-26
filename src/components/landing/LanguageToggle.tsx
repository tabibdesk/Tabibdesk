"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Language, translations } from "@/lib/landing-translations"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/Dropdown"
import { RiGlobalLine, RiCheckLine } from "@remixicon/react"

function LanguageToggleContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentLang = (searchParams.get("lang") || "en") as Language

  const setLanguage = (newLang: Language) => {
    if (newLang === currentLang) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("lang", newLang)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 hover:dark:bg-gray-800">
          <RiGlobalLine className="size-4 shrink-0" />
          <span className="hidden sm:inline-block">
            {currentLang === "ar" ? "العربية" : "English"}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        <DropdownMenuItem onClick={() => setLanguage("ar")} className="justify-between">
          <span className={currentLang === "ar" ? "font-semibold" : ""}>العربية</span>
          {currentLang === "ar" && <RiCheckLine className="size-4 text-primary-600" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("en")} className="justify-between">
          <span className={currentLang === "en" ? "font-semibold" : ""}>English</span>
          {currentLang === "en" && <RiCheckLine className="size-4 text-primary-600" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LanguageToggle() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm">
          <RiGlobalLine className="size-4" />
        </div>
      }
    >
      <LanguageToggleContent />
    </Suspense>
  )
}
