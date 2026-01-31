import { describe, it, expect } from "vitest"
import {
  generateSlotsFromAvailability,
  mergeAppointmentsIntoSlots,
} from "./slotGeneration"
import type { DoctorAvailability, Slot, Appointment } from "../types"

// 2024-06-15 is Saturday
const SATURDAY = new Date("2024-06-15T12:00:00Z")

const createAvailability = (
  overrides: Partial<DoctorAvailability> = {}
): DoctorAvailability => ({
  id: "avail-1",
  doctorId: "d1",
  clinicId: "c1",
  daysOfWeek: ["saturday"],
  startTime: "09:00",
  endTime: "11:00",
  slotDuration: 30,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
})

describe("slotGeneration", () => {
  describe("generateSlotsFromAvailability", () => {
    it("returns empty when day not in daysOfWeek", () => {
      const availability = [createAvailability({ daysOfWeek: ["monday"] })]
      const slots = generateSlotsFromAvailability(availability, SATURDAY)
      expect(slots).toHaveLength(0)
    })

    it("generates slots for matching day", () => {
      const availability = [createAvailability()]
      const slots = generateSlotsFromAvailability(availability, SATURDAY)
      expect(slots.length).toBeGreaterThan(0)
      expect(slots[0].clinicId).toBe("c1")
      expect(slots[0].doctorId).toBe("d1")
      expect(slots[0].state).toBe("empty")
    })

    it("uses slotDuration from availability", () => {
      const availability = [createAvailability({ slotDuration: 30 })]
      const slots = generateSlotsFromAvailability(availability, SATURDAY)
      expect(slots.length).toBeGreaterThanOrEqual(2)
      const first = new Date(slots[0].startAt).getTime()
      const second = new Date(slots[1].startAt).getTime()
      expect(second - first).toBe(30 * 60 * 1000)
    })

    it("uses slotDurationMinutes override when provided", () => {
      const availability = [createAvailability({ slotDuration: 60 })]
      const slots = generateSlotsFromAvailability(
        availability,
        SATURDAY,
        0,
        15
      )
      expect(slots.length).toBeGreaterThan(0)
      if (slots.length >= 2) {
        const first = new Date(slots[0].startAt).getTime()
        const second = new Date(slots[1].startAt).getTime()
        expect(second - first).toBe(15 * 60 * 1000)
      }
    })

    it("skips slots overlapping with break", () => {
      const availability = [
        createAvailability({
          startTime: "09:00",
          endTime: "11:00",
          slotDuration: 30,
          breaks: [{ startTime: "09:30", endTime: "10:00" }],
        }),
      ]
      const slots = generateSlotsFromAvailability(availability, SATURDAY)
      const slotTimes = slots.map((s) => s.startAt)
      expect(slotTimes.some((t) => t.includes("09:30:00"))).toBe(false)
    })

    it("applies buffer between slots", () => {
      const availability = [createAvailability({ slotDuration: 30 })]
      const slots = generateSlotsFromAvailability(
        availability,
        SATURDAY,
        10
      )
      expect(slots.length).toBeGreaterThan(0)
      if (slots.length >= 2) {
        const firstEnd = new Date(slots[0].endAt).getTime()
        const secondStart = new Date(slots[1].startAt).getTime()
        expect(secondStart - firstEnd).toBe(10 * 60 * 1000)
      }
    })

    it("sorts slots by start time", () => {
      const availability = [createAvailability()]
      const slots = generateSlotsFromAvailability(availability, SATURDAY)
      for (let i = 1; i < slots.length; i++) {
        const prev = new Date(slots[i - 1].startAt).getTime()
        const curr = new Date(slots[i].startAt).getTime()
        expect(curr).toBeGreaterThanOrEqual(prev)
      }
    })
  })

  describe("mergeAppointmentsIntoSlots", () => {
    it("returns slots unchanged when no matching appointment", () => {
      const slots: Slot[] = [
        {
          id: "slot-1",
          clinicId: "c1",
          doctorId: "d1",
          startAt: "2024-06-15T09:00:00.000Z",
          endAt: "2024-06-15T09:30:00.000Z",
          state: "empty",
        },
      ]
      const appointments: Appointment[] = []
      const result = mergeAppointmentsIntoSlots(slots, appointments)
      expect(result).toHaveLength(1)
      expect(result[0].state).toBe("empty")
    })

    it("marks slot as booked when appointment matches", () => {
      const slots: Slot[] = [
        {
          id: "slot-1",
          clinicId: "c1",
          doctorId: "d1",
          startAt: "2024-06-15T09:00:00.000Z",
          endAt: "2024-06-15T09:30:00.000Z",
          state: "empty",
        },
      ]
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "p1",
          patientName: "Jane",
          patientPhone: "+201234567890",
          doctorId: "d1",
          clinicId: "c1",
          startAt: "2024-06-15T09:00:00.000Z",
          endAt: "2024-06-15T09:30:00.000Z",
          durationMinutes: 30,
          status: "scheduled",
          type: "checkup",
          createdAt: "2024-06-01T00:00:00Z",
        },
      ]
      const result = mergeAppointmentsIntoSlots(slots, appointments)
      expect(result).toHaveLength(1)
      expect(result[0].state).toBe("booked")
      expect(result[0].appointmentId).toBe("apt-1")
      expect(result[0].patientId).toBe("p1")
      expect(result[0].patientName).toBe("Jane")
    })

    it("marks slot as cancelled when appointment status is cancelled", () => {
      const slots: Slot[] = [
        {
          id: "slot-1",
          clinicId: "c1",
          doctorId: "d1",
          startAt: "2024-06-15T09:00:00.000Z",
          endAt: "2024-06-15T09:30:00.000Z",
          state: "empty",
        },
      ]
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "p1",
          patientName: "Jane",
          patientPhone: "+201234567890",
          doctorId: "d1",
          clinicId: "c1",
          startAt: "2024-06-15T09:00:00.000Z",
          endAt: "2024-06-15T09:30:00.000Z",
          durationMinutes: 30,
          status: "cancelled",
          type: "checkup",
          createdAt: "2024-06-01T00:00:00Z",
        },
      ]
      const result = mergeAppointmentsIntoSlots(slots, appointments)
      expect(result[0].state).toBe("cancelled")
    })
  })
})
