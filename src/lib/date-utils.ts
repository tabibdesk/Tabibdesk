import { arEG, enUS } from "date-fns/locale"
import type { Locale } from "date-fns"
import type { Language } from "@/contexts/locale-context"

/** Get date-fns locale for Calendar and format() */
export function getDateLocale(lang: Language): Locale {
  return lang === "ar" ? arEG : (enUS as Locale)
}

/** Always use English for datepickers (month names, day names, etc.) - no translation */
export const DATEPICKER_LOCALE: Locale = enUS as Locale

/** Format date for display, locale-aware */
export function formatDate(
  date: Date | string,
  lang: Language,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date
  const locale = lang === "ar" ? "ar-EG" : "en-US"
  return d.toLocaleDateString(locale, options ?? {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/** Format appointment date (weekday, month day, year) */
export function formatAppointmentDate(dateString: string, lang: Language): string {
  return formatDate(dateString, lang, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/** Egypt: week starts Saturday (6) */
export function getWeekStartsOn(lang: Language): 0 | 1 | 6 {
  return lang === "ar" ? 6 : 0 // Saturday for ar, Sunday for en
}
