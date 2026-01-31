import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  getTimeRangeDates,
  formatRecordCount,
  calculatePercentageChange,
} from "./insights.utils"

describe("insights.utils", () => {
  const fixedDate = new Date("2024-06-15T12:00:00Z")

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("getTimeRangeDates", () => {
    it("returns start and end for today", () => {
      const { start, end } = getTimeRangeDates("today")
      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)
      expect(end.getHours()).toBe(23)
      expect(end.getMinutes()).toBe(59)
      expect(start.getTime()).toBeLessThanOrEqual(end.getTime())
    })

    it("returns range for 7d", () => {
      const { start, end } = getTimeRangeDates("7d")
      expect(start.getTime()).toBeLessThan(end.getTime())
      const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      expect(daysDiff).toBeGreaterThanOrEqual(7)
      expect(daysDiff).toBeLessThanOrEqual(8)
    })

    it("returns range for 30d", () => {
      const { start, end } = getTimeRangeDates("30d")
      expect(start.getTime()).toBeLessThan(end.getTime())
      const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      expect(daysDiff).toBeGreaterThanOrEqual(30)
      expect(daysDiff).toBeLessThanOrEqual(31)
    })

    it("returns range for custom", () => {
      const { start, end } = getTimeRangeDates("custom")
      expect(start.getTime()).toBeLessThan(end.getTime())
    })
  })

  describe("formatRecordCount", () => {
    it("returns 0 records for 0", () => {
      expect(formatRecordCount(0)).toBe("0 records")
    })

    it("returns 1 record for 1", () => {
      expect(formatRecordCount(1)).toBe("1 record")
    })

    it("returns N records for n > 1", () => {
      expect(formatRecordCount(5)).toBe("5 records")
      expect(formatRecordCount(100)).toBe("100 records")
    })
  })

  describe("calculatePercentageChange", () => {
    it("returns +100% positive when previous is 0 and current > 0", () => {
      const result = calculatePercentageChange(10, 0)
      expect(result).toEqual({ value: "+100%", type: "positive" })
    })

    it("returns 0% neutral when previous is 0 and current is 0", () => {
      const result = calculatePercentageChange(0, 0)
      expect(result).toEqual({ value: "0%", type: "neutral" })
    })

    it("returns positive change", () => {
      const result = calculatePercentageChange(150, 100)
      expect(result.value).toBe("+50.0%")
      expect(result.type).toBe("positive")
    })

    it("returns negative change", () => {
      const result = calculatePercentageChange(50, 100)
      expect(result.value).toBe("-50.0%")
      expect(result.type).toBe("negative")
    })

    it("returns neutral when change is zero", () => {
      const result = calculatePercentageChange(100, 100)
      expect(result.value).toBe("+0.0%")
      expect(result.type).toBe("neutral")
    })
  })
})
