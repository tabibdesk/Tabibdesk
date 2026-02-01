"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { Badge } from "@/components/Badge"
import { getBadgeColor } from "@/lib/badgeColors"
import { Button } from "@/components/Button"
import type { CashierRow } from "../accounting.types"
import {
  RiCheckLine,
  RiMoneyDollarCircleLine,
  RiWhatsappLine,
  RiImageAddLine,
} from "@remixicon/react"
import { formatCurrency, formatTime, getPaymentStatusVariant } from "../accounting.utils"

interface CashierTableProps {
  rows: CashierRow[]
  onCollect: (row: CashierRow) => void
  onApprove: (row: CashierRow) => void
  onRequestProof: (row: CashierRow) => void
  onAddProof: (row: CashierRow) => void
}

export function CashierTable({
  rows,
  onCollect,
  onApprove,
  onRequestProof,
  onAddProof,
}: CashierTableProps) {
  const t = useAppTranslations()
  return (
    <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t.table.time}
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t.table.patient}
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t.table.aptStatus}
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t.table.fee}
            </th>
            <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t.table.payment}
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t.table.actions}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
          {rows.map((row) => (
            <tr key={row.appointmentId}>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-50">
                {formatTime(row.time)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-50">
                {row.patientName}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <Badge color={row.appointmentStatus === "completed" ? "emerald" : "gray"} size="xs">
                  {row.appointmentStatus}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-50">
                {formatCurrency(row.feeAmount)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <div className="flex flex-col gap-1">
                  <Badge color={getBadgeColor(getPaymentStatusVariant(row.paymentStatus))} size="xs">
                    {row.paymentStatus}
                  </Badge>
                  {row.paymentMethod && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      via {row.paymentMethod}
                    </span>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  {row.paymentStatus === "paid" && (
                    <span className="text-success-600 dark:text-success-400">
                      <RiCheckLine className="size-5" />
                    </span>
                  )}
                  {row.paymentStatus === "pending_approval" && (
                    <Button variant="primary" size="sm" onClick={() => onApprove(row)}>
                      <RiCheckLine className="size-4" />
                      Approve
                    </Button>
                  )}
                  {row.paymentStatus === "unpaid" && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => onAddProof(row)} title="Add Payment Proof">
                        <RiImageAddLine className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onRequestProof(row)} title="Request via WhatsApp">
                        <RiWhatsappLine className="size-4" />
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => onCollect(row)}>
                        <RiMoneyDollarCircleLine className="size-4" />
                        Collect
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
