/**
 * Lead Auto-Assignment Types
 * Type system for routing rules, settings, and test preview
 */

export type LeadRoutingConditionType =
  | "campaign"
  | "source"
  | "treatment_interest"
  | "existing_patient"
  | "location"

export type LeadRoutingAssignmentType = "user" | "round_robin"

export interface LeadRoutingRule {
  id: string
  name: string
  isEnabled: boolean
  conditionType: LeadRoutingConditionType
  conditionValue: string
  assignmentType: LeadRoutingAssignmentType
  assignmentTarget: string | string[]
  priority: number
}

export interface LeadRoutingSettings {
  autoAssignmentEnabled: boolean
  assignmentMode: "manual" | "auto_rules"
  defaultAssignmentType: LeadRoutingAssignmentType
  defaultAssignmentTarget: string | string[]
  preferPreviousOwnerForExistingPatients: boolean
  existingPatientFallbackUserId: string | null
  rules: LeadRoutingRule[]
}
