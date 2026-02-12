import { useEffect, useState, useRef, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { subscribeToRealtimeChanges, unsubscribeFromRealtime } from '@/lib/realtime'
import { createClient } from '@/lib/supabase/client'

export interface Payment {
  id: string
  invoiceId: string
  clinicId: string
  patientId: string
  patientName?: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check'
  transactionId?: string
  proofFilePath?: string
  proofSignedUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
  processedBy?: string
  processedByName?: string
}

export interface PaymentStatusChange {
  paymentId: string
  previousStatus: Payment['status']
  newStatus: Payment['status']
  timestamp: string
  changedBy?: string
}

interface UsePaymentMonitoringOptions {
  clinicId: string
  invoiceId?: string // Optional filter by invoice
  status?: Payment['status'] | 'all'
  onPaymentReceived?: (payment: Payment) => void
  onPaymentFailed?: (payment: Payment) => void
  onPaymentRefunded?: (payment: Payment) => void
  onPaymentStatusChanged?: (change: PaymentStatusChange) => void
  onError?: (error: Error) => void
}

export function usePaymentMonitoring(options: UsePaymentMonitoringOptions) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [totalReceived, setTotalReceived] = useState(0)
  const [totalPending, setTotalPending] = useState(0)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const previousStatusRef = useRef<Map<string, Payment['status']>>(new Map())

  // Fetch initial payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()

        let query = supabase
          .from('payments')
          .select(
            `
            id,
            invoice_id,
            clinic_id,
            patient_id,
            patients (first_name, last_name),
            amount,
            status,
            payment_method,
            transaction_id,
            proof_file_path,
            notes,
            created_at,
            updated_at,
            processed_by,
            clinic_members!processed_by (first_name, last_name)
          `
          )
          .eq('clinic_id', options.clinicId)

        if (options.invoiceId) {
          query = query.eq('invoice_id', options.invoiceId)
        }

        if (options.status && options.status !== 'all') {
          query = query.eq('status', options.status)
        }

        const { data, error: fetchError } = await query.order('created_at', {
          ascending: false,
        })

        if (fetchError) throw fetchError

        const formattedPayments: Payment[] = (data || []).map((payment: any) => ({
          id: payment.id,
          invoiceId: payment.invoice_id,
          clinicId: payment.clinic_id,
          patientId: payment.patient_id,
          patientName: payment.patients
            ? `${payment.patients.first_name} ${payment.patients.last_name}`
            : undefined,
          amount: payment.amount,
          status: payment.status,
          paymentMethod: payment.payment_method,
          transactionId: payment.transaction_id,
          proofFilePath: payment.proof_file_path,
          notes: payment.notes,
          createdAt: payment.created_at,
          updatedAt: payment.updated_at,
          processedBy: payment.processed_by,
          processedByName: payment.clinic_members
            ? `${payment.clinic_members.first_name} ${payment.clinic_members.last_name}`
            : undefined,
        }))

        setPayments(formattedPayments)

        // Calculate totals
        const received = formattedPayments
          .filter((p) => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0)
        const pending = formattedPayments
          .filter((p) => p.status === 'pending' || p.status === 'processing')
          .reduce((sum, p) => sum + p.amount, 0)

        setTotalReceived(received)
        setTotalPending(pending)

        // Store initial statuses for change detection
        formattedPayments.forEach((p) => {
          previousStatusRef.current.set(p.id, p.status)
        })
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch payments')
        setError(error)
        options.onError?.(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [options.clinicId, options.invoiceId, options.status, options])

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = subscribeToRealtimeChanges({
      table: 'payments',
      filter: `clinic_id=eq.${options.clinicId}`,
      event: '*',
      onMessage: (payload) => {
        console.log('[v0] Payment update received:', payload)

        setPayments((prev) => {
          if (payload.eventType === 'DELETE') {
            return prev.filter((p) => p.id !== payload.old?.id)
          }

          const updated = [...prev]
          const index = updated.findIndex(
            (p) => p.id === payload.new?.id || p.id === payload.old?.id
          )

          if (payload.new) {
            const newPayment: Payment = {
              id: payload.new.id,
              invoiceId: payload.new.invoice_id,
              clinicId: payload.new.clinic_id,
              patientId: payload.new.patient_id,
              amount: payload.new.amount,
              status: payload.new.status,
              paymentMethod: payload.new.payment_method,
              transactionId: payload.new.transaction_id,
              proofFilePath: payload.new.proof_file_path,
              notes: payload.new.notes,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
              processedBy: payload.new.processed_by,
            }

            // Trigger status change callbacks
            const previousStatus = previousStatusRef.current.get(newPayment.id)
            if (previousStatus && previousStatus !== newPayment.status) {
              const change: PaymentStatusChange = {
                paymentId: newPayment.id,
                previousStatus,
                newStatus: newPayment.status,
                timestamp: new Date().toISOString(),
              }

              if (newPayment.status === 'completed') {
                options.onPaymentReceived?.(newPayment)
              } else if (newPayment.status === 'failed') {
                options.onPaymentFailed?.(newPayment)
              } else if (newPayment.status === 'refunded') {
                options.onPaymentRefunded?.(newPayment)
              }

              options.onPaymentStatusChanged?.(change)
            }

            previousStatusRef.current.set(newPayment.id, newPayment.status)

            if (index >= 0) {
              updated[index] = newPayment
            } else {
              updated.unshift(newPayment)
            }
          } else if (index >= 0) {
            updated.splice(index, 1)
          }

          return updated
        })

        // Recalculate totals
        setPayments((prev) => {
          const received = prev
            .filter((p) => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0)
          const pending = prev
            .filter((p) => p.status === 'pending' || p.status === 'processing')
            .reduce((sum, p) => sum + p.amount, 0)

          setTotalReceived(received)
          setTotalPending(pending)

          return prev
        })

        setLastUpdate(new Date())
      },
      onError: (err) => {
        setError(err)
        options.onError?.(err)
      },
    })

    channelRef.current = channel
    setIsConnected(!!channel)

    return () => {
      if (channelRef.current) {
        unsubscribeFromRealtime(channelRef.current).catch(console.error)
      }
    }
  }, [options.clinicId, options])

  // Update payment status
  const updatePaymentStatus = useCallback(
    async (paymentId: string, newStatus: Payment['status']) => {
      try {
        const supabase = createClient()
        const { error: updateError } = await supabase
          .from('payments')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', paymentId)

        if (updateError) throw updateError

        // Local update for immediate feedback
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status: newStatus } : p))
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update payment')
        setError(error)
        options.onError?.(error)
      }
    },
    [options]
  )

  // Update payment with notes/proof
  const updatePayment = useCallback(
    async (paymentId: string, updates: Partial<Payment>) => {
      try {
        const supabase = createClient()
        const { error: updateError } = await supabase
          .from('payments')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', paymentId)

        if (updateError) throw updateError

        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, ...updates } : p))
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update payment')
        setError(error)
        options.onError?.(error)
      }
    },
    [options]
  )

  return {
    payments,
    isLoading,
    isConnected,
    error,
    lastUpdate,
    totalReceived,
    totalPending,
    updatePaymentStatus,
    updatePayment,
    // Computed properties
    completedCount: payments.filter((p) => p.status === 'completed').length,
    pendingCount: payments.filter(
      (p) => p.status === 'pending' || p.status === 'processing'
    ).length,
    failedCount: payments.filter((p) => p.status === 'failed').length,
    refundedCount: payments.filter((p) => p.status === 'refunded').length,
    allPaymentsReceived: payments.length > 0 && payments.every((p) => p.status === 'completed'),
  }
}
