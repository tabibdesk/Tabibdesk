import { describe, it, expect } from "vitest"
import { suggestCandidates } from "./slotMatching"
import type { Slot, WaitlistEntry } from "../types"

const createSlot = (overrides: Partial<Slot> = {}): Slot => ({
  id: "slot-1",
  clinicId: "c1",
  doctorId: "d1",
  startAt: "2024-06-15T10:00:00.000Z",
  endAt: "2024-06-15T10:30:00.000Z",
  state: "empty",
  ...overrides,
})

const createEntry = (overrides: Partial<WaitlistEntry> = {}): WaitlistEntry => ({
  id: "e1",
  clinicId: "c1",
  patientId: "p1",
  patientName: "Jane",
  patientPhone: "+201234567890",
  status: "active",
  priority: "normal",
  createdAt: "2024-06-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z",
  ...overrides,
})

describe("slotMatching", () => {
  describe("suggestCandidates", () => {
    it("filters by same clinic", () => {
      const slot = createSlot({ clinicId: "c1" })
      const entries = [
        createEntry({ id: "e1", clinicId: "c1" }),
        createEntry({ id: "e2", clinicId: "c2" }),
      ]
      const result = suggestCandidates(slot, entries)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("e1")
    })

    it("filters by doctor when slot has doctorId", () => {
      const slot = createSlot({ clinicId: "c1", doctorId: "d1" })
      const entries = [
        createEntry({ id: "e1", clinicId: "c1", requestedDoctorId: "d1" }),
        createEntry({ id: "e2", clinicId: "c1", requestedDoctorId: "d2" }),
      ]
      const result = suggestCandidates(slot, entries)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("e1")
    })

    it("includes entry with no requestedDoctorId when slot has doctorId", () => {
      const slot = createSlot({ clinicId: "c1", doctorId: "d1" })
      const entries = [
        createEntry({ id: "e1", clinicId: "c1" }),
      ]
      const result = suggestCandidates(slot, entries)
      expect(result).toHaveLength(1)
    })

    it("filters by appointment type when slot has appointmentType", () => {
      const slot = createSlot({ clinicId: "c1", appointmentType: "followup" })
      const entries = [
        createEntry({ id: "e1", clinicId: "c1", appointmentType: "followup" }),
        createEntry({ id: "e2", clinicId: "c1", appointmentType: "new" }),
      ]
      const result = suggestCandidates(slot, entries)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("e1")
    })

    it("filters by morning time window", () => {
      const slot = createSlot({ startAt: "2024-06-15T08:00:00.000Z" }) // 8 AM
      const entries = [
        createEntry({ id: "e1", clinicId: "c1", preferredTimeWindow: "morning" }),
        createEntry({ id: "e2", clinicId: "c1", preferredTimeWindow: "afternoon" }),
      ]
      const result = suggestCandidates(slot, entries)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("e1")
    })

    it("sorts by priority desc then createdAt asc", () => {
      const slot = createSlot()
      const entries = [
        createEntry({ id: "e1", clinicId: "c1", priority: "low", createdAt: "2024-06-01T00:00:00Z" }),
        createEntry({ id: "e2", clinicId: "c1", priority: "high", createdAt: "2024-06-02T00:00:00Z" }),
        createEntry({ id: "e3", clinicId: "c1", priority: "high", createdAt: "2024-06-01T00:00:00Z" }),
      ]
      const result = suggestCandidates(slot, entries)
      expect(result).toHaveLength(2)
      expect(result[0].priority).toBe("high")
      expect(result[0].id).toBe("e3")
      expect(result[1].id).toBe("e2")
    })

    it("returns at most 2 candidates", () => {
      const slot = createSlot()
      const entries = [
        createEntry({ id: "e1", clinicId: "c1", priority: "high" }),
        createEntry({ id: "e2", clinicId: "c1", priority: "high" }),
        createEntry({ id: "e3", clinicId: "c1", priority: "high" }),
      ]
      const result = suggestCandidates(slot, entries)
      expect(result).toHaveLength(2)
    })

    it("includes entries with preferredTimeWindow any", () => {
      const slot = createSlot({ startAt: "2024-06-15T20:00:00.000Z" })
      const entries = [
        createEntry({ id: "e1", clinicId: "c1", preferredTimeWindow: "any" }),
      ]
      const result = suggestCandidates(slot, entries)
      expect(result).toHaveLength(1)
    })
  })
})
