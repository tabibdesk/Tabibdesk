import { redirect } from "next/navigation"

export default function PricingPageRedirect({
  searchParams,
}: {
  searchParams?: { lang?: string }
}) {
  const lang = searchParams?.lang
  redirect(lang ? `/?lang=${lang}#pricing` : "/#pricing")
}
