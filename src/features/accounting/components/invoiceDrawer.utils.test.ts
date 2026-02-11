import { describe, it, expect, vi } from "vitest"
import {
  formatAptLabel,
  getPatientName,
  getDoctorName,
  getAppointmentData,
} from "./invoiceDrawer.utils"

vi.mock("@/data/mock/mock-data", () => ({
  mockData: {
    patients: [
      { id: "p1", first_name: "Jane", last_name: "Doe" },
      { id: "p2", first_name: "John", last_name: "Smith" },
    ],
    appointments: [
      {
        id: "apt-1",
        scheduled_at: "2024-06-15T10:00:00.000Z",
      },
    ],
  },
}))

vi.mock("@/lib/constants", () => ({
  mockDoctor: { full_name: "Dr. Smith" },
}))

describe("invoiceDrawer.utils", () => {
  describe("formatAptLabel", () => {
    it("formats appointment with date, time and type", () => {
      const apt = {
        id: "apt-1",
        patient_id: "p1",
        scheduled_at: "2024-06-15T10:00:00.000Z",
        type: "checkup",
        status: "scheduled",
        doctor_id: "d1",
        clinic_id: "c1",
      }
      const result = formatAptLabel(apt)
      expect(result).toMatch(/Jun.*15|June 15/)
      expect(result).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/)
      expect(result).toContain("•")
      expect(result).toContain("checkup")
    })
  })

  describe("getPatientName", () => {
    it("returns patient name when found", () => {
      expect(getPatientName("p1")).toBe("Jane Doe")
      expect(getPatientName("p2")).toBe("John Smith")
    })

    it("returns Unknown Patient when not found", () => {
      expect(getPatientName("unknown-id")).toBe("Unknown Patient")
    })
  })

  describe("getDoctorName", () => {
    it("returns doctor name from mockDoctor", () => {
      expect(getDoctorName("d1")).toBe("Dr. Smith")
    })
  })

  describe("getAppointmentData", () => {
    it("returns date and time when appointment found", () => {
      const result = getAppointmentData("apt-1")
      expect(result).not.toBeNull()
      expect(result!.date).toMatch(/Jun.*15.*2024|June 15, 2024/)
      expect(result!.time).toMatch(/\d{1,2}:\d{2}\s*(AM|PM)/)
    })

    it("returns null when appointment not found", () => {
      expect(getAppointmentData("unknown-apt")).toBeNull()
    })
  })
})
