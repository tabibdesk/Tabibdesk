import { describe, it, expect } from "vitest"
import {
  canAccessReports,
  canAccessSettings,
  canCreateNew,
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
})
