/**
 * Returns WhatsApp wa.me URL if phone has dialable digits, otherwise null.
 * Excludes "Online Inquiry", "Live Chat Support", and similar non-dialable strings.
 */
export function getWhatsAppUrl(phone: string): string | null {
  const nonDialable = /online\s*inquiry|live\s*chat|support/i
  if (!phone?.trim() || nonDialable.test(phone.trim())) return null

  const digits = phone.replace(/\D/g, "")
  if (digits.length < 9) return null

  // Egyptian: ensure country code 20
  const normalized = digits.startsWith("20") ? digits : `20${digits}`
  if (normalized.length < 10) return null

  return `https://wa.me/${normalized}`
}
