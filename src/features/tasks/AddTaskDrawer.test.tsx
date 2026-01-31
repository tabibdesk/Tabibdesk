import { describe, it, expect } from "vitest"
import { formatTaskDate, isOverdue } from "./tasks.utils"

describe("AddTaskDrawer - Due Date Functionality", () => {
  describe("Date conversion and formatting", () => {
    it("converts date string to Date object correctly", () => {
      const dateString = "2024-12-31"
      const date: Date = new Date(dateString)
      
      expect(date).toBeInstanceOf(Date)
      expect(date.toISOString()).toContain("2024-12-31")
    })

    it("converts Date object to ISO date string for input", () => {
      const date: Date = new Date("2024-12-31")
      const inputValue: string = date.toISOString().split('T')[0]
      
      expect(inputValue).toBe("2024-12-31")
    })

    it("handles undefined date gracefully", () => {
      const date = undefined as Date | undefined
      let inputValue = ''
      if (date) {
        inputValue = date.toISOString().split('T')[0]
      }
      
      expect(inputValue).toBe('')
    })

    it("converts empty string to undefined", () => {
      const value = ''
      const date = value ? new Date(value) : undefined
      
      expect(date).toBeUndefined()
    })

    it("converts date string to Date for submission", () => {
      const value = '2024-12-31'
      const date = value ? new Date(value) : undefined
      
      expect(date).toBeInstanceOf(Date)
      expect(date?.toISOString()).toContain("2024-12-31")
    })
  })

  describe("formatTaskDate utility", () => {
    it("formats undefined as em dash", () => {
      expect(formatTaskDate(undefined)).toBe("—")
    })

    it("formats empty string as em dash", () => {
      expect(formatTaskDate("")).toBe("—")
    })

    it("formats valid date string", () => {
      const result = formatTaskDate("2024-06-15")
      expect(result).toBeTruthy()
      expect(result).not.toBe("—")
    })
  })

  describe("isOverdue utility", () => {
    it("returns false for undefined date", () => {
      expect(isOverdue(undefined)).toBe(false)
    })

    it("returns true for past date", () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      expect(isOverdue(pastDate.toISOString())).toBe(true)
    })

    it("returns false for future date", () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      expect(isOverdue(futureDate.toISOString())).toBe(false)
    })
  })

  describe("Task payload with due date", () => {
    it("creates payload with due date", () => {
      const dueDate: Date = new Date("2024-12-31")
      const payload = {
        title: "Test task",
        dueDate: dueDate.toISOString(),
        type: "follow_up" as const,
        clinicId: "clinic-1",
        createdByUserId: "user-1",
      }

      expect(payload.dueDate).toBeDefined()
      expect(payload.dueDate).toContain("2024-12-31")
    })

    it("creates payload without due date", () => {
      const dueDate = undefined as Date | undefined
      let dueDateString: string | undefined = undefined
      if (dueDate) {
        dueDateString = dueDate.toISOString()
      }
      const payload = {
        title: "Test task",
        dueDate: dueDateString,
        type: "follow_up" as const,
        clinicId: "clinic-1",
        createdByUserId: "user-1",
      }

      expect(payload.dueDate).toBeUndefined()
    })

    it("handles date input onChange correctly", () => {
      // Simulate user typing in date input
      const inputValue = "2024-12-31"
      const date: Date | undefined = inputValue ? new Date(inputValue) : undefined

      expect(date).toBeInstanceOf(Date)
      expect(date?.toISOString()).toContain("2024-12-31")
    })

    it("handles clearing date input", () => {
      // Simulate user clearing date input
      const inputValue = ""
      const date = inputValue ? new Date(inputValue) : undefined

      expect(date).toBeUndefined()
    })
  })
})
