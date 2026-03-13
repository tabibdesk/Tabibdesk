/**
 * Lead Auto-Close Settings Types
 * Configurable rules for auto-closing leads with no booking.
 * A daily job should apply the auto-close rule.
 * Webhooks/events for patient replies should trigger reopen when reopenOnPatientReply is true.
 */

export interface LeadAutoCloseSettings {
  enabled: boolean
  daysUntilStale: number
  reopenOnPatientReply: boolean
}
