/**
 * Notifications API - stub for WhatsApp/SMS/Email notifications
 * Currently stores messages in memory for debugging, easy to replace with real provider
 */

export interface NotificationMessage {
  id: string
  patientId: string
  channel: "whatsapp" | "sms" | "email"
  type: "offer" | "cancellation_confirm"
  content: string
  sentAt: string
  status: "sent" | "failed" | "pending"
}

export interface SendOfferParams {
  patientId: string
  slot: {
    startAt: string
    endAt: string
    doctorName?: string
    appointmentType: string
  }
  channel: "whatsapp" | "sms" | "email"
}

export interface SendCancellationConfirmParams {
  patientId: string
  appointmentId: string
  channel: "whatsapp" | "sms" | "email"
}

// In-memory store for sent notifications (demo mode only)
let notificationsStore: NotificationMessage[] = []

/**
 * Send an offer notification to a patient
 */
export async function sendOffer(params: SendOfferParams): Promise<NotificationMessage> {
  const { patientId, slot, channel } = params

  const slotDate = new Date(slot.startAt)
  const formattedDate = slotDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const formattedTime = slotDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const content = `Hi! We have an available appointment slot: ${formattedDate} at ${formattedTime}. Would you like to book it? Reply YES to confirm.`

  const message: NotificationMessage = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    patientId,
    channel,
    type: "offer",
    content,
    sentAt: new Date().toISOString(),
    status: "sent",
  }

  notificationsStore.push(message)

  // Log for debugging
  console.log(`[Notification] Sent offer via ${channel}`, {
    patientId,
    slot: slot.startAt,
    messageId: message.id,
  })

  return message
}

/**
 * Send cancellation confirmation notification
 */
export async function sendCancellationConfirm(
  params: SendCancellationConfirmParams
): Promise<NotificationMessage> {
  const { patientId, appointmentId, channel } = params

  const content = `Your appointment has been cancelled. If you need to reschedule, please contact us.`

  const message: NotificationMessage = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    patientId,
    channel,
    type: "cancellation_confirm",
    content,
    sentAt: new Date().toISOString(),
    status: "sent",
  }

  notificationsStore.push(message)

  console.log(`[Notification] Sent cancellation confirm via ${channel}`, {
    patientId,
    appointmentId,
    messageId: message.id,
  })

  return message
}

/**
 * Get all notifications (for debugging/admin)
 */
export function getAllNotifications(): NotificationMessage[] {
  return [...notificationsStore]
}

/**
 * Clear notifications store (for testing)
 */
export function clearNotifications(): void {
  notificationsStore = []
}
