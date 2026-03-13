import { describe, it, expect } from "vitest"
import {
  resolveEffectiveFeatures,
  isFeatureLocked,
  getLockedFeatures,
  getEnabledFeatures,
} from "./featureResolver"
import type { FeatureKey } from "./settings.types"

describe("featureResolver", () => {
  const planAllowed: Record<FeatureKey, boolean> = {
    patients: true,
    appointments: true,
    tasks: true,
    insights: true,
    alerts: true,
    accounting: true,
    campaign: true,
    labs: false,
    medications: true,
    files: true,
    reminders: true,
    ai_summary: false,
    ai_dictation: true,
    ai_lab_extraction: false,
  }

  describe("resolveEffectiveFeatures", () => {
    it("locks features when plan disallows", () => {
      const effective = resolveEffectiveFeatures(planAllowed, {})
      expect(effective.labs).toBe(false)
      expect(effective.ai_summary).toBe(false)
    })

    it("defaults to enabled when plan allows and no override", () => {
      const effective = resolveEffectiveFeatures(planAllowed, {})
      expect(effective.patients).toBe(true)
      expect(effective.appointments).toBe(true)
    })

    it("respects clinic overrides to disable", () => {
      const effective = resolveEffectiveFeatures(planAllowed, {
        tasks: false,
      })
      expect(effective.tasks).toBe(false)
    })

    it("clinic override cannot enable locked feature", () => {
      const effective = resolveEffectiveFeatures(planAllowed, {
        labs: true,
      })
      expect(effective.labs).toBe(false)
    })
  })

  describe("isFeatureLocked", () => {
    it("returns true when plan disallows", () => {
      expect(isFeatureLocked("labs", planAllowed)).toBe(true)
    })

    it("returns false when plan allows", () => {
      expect(isFeatureLocked("patients", planAllowed)).toBe(false)
    })
  })

  describe("getLockedFeatures", () => {
    it("returns list of locked feature keys", () => {
      const locked = getLockedFeatures(planAllowed)
      expect(locked).toContain("labs")
      expect(locked).toContain("ai_summary")
      expect(locked).toContain("ai_lab_extraction")
      expect(locked).not.toContain("patients")
    })
  })

  describe("getEnabledFeatures", () => {
    it("returns list of enabled feature keys", () => {
      const effective = resolveEffectiveFeatures(planAllowed, { tasks: false })
      const enabled = getEnabledFeatures(effective)
      expect(enabled).toContain("patients")
      expect(enabled).not.toContain("tasks")
      expect(enabled).not.toContain("labs")
    })
  })
})
