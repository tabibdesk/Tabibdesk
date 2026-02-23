"use client"

import Link from "next/link"
import { Card } from "@/components/Card"
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

interface CashierCardsProps {
  rows: CashierRow[]
  onCollect: (row: CashierRow) => void
  onApprove: (row: CashierRow) => void
  onRequestProof: (row: CashierRow) => void
  onAddProof: (row: CashierRow) => void
}

export function CashierCards({
  rows,
  onCollect,
  onApprove,
  onRequestProof,
  onAddProof,
}: CashierCardsProps) {
  return (
    <div className="lg:hidden space-y-4">
      {rows.map((row) => (
        <Card key={row.appointmentId} className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={`/patients/${row.patientId}`}
                  className="font-medium text-primary-600 dark:text-primary-400 transition-colors hover:text-gray-900 dark:hover:text-black block"
                >
                  {row.patientName}
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatTime(row.time)}
                </p>
              </div>
              <Badge color={row.appointmentStatus === "completed" ? "emerald" : "gray"} size="xs">
                {row.appointmentStatus}
              </Badge>
            </div>

            {/* Details */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Fee:</span>
              <span className="font-medium text-gray-900 dark:text-gray-50">
                {formatCurrency(row.feeAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Payment:</span>
              <div className="flex flex-col items-end gap-1">
                <Badge color={getBadgeColor(getPaymentStatusVariant(row.paymentStatus))} size="xs">
                  {row.paymentStatus}
                </Badge>
                {row.paymentMethod && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    via {row.paymentMethod}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {row.paymentStatus === "paid" && (
                <span className="text-success-600 dark:text-success-400">
                  <RiCheckLine className="size-5" />
                </span>
              )}
              {row.paymentStatus === "pending_approval" && (
                <Button variant="primary" size="sm" onClick={() => onApprove(row)} className="w-full">
                  <RiCheckLine className="size-4" />
                  Approve
                </Button>
              )}
              {row.paymentStatus === "unpaid" && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => onAddProof(row)}>
                    <RiImageAddLine className="size-4" />
                  </Button>
                  <button
                    type="button"
                    onClick={() => onRequestProof(row)}
                    className="btn-whatsapp"
                    title="Request via WhatsApp"
                    aria-label="Request via WhatsApp"
                  >
                    <RiWhatsappLine className="size-4" />
                  </button>
                  <Button variant="primary" size="sm" onClick={() => onCollect(row)}>
                    <RiMoneyDollarCircleLine className="size-4" />
                    Collect
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
