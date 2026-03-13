"use client"

import { useState } from "react"
import { PageLayout } from "@/components/shared/PageLayout"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { ConfirmationModal } from "@/components/ConfirmationModal"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useDemo } from "@/contexts/demo-context"
import { updateStatus as updateAppointmentStatus } from "@/features/appointments/appointments.api"
import { InvoiceDrawer } from "@/features/accounting/components/InvoiceDrawer"
import { useToast } from "@/hooks/useToast"
import { buildCreateInvoiceAppointments } from "./home.types"
import type { HomeAppointment } from "./home.types"
import { useHomeData } from "./useHomeData"
import { useQueueActions } from "./useQueueActions"
import { NowQueueWidget } from "./NowQueueWidget"
import { TodaysAppointmentsWidget } from "./TodaysAppointmentsWidget"

export default function HomePage() {
  const t = useAppTranslations()
  const { currentUser, currentClinic } = useUserClinic()
  const { isDemoMode } = useDemo()
  const { showToast } = useToast()
  const role = currentUser.role

  const {
    loading,
    appointments,
    setAppointments,
    paidAppointments,
    setPaidAppointments,
    fetchHomeData,
    loadPaymentStatus,
  } = useHomeData(isDemoMode, role, currentClinic)

  const queueActions = useQueueActions({
    appointments,
    setAppointments,
    paidAppointments,
    setPaidAppointments,
    currentUser,
    showToast,
    fetchHomeData,
    loadPaymentStatus,
  })

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [showNoShowModal, setShowNoShowModal] = useState(false)
  const [appointmentToMarkNoShow, setAppointmentToMarkNoShow] = useState<string | null>(null)
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false)
  const [markingArrived, setMarkingArrived] = useState<string | null>(null)
  const [markingPaid, setMarkingPaid] = useState<string | null>(null)
  const [showArrivedModal, setShowArrivedModal] = useState(false)
  const [showCreateInvoiceDrawer, setShowCreateInvoiceDrawer] = useState(false)
  const [showUnmarkArrivedModal, setShowUnmarkArrivedModal] = useState(false)
  const [showUnmarkPaidModal, setShowUnmarkPaidModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<HomeAppointment | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", "")
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    await queueActions.handleDrop(draggedIndex, dropIndex, setDraggedIndex, setDragOverIndex)
  }

  const handleNoShowClick = (apt: HomeAppointment) => {
    setAppointmentToMarkNoShow(apt.id)
    setShowNoShowModal(true)
  }

  const handleNoShowConfirm = async () => {
    if (!appointmentToMarkNoShow) return
    setIsMarkingNoShow(true)
    try {
      await queueActions.updateQueueStatus(appointmentToMarkNoShow, "no_show")
      showToast("Appointment marked as no show", "success")
      setShowNoShowModal(false)
      setAppointmentToMarkNoShow(null)
    } catch {
      showToast("Failed to mark appointment as no show", "error")
    } finally {
      setIsMarkingNoShow(false)
    }
  }

  const handleMarkArrived = async () => {
    if (!selectedAppointment) return
    setMarkingArrived(selectedAppointment.id)
    try {
      await updateAppointmentStatus(selectedAppointment.id, "arrived")
      showToast(t.home.toastMarkedArrived, "success")
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id ? { ...apt, status: "arrived" as const } : apt
        )
      )
      setShowArrivedModal(false)
    } catch {
      showToast(t.home.toastArrivedFailed, "error")
    } finally {
      setMarkingArrived(null)
    }
  }

  const handleUnmarkArrived = async () => {
    if (!selectedAppointment) return
    setMarkingArrived(selectedAppointment.id)
    try {
      await updateAppointmentStatus(selectedAppointment.id, "scheduled")
      showToast(t.home.toastArrivalRemoved, "success")
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id ? { ...apt, status: "scheduled" as const } : apt
        )
      )
      setShowUnmarkArrivedModal(false)
    } catch {
      showToast(t.home.toastUnmarkArrivedFailed, "error")
    } finally {
      setMarkingArrived(null)
    }
  }

  const handleCreateInvoiceSuccess = async () => {
    setShowCreateInvoiceDrawer(false)
    setSelectedAppointment(null)
    await fetchHomeData()
    if (currentClinic) await loadPaymentStatus()
  }

  const handleUnmarkPaid = async () => {
    if (!selectedAppointment) return
    setMarkingPaid(selectedAppointment.id)
    try {
      await queueActions.handleUnmarkPaid(selectedAppointment, () => {
        setShowUnmarkPaidModal(false)
      })
    } catch {
      // Error already shown in hook
    } finally {
      setMarkingPaid(null)
    }
  }

  return (
    <PageLayout title={t.nav.home}>
      {role === "doctor" ? (
        <div className="space-y-4">
          <NowQueueWidget
            loading={loading}
            appointments={appointments}
            onMarkDone={queueActions.handleMarkDone}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <TodaysAppointmentsWidget
            loading={loading}
            appointments={appointments}
            paidAppointments={paidAppointments}
            draggedIndex={draggedIndex}
            dragOverIndex={dragOverIndex}
            markingArrived={markingArrived}
            markingPaid={markingPaid}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={handleDrop}
            onDragEnd={() => {
              setDraggedIndex(null)
              setDragOverIndex(null)
            }}
            onMarkArrived={(apt) => {
              setSelectedAppointment(apt)
              setShowArrivedModal(true)
            }}
            onCreateInvoice={(apt) => {
              setSelectedAppointment(apt)
              setShowCreateInvoiceDrawer(true)
            }}
            onNoShow={handleNoShowClick}
            onUnmarkArrived={(apt) => {
              setSelectedAppointment(apt)
              setShowUnmarkArrivedModal(true)
            }}
            onUnmarkPaid={(apt) => {
              setSelectedAppointment(apt)
              setShowUnmarkPaidModal(true)
            }}
          />
        </div>
      )}

      {/* Modals - outside main content flow */}
      <ConfirmationModal
        isOpen={showNoShowModal}
        onClose={() => {
          if (!isMarkingNoShow) {
            setShowNoShowModal(false)
            setAppointmentToMarkNoShow(null)
          }
        }}
        onConfirm={handleNoShowConfirm}
        title={t.home.modalNoShowTitle}
        description={t.home.modalNoShowConfirm}
        confirmText={t.home.yesMarkNoShow}
        cancelText={t.common.cancel}
        loadingText={t.common.processing}
        variant="danger"
        isLoading={isMarkingNoShow}
      />

      <ConfirmationModal
        isOpen={showArrivedModal}
        onClose={() => setShowArrivedModal(false)}
        onConfirm={handleMarkArrived}
        title={t.home.modalArrivedTitle}
        description={t.home.modalArrivedConfirm.replace("{name}", selectedAppointment?.patientName ?? "")}
        confirmText={t.home.confirmArrival}
        cancelText={t.common.cancel}
        loadingText={t.common.processing}
        variant="success"
        isLoading={!!markingArrived}
      />

      <ConfirmationModal
        isOpen={showUnmarkArrivedModal}
        onClose={() => setShowUnmarkArrivedModal(false)}
        onConfirm={handleUnmarkArrived}
        title={t.home.modalUndoArrivalTitle}
        description={t.home.modalUndoArrivalConfirm.replace("{name}", selectedAppointment?.patientName ?? "")}
        confirmText={t.home.yesUndo}
        cancelText={t.common.cancel}
        loadingText={t.common.processing}
        variant="danger"
        isLoading={!!markingArrived}
      />

      <InvoiceDrawer
        open={showCreateInvoiceDrawer}
        onOpenChange={(open) => {
          setShowCreateInvoiceDrawer(open)
          if (!open) setSelectedAppointment(null)
        }}
        mode="invoice-and-pay"
        invoice={null}
        patientId={selectedAppointment?.patient_id}
        patientAppointments={selectedAppointment ? buildCreateInvoiceAppointments(selectedAppointment) : []}
        defaultAppointmentId={selectedAppointment?.id}
        onSuccess={handleCreateInvoiceSuccess}
      />

      <ConfirmationModal
        isOpen={showUnmarkPaidModal}
        onClose={() => setShowUnmarkPaidModal(false)}
        onConfirm={handleUnmarkPaid}
        title={t.home.modalUndoPaymentTitle}
        description={t.home.modalUndoPaymentConfirm.replace("{name}", selectedAppointment?.patientName ?? "")}
        confirmText={t.home.yesDeleteRecord}
        cancelText={t.common.cancel}
        loadingText={t.common.processing}
        variant="danger"
        isLoading={!!markingPaid}
      />
    </PageLayout>
  )
}
