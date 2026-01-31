import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  getStatusBadgeVariant,
  getStatusLabel,
  getTypeLabel,
  getSourceLabel,
  getSourceBadgeVariant,
  getPriorityBadgeVariant,
  getPriorityLabel,
  formatTaskDate,
  isOverdue,
} from "./tasks.utils"

describe("tasks.utils", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("getStatusBadgeVariant", () => {
    it("returns correct variant for each status", () => {
      expect(getStatusBadgeVariant("pending")).toBe("default")
      expect(getStatusBadgeVariant("done")).toBe("success")
      expect(getStatusBadgeVariant("cancelled")).toBe("error")
    })

    it("returns neutral for unknown status", () => {
      expect(getStatusBadgeVariant("unknown" as any)).toBe("neutral")
    })
  })

  describe("getStatusLabel", () => {
    it("returns correct label for each status", () => {
      expect(getStatusLabel("pending")).toBe("Pending")
      expect(getStatusLabel("done")).toBe("Done")
      expect(getStatusLabel("cancelled")).toBe("Cancelled")
    })

    it("returns status for unknown status", () => {
      expect(getStatusLabel("unknown" as any)).toBe("unknown")
    })
  })

  describe("getTypeLabel", () => {
    it("returns correct label for each type", () => {
      expect(getTypeLabel("follow_up")).toBe("Follow Up")
      expect(getTypeLabel("appointment")).toBe("Appointment")
      expect(getTypeLabel("labs")).toBe("Labs")
      expect(getTypeLabel("scan")).toBe("Scan")
      expect(getTypeLabel("billing")).toBe("Billing")
      expect(getTypeLabel("other")).toBe("Other")
    })

    it("returns type for unknown type", () => {
      expect(getTypeLabel("unknown" as any)).toBe("unknown")
    })
  })

  describe("getSourceLabel", () => {
    it("returns correct label for each source", () => {
      expect(getSourceLabel("alert")).toBe("Automated")
      expect(getSourceLabel("manual")).toBe("Manual")
      expect(getSourceLabel("ai")).toBe("AI")
    })

    it("returns source for unknown source", () => {
      expect(getSourceLabel("unknown" as any)).toBe("unknown")
    })
  })

  describe("getSourceBadgeVariant", () => {
    it("returns correct variant for each source", () => {
      expect(getSourceBadgeVariant("alert")).toBe("warning")
      expect(getSourceBadgeVariant("ai")).toBe("success")
      expect(getSourceBadgeVariant("manual")).toBe("neutral")
    })

    it("returns neutral for unknown source", () => {
      expect(getSourceBadgeVariant("unknown" as any)).toBe("neutral")
    })
  })

  describe("getPriorityBadgeVariant", () => {
    it("returns correct variant for each priority", () => {
      expect(getPriorityBadgeVariant("low")).toBe("neutral")
      expect(getPriorityBadgeVariant("normal")).toBe("default")
      expect(getPriorityBadgeVariant("high")).toBe("error")
    })

    it("returns neutral for unknown priority", () => {
      expect(getPriorityBadgeVariant("unknown" as any)).toBe("neutral")
    })
  })

  describe("getPriorityLabel", () => {
    it("returns correct label for each priority", () => {
      expect(getPriorityLabel("low")).toBe("Low")
      expect(getPriorityLabel("normal")).toBe("Normal")
      expect(getPriorityLabel("high")).toBe("High")
    })

    it("returns priority for unknown priority", () => {
      expect(getPriorityLabel("unknown" as any)).toBe("unknown")
    })
  })

  describe("formatTaskDate", () => {
    it("returns em dash when dateString is undefined", () => {
      expect(formatTaskDate(undefined)).toBe("—")
    })

    it("returns em dash when dateString is empty", () => {
      expect(formatTaskDate("")).toBe("—")
    })

    it("returns Today for today's date", () => {
      expect(formatTaskDate("2024-06-15")).toBe("Today")
    })

    it("returns Tomorrow for tomorrow's date", () => {
      expect(formatTaskDate("2024-06-16")).toBe("Tomorrow")
    })

    it("returns Yesterday for yesterday's date", () => {
      expect(formatTaskDate("2024-06-14")).toBe("Yesterday")
    })

    it("returns formatted date for other dates", () => {
      const result = formatTaskDate("2023-03-15")
      expect(result).toMatch(/Mar.*15.*2023|March 15, 2023/)
    })
  })

  describe("isOverdue", () => {
    it("returns false when dueDate is undefined", () => {
      expect(isOverdue(undefined)).toBe(false)
    })

    it("returns true when due date is in the past", () => {
      expect(isOverdue("2024-06-14")).toBe(true)
    })

    it("returns false when due date is in the future", () => {
      expect(isOverdue("2024-06-16")).toBe(false)
    })
  })
})
