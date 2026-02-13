"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/Card"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useToast } from "@/hooks/useToast"
import { getTodayCashierRows, updatePayment } from "@/api/accounting.api"
import type { CashierRow } from "../accounting.types"
import { CashierTable } from "../components/CashierTable"
import { CashierCards } from "../components/CashierCards"
import { CollectPaymentModal } from "../components/CollectPaymentModal"
import { PaymentProofModal } from "../components/PaymentProofModal"
import { formatCurrency } from "../accounting.utils"
import { ListSkeleton } from "@/components/skeletons"
import { EmptyState } from "@/components/EmptyState"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { RiMoneyDollarCircleLine } from "@remixicon/react"

export function TodayCashierTab() {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<CashierRow[]>([])
  const [selectedRow, setSelectedRow] = useState<CashierRow | null>(null)
  const [showCollectModal, setShowCollectModal] = useState(false)
  const [showProofModal, setShowProofModal] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split("T")[0]
      const fetchedRows = await getTodayCashierRows({
        clinicId: currentClinic.id,
        date: today,
      })
      setRows(fetchedRows)
    } catch (error) {
      console.error("Failed to load cashier data:", error)
      showToast("Failed to load cashier data", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentClinic.id])

  const handleCollect = (row: CashierRow) => {
    setSelectedRow(row)
    setShowCollectModal(true)
  }

  const handleAddProof = (row: CashierRow) => {
    setSelectedRow(row)
    setShowProofModal(true)
  }

  const handleApprove = async (row: CashierRow) => {
    if (!row.paymentId) return

    try {
      await updatePayment(row.paymentId, { status: "paid" })
      showToast("Payment approved", "success")
      await loadData()
    } catch (error) {
      console.error("Failed to approve payment:", error)
      showToast("Failed to approve payment", "error")
    }
  }

  const handleRequestProof = (row: CashierRow) => {
    // Mock: Open WhatsApp to request proof
    const message = `Hi ${row.patientName}, please send payment confirmation for ${formatCurrency(row.feeAmount)}`
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank")
  }

  const handlePaymentSuccess = () => {
    loadData()
  }

  // Calculate KPIs
  const totalRevenue = rows
    .filter((r) => r.paymentStatus === "paid")
    .reduce((sum, r) => sum + (r.paymentAmount || 0), 0)
  
  const unpaidCount = rows.filter((r) => r.paymentStatus === "unpaid").length
  const pendingCount = rows.filter((r) => r.paymentStatus === "pending_approval").length

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Today&apos;s Revenue</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
            {formatCurrency(totalRevenue)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Unpaid</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-400">
            {unpaidCount}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
          <p className="mt-1 text-2xl font-semibold text-primary-600 dark:text-primary-400">
            {pendingCount}
          </p>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="p-6">
          <ListSkeleton rows={6} />
        </Card>
      )}

      {/* Empty State */}
      {!loading && rows.length === 0 && (
        <EmptyState
          icon={RiMoneyDollarCircleLine}
          title={t.accounting.noTodayCashier}
          description={t.accounting.todayCashierDescription}
        />
      )}

      {/* Data */}
      {!loading && rows.length > 0 && (
        <>
          <CashierTable
            rows={rows}
            onCollect={handleCollect}
            onApprove={handleApprove}
            onRequestProof={handleRequestProof}
            onAddProof={handleAddProof}
          />
          <CashierCards
            rows={rows}
            onCollect={handleCollect}
            onApprove={handleApprove}
            onRequestProof={handleRequestProof}
            onAddProof={handleAddProof}
          />
        </>
      )}

      {/* Modals */}
      <CollectPaymentModal
        open={showCollectModal}
        onOpenChange={setShowCollectModal}
        cashierRow={selectedRow}
        onSuccess={handlePaymentSuccess}
      />
      <PaymentProofModal
        open={showProofModal}
        onOpenChange={setShowProofModal}
        prefilledData={selectedRow ? {
          patientId: selectedRow.patientId,
          patientName: selectedRow.patientName,
          appointmentId: selectedRow.appointmentId,
          feeAmount: selectedRow.feeAmount,
        } : null}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
