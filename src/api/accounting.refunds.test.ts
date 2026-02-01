import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  getInvoiceRefundSummary,
  listRefundsByInvoice,
  createRefund,
  listRefunds,
  __testOnlyResetRefundsStore,
} from "./accounting.api"

const mockInvoice = {
  id: "inv_test_1",
  clinicId: "clinic-001",
  doctorId: "user-001",
  patientId: "patient-1",
  appointmentId: "apt-1",
  appointmentType: "Consultation",
  amount: 100,
  status: "paid" as const,
  createdAt: "2024-06-15T10:00:00.000Z",
}

const mockPayment = {
  id: "pay_test_1",
  clinicId: "clinic-001",
  invoiceId: "inv_test_1",
  patientId: "patient-1",
  appointmentId: "apt-1",
  amount: 100,
  method: "cash" as const,
  createdByUserId: "user-001",
  createdAt: "2024-06-15T10:30:00.000Z",
}

vi.mock("@/api/invoices.api", () => ({
  getInvoiceById: vi.fn(),
  createInvoiceWithAmount: vi.fn().mockResolvedValue({ id: "inv_due_1" }),
}))

vi.mock("@/api/payments.api", () => ({
  getPaymentByInvoiceId: vi.fn(),
}))

vi.mock("@/data/mock/mock-data", () => ({
  mockData: {
    patients: [{ id: "patient-1", first_name: "Jane", last_name: "Doe" }],
  },
}))

describe("accounting.api refunds", () => {
  beforeEach(async () => {
    __testOnlyResetRefundsStore()
    const { getInvoiceById } = await import("@/api/invoices.api")
    const { getPaymentByInvoiceId } = await import("@/api/payments.api")
    vi.mocked(getInvoiceById).mockResolvedValue(mockInvoice)
    vi.mocked(getPaymentByInvoiceId).mockResolvedValue(mockPayment)
  })

  describe("getInvoiceRefundSummary", () => {
    it("returns null when invoice does not exist", async () => {
      const { getInvoiceById } = await import("@/api/invoices.api")
      vi.mocked(getInvoiceById).mockResolvedValue(null)

      const result = await getInvoiceRefundSummary("inv_nonexistent")

      expect(result).toBeNull()
    })

    it("returns summary with invoiceTotal, invoicePaid, invoiceRefunded, refundable", async () => {
      const result = await getInvoiceRefundSummary("inv_test_1")

      expect(result).not.toBeNull()
      expect(result!.invoiceId).toBe("inv_test_1")
      expect(result!.invoiceTotal).toBe(100)
      expect(result!.invoicePaid).toBe(100)
      expect(result!.invoiceRefunded).toBe(0)
      expect(result!.refundable).toBe(100)
    })

    it("uses lineItems total when present", async () => {
      const { getInvoiceById } = await import("@/api/invoices.api")
      vi.mocked(getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        lineItems: [
          { id: "l1", type: "consultation", label: "Consultation", amount: 80 },
          { id: "l2", type: "procedure", label: "Procedure", amount: 20 },
        ],
      })

      const result = await getInvoiceRefundSummary("inv_test_1")

      expect(result!.invoiceTotal).toBe(100)
    })

    it("returns refundable as 0 when invoice has no payment", async () => {
      const { getPaymentByInvoiceId } = await import("@/api/payments.api")
      vi.mocked(getPaymentByInvoiceId).mockResolvedValue(null)

      const result = await getInvoiceRefundSummary("inv_test_1")

      expect(result!.invoicePaid).toBe(0)
      expect(result!.refundable).toBe(0)
    })
  })

  describe("listRefundsByInvoice", () => {
    it("returns empty array when no refunds for invoice", async () => {
      const result = await listRefundsByInvoice("inv_test_1")

      expect(result).toEqual([])
    })

    it("returns refunds for invoice sorted by createdAt desc", async () => {
      await createRefund({
        clinicId: "clinic-001",
        invoiceId: "inv_test_1",
        amount: 30,
        method: "cash",
        createdByUserId: "user-001",
      })
      await createRefund({
        clinicId: "clinic-001",
        invoiceId: "inv_test_1",
        amount: 20,
        method: "instapay",
        createdByUserId: "user-001",
      })

      const result = await listRefundsByInvoice("inv_test_1")

      expect(result).toHaveLength(2)
      expect(result[0].amount).toBe(20)
      expect(result[1].amount).toBe(30)
    })
  })

  describe("createRefund", () => {
    it("throws when invoice not found", async () => {
      const { getInvoiceById } = await import("@/api/invoices.api")
      vi.mocked(getInvoiceById).mockResolvedValue(null)

      await expect(
        createRefund({
          clinicId: "clinic-001",
          invoiceId: "inv_nonexistent",
          amount: 50,
          method: "cash",
          createdByUserId: "user-001",
        })
      ).rejects.toThrow("Invoice not found")
    })

    it("throws when amount <= 0", async () => {
      await expect(
        createRefund({
          clinicId: "clinic-001",
          invoiceId: "inv_test_1",
          amount: 0,
          method: "cash",
          createdByUserId: "user-001",
        })
      ).rejects.toThrow("Refund amount must be greater than zero")
    })

    it("throws when amount > refundable", async () => {
      await expect(
        createRefund({
          clinicId: "clinic-001",
          invoiceId: "inv_test_1",
          amount: 150,
          method: "cash",
          createdByUserId: "user-001",
        })
      ).rejects.toThrow(/Refund amount cannot exceed refundable amount/)
    })

    it("creates refund and returns it with correct fields", async () => {
      const result = await createRefund({
        clinicId: "clinic-001",
        invoiceId: "inv_test_1",
        amount: 50,
        method: "visa",
        reason: "Patient request",
        createdByUserId: "user-001",
      })

      expect(result.id).toMatch(/^ref_/)
      expect(result.clinicId).toBe("clinic-001")
      expect(result.invoiceId).toBe("inv_test_1")
      expect(result.patientId).toBe("patient-1")
      expect(result.patientName).toBe("Jane Doe")
      expect(result.amount).toBe(50)
      expect(result.method).toBe("visa")
      expect(result.reason).toBe("Patient request")
      expect(result.createdByUserId).toBe("user-001")
      expect(result.createdAt).toBeDefined()
    })

    it("reduces refundable after partial refund", async () => {
      await createRefund({
        clinicId: "clinic-001",
        invoiceId: "inv_test_1",
        amount: 40,
        method: "cash",
        createdByUserId: "user-001",
      })

      const summary = await getInvoiceRefundSummary("inv_test_1")
      expect(summary!.invoiceRefunded).toBe(40)
      expect(summary!.refundable).toBe(60)
    })

    it("second refund up to remaining refundable succeeds", async () => {
      await createRefund({
        clinicId: "clinic-001",
        invoiceId: "inv_test_1",
        amount: 40,
        method: "cash",
        createdByUserId: "user-001",
      })
      const second = await createRefund({
        clinicId: "clinic-001",
        invoiceId: "inv_test_1",
        amount: 60,
        method: "instapay",
        createdByUserId: "user-001",
      })

      expect(second.amount).toBe(60)
      const summary = await getInvoiceRefundSummary("inv_test_1")
      expect(summary!.refundable).toBe(0)
    })
  })

  describe("listRefunds", () => {
    it("returns paginated refunds for clinic", async () => {
      await createRefund({
        clinicId: "clinic-001",
        invoiceId: "inv_test_1",
        amount: 10,
        method: "cash",
        createdByUserId: "user-001",
      })

      const result = await listRefunds({
        clinicId: "clinic-001",
        page: 1,
        pageSize: 10,
      })

      expect(result.refunds).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(10)
      expect(result.hasMore).toBe(false)
    })

    it("filters by dateFrom and dateTo", async () => {
      const created = await createRefund({
        clinicId: "clinic-001",
        invoiceId: "inv_test_1",
        amount: 10,
        method: "cash",
        createdByUserId: "user-001",
      })
      const createdDate = created.createdAt.split("T")[0]

      const inside = await listRefunds({
        clinicId: "clinic-001",
        dateFrom: createdDate,
        dateTo: createdDate,
        page: 1,
        pageSize: 10,
      })
      expect(inside.refunds).toHaveLength(1)

      const before = await listRefunds({
        clinicId: "clinic-001",
        dateTo: "2020-01-01",
        page: 1,
        pageSize: 10,
      })
      expect(before.refunds).toHaveLength(0)
    })
  })
})
