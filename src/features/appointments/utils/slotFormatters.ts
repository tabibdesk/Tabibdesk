/**
 * Slot formatting utilities
 * Pure functions for formatting slot dates and times
 */

import type { Slot } from "../types"

export function formatSlotDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatSlotTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatSlotTime24(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function formatSlotDateTime(dateString: string): string {
  return `${formatSlotDate(dateString)} • ${formatSlotTime(dateString)}`
}

export function getSlotDuration(startAt: string, endAt: string): number {
  return Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / (1000 * 60))
}

/**
 * Calculate buffer time between two slots in minutes
 */
export function calculateBufferTime(slot1: Slot, slot2: Slot): number {
  const end1 = new Date(slot1.endAt).getTime()
  const start2 = new Date(slot2.startAt).getTime()
  const bufferMs = start2 - end1
  return Math.max(0, Math.round(bufferMs / 60000)) // Convert to minutes
}
