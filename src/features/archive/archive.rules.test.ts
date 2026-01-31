import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { isAppointmentArchived, isTaskArchived } from "./archive.rules"
import type { AppointmentListItem } from "@/features/appointments/appointments.types"
import type { TaskListItem } from "@/features/tasks/tasks.types"

const createAppointment = (overrides: Partial<AppointmentListItem> = {}): AppointmentListItem => ({
  id: "apt-1",
  patient_id: "p1",
  patient_name: "Jane",
  patient_phone: "+201234567890",
  appointment_date: "2024-06-15",
  appointment_time: "10:00",
  duration_minutes: 30,
  status: "scheduled",
  type: "checkup",
  scheduled_at: "2024-06-15T10:00:00Z",
  notes: null,
  created_at: "2024-06-01T00:00:00Z",
  ...overrides,
})

const createTask = (overrides: Partial<TaskListItem> = {}): TaskListItem =>
  ({
    id: "t1",
    title: "Follow up",
    type: "follow_up",
    status: "pending",
    priority: "normal",
    createdAt: "2024-06-01T00:00:00Z",
    createdByUserId: "u1",
    clinicId: "c1",
    source: "manual",
    ...overrides,
  }) as TaskListItem

describe("archive.rules", () => {
  const fixedDate = new Date("2024-06-15T12:00:00Z")

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("isAppointmentArchived", () => {
    it("returns true when status is completed", () => {
      expect(isAppointmentArchived(createAppointment({ status: "completed" }))).toBe(true)
    })

    it("returns true when status is cancelled", () => {
      expect(isAppointmentArchived(createAppointment({ status: "cancelled" }))).toBe(true)
    })

    it("returns true when status is no_show", () => {
      expect(isAppointmentArchived(createAppointment({ status: "no_show" }))).toBe(true)
    })

    it("returns true when appointment_date is in the past", () => {
      expect(
        isAppointmentArchived(createAppointment({ status: "scheduled", appointment_date: "2024-06-14" }))
      ).toBe(true)
    })

    it("returns false when status is scheduled and date is today", () => {
      expect(
        isAppointmentArchived(createAppointment({ status: "scheduled", appointment_date: "2024-06-15" }))
      ).toBe(false)
    })

    it("returns false when status is scheduled and date is in the future", () => {
      expect(
        isAppointmentArchived(createAppointment({ status: "scheduled", appointment_date: "2024-06-16" }))
      ).toBe(false)
    })
  })

  describe("isTaskArchived", () => {
    it("returns true when status is done", () => {
      expect(isTaskArchived(createTask({ status: "done" }))).toBe(true)
    })

    it("returns true when status is cancelled", () => {
      expect(isTaskArchived(createTask({ status: "cancelled" }))).toBe(true)
    })

    it("returns true when ignored_at is set", () => {
      const task = createTask({ status: "pending" }) as TaskListItem & { ignored_at?: string }
      task.ignored_at = "2024-06-01T00:00:00Z"
      expect(isTaskArchived(task)).toBe(true)
    })

    it("returns false when status is pending and no ignored_at", () => {
      expect(isTaskArchived(createTask({ status: "pending" }))).toBe(false)
    })
  })
})
