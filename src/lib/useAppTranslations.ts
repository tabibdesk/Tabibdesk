"use client"

import { useLocale } from "@/contexts/locale-context"
import { appTranslations } from "./app-translations"

export function useAppTranslations() {
  const { lang } = useLocale()
  return appTranslations[lang]
}
