export type PaymentMethod = "cash" | "visa" | "instapay";

/** Alias used by API layer. */
export type PaymentRecord = Payment

export interface Payment {
  id: string
  clinicId: string
  invoiceId: string
  patientId: string
  appointmentId: string
  amount: number
  method: PaymentMethod
  proofFileId?: string
  createdByUserId: string
  createdAt: string
}
