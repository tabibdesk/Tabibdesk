/**
 * Utility functions for slot matching and candidate ranking
 */

import type { WaitingListEntry } from "./waitlist.types"

export interface MatchScore {
  total: number
  doctorMatch: number
  typeMatch: number
  timeWindowMatch: number
  dayMatch: number
  dateRangeMatch: number
  priorityBonus: number
}

/**
 * Get match badge label based on score
 */
export function getMatchBadgeLabel(score: number): "Great Match" | "Good Match" | "Match" {
  if (score >= 15) {
    return "Great Match"
  } else if (score >= 10) {
    return "Good Match"
  }
  return "Match"
}

/**
 * Get match badge variant based on score
 */
export function getMatchBadgeVariant(score: number): "success" | "default" | "neutral" {
  if (score >= 15) {
    return "success"
  } else if (score >= 10) {
    return "default"
  }
  return "neutral"
}

/**
 * Get preference hints for a candidate
 */
export function getPreferenceHints(entry: WaitingListEntry): string[] {
  const hints: string[] = []

  if (entry.requestedDoctorId) {
    hints.push("Doctor preference")
  }

  if (entry.preferredTimeWindow && entry.preferredTimeWindow !== "any") {
    hints.push(`${entry.preferredTimeWindow} preferred`)
  }

  if (entry.preferredDays && entry.preferredDays.length > 0) {
    hints.push(`${entry.preferredDays.length} day(s) preferred`)
  }

  if (entry.priority === "high") {
    hints.push("High priority")
  }

  return hints
}

/**
 * Format time window for display
 */
export function formatTimeWindow(window: "any" | "morning" | "afternoon" | "evening"): string {
  switch (window) {
    case "morning":
      return "Morning (6am-12pm)"
    case "afternoon":
      return "Afternoon (12pm-6pm)"
    case "evening":
      return "Evening (6pm-9pm)"
    default:
      return "Any time"
  }
}

/**
 * Format day name for display
 */
export function formatDayName(day: string): string {
  const dayMap: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  }
  return dayMap[day.toLowerCase()] || day
}
