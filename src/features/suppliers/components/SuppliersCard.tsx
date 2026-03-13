"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { Badge } from "@/components/Badge"
import type { Supplier } from "../suppliers.types"
import { getWhatsAppUrl } from "../suppliers.utils"
import { RiPhoneLine, RiExternalLinkLine, RiWhatsappLine } from "@remixicon/react"

interface SuppliersCardProps {
  supplier: Supplier
}

export function SuppliersCard({ supplier }: SuppliersCardProps) {
  const t = useAppTranslations()
  const whatsappUrl = getWhatsAppUrl(supplier.phone)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{supplier.name}</h3>
          <Badge color="slate" size="xs">
            {supplier.specialty}
          </Badge>
        </div>

        {supplier.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <RiPhoneLine className="size-4 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden />
            <span>{supplier.phone}</span>
          </div>
        )}

        {supplier.website && (
          <a
            href={supplier.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary-600 hover:underline dark:text-primary-400"
          >
            <RiExternalLinkLine className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{supplier.website.replace(/^https?:\/\//, "")}</span>
          </a>
        )}

        {supplier.supplies && (
          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{supplier.supplies}</div>
        )}

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp inline-flex w-fit items-center gap-1.5 px-3 py-1.5"
            title={t.suppliers.whatsapp}
            aria-label={t.suppliers.whatsapp}
          >
            <RiWhatsappLine className="size-4" aria-hidden />
            <span className="text-xs font-medium">{t.suppliers.whatsapp}</span>
          </a>
        )}
      </div>
    </div>
  )
}
