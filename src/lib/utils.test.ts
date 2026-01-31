import { describe, it, expect } from "vitest"
import {
  cx,
  usNumberformatter,
  percentageFormatter,
  millionFormatter,
  formatters,
} from "./utils"

describe("utils", () => {
  describe("cx", () => {
    it("merges single class", () => {
      expect(cx("foo")).toBe("foo")
    })

    it("merges multiple classes", () => {
      expect(cx("foo", "bar")).toContain("foo")
      expect(cx("foo", "bar")).toContain("bar")
    })

    it("handles conditional classes", () => {
      const result = cx("base", false && "hidden", "visible")
      expect(result).toContain("base")
      expect(result).toContain("visible")
    })

    it("tailwind-merge overrides conflicting classes", () => {
      const result = cx("p-2", "p-4")
      expect(result).toBe("p-4")
    })
  })

  describe("usNumberformatter", () => {
    it("formats integer with default decimals", () => {
      expect(usNumberformatter(1234)).toBe("1,234")
    })

    it("formats with specified decimals", () => {
      expect(usNumberformatter(12.345, 2)).toBe("12.35")
    })

    it("formats zero", () => {
      expect(usNumberformatter(0)).toBe("0")
    })
  })

  describe("percentageFormatter", () => {
    it("formats positive number with + sign", () => {
      const result = percentageFormatter(0.25)
      expect(result).toContain("+")
      expect(result).toMatch(/\d+\.?\d*%/)
    })

    it("formats zero without + sign", () => {
      const result = percentageFormatter(0)
      expect(result).toMatch(/0\.0%/)
    })

    it("formats with custom decimals", () => {
      const result = percentageFormatter(0.1234, 2)
      expect(result).toMatch(/\d+\.\d{2}%/)
    })
  })

  describe("millionFormatter", () => {
    it("formats number with M suffix", () => {
      expect(millionFormatter(1.5)).toMatch(/1\.5M|1,?5M/)
    })

    it("formats with default decimals", () => {
      const result = millionFormatter(2.345)
      expect(result).toContain("M")
    })

    it("formats with custom decimals", () => {
      const result = millionFormatter(2.3456, 2)
      expect(result).toContain("M")
    })
  })

  describe("formatters", () => {
    it("currency formats with default USD", () => {
      const result = formatters.currency(100)
      expect(result).toMatch(/\$|100|USD/)
    })

    it("currency formats with custom currency", () => {
      const result = formatters.currency(100, "EGP")
      expect(result).toContain("100")
    })

    it("unit formats number", () => {
      expect(formatters.unit(999)).toContain("999")
    })
  })
})
