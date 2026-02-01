"use client"

import { useEffect } from "react"
import { useLocale } from "@/contexts/locale-context"

/**
 * Syncs document.documentElement dir and lang with current locale.
 * Prevents flash by running as soon as locale is available.
 */
export function LocaleSync() {
  const { lang, dir } = useLocale()

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = lang
  }, [lang, dir])

  return null
}
