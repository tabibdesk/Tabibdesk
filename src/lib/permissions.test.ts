import { describe, it, expect } from "vitest"
import {
  canAccessReports,
  canAccessSettings,
  canCreateNew,
  canRefundAccounting,
} from "./permissions"

describe("permissions", () => {
  describe("canAccessReports", () => {
    it("returns true", () => {
      expect(canAccessReports()).toBe(true)
    })
  })

  describe("canAccessSettings", () => {
    it("returns true", () => {
      expect(canAccessSettings()).toBe(true)
    })
  })

  describe("canCreateNew", () => {
    it("returns true", () => {
      expect(canCreateNew()).toBe(true)
    })
  })

  describe("canRefundAccounting", () => {
    it("returns false when user is null or undefined", () => {
      expect(canRefundAccounting(null)).toBe(false)
      expect(canRefundAccounting(undefined)).toBe(false)
    })

    it("returns true when user has accounting.refund permission", () => {
      expect(
        canRefundAccounting({ role: "doctor", permissions: ["accounting.refund"] })
      ).toBe(true)
    })

    it("returns true for manager role", () => {
      expect(canRefundAccounting({ role: "manager" })).toBe(true)
    })

    it("returns true for assistant role", () => {
      expect(canRefundAccounting({ role: "assistant" })).toBe(true)
    })

    it("returns false for doctor role when no accounting.refund permission", () => {
      expect(canRefundAccounting({ role: "doctor" })).toBe(false)
    })
  })
})
