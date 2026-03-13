"use client"

import { useState, useCallback } from "react"
import type { LeadRoutingSettings, LeadRoutingRule } from "./leadRouting.types"
import type { LeadAutoCloseSettings } from "./leadAutoClose.types"

export interface LeadRoutingUser {
  id: string
  fullName: string
}

function createDefaultSettings(firstUserId: string): LeadRoutingSettings {
  return {
    autoAssignmentEnabled: true,
    assignmentMode: "auto_rules",
    defaultAssignmentType: "user",
    defaultAssignmentTarget: firstUserId,
    preferPreviousOwnerForExistingPatients: true,
    existingPatientFallbackUserId: firstUserId || null,
    rules: [],
  }
}

const DEFAULT_AUTO_CLOSE: LeadAutoCloseSettings = {
  enabled: false,
  daysUntilStale: 14,
  reopenOnPatientReply: true,
}

export function useLeadRoutingSettings(users: LeadRoutingUser[]) {
  const firstUserId = users[0]?.id ?? ""
  const [settings, setSettings] = useState<LeadRoutingSettings>(() =>
    createDefaultSettings(firstUserId)
  )
  const [leadAutoCloseSettings, setLeadAutoCloseSettings] =
    useState<LeadAutoCloseSettings>(DEFAULT_AUTO_CLOSE)

  const updateSettings = useCallback((updates: Partial<LeadRoutingSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  const updateLeadAutoClose = useCallback((updates: Partial<LeadAutoCloseSettings>) => {
    setLeadAutoCloseSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  const addRule = useCallback((rule: Omit<LeadRoutingRule, "id" | "priority">) => {
    const id = `rule-${Date.now()}`
    const priority = Math.max(0, ...settings.rules.map((r) => r.priority)) + 1
    setSettings((prev) => ({
      ...prev,
      rules: [...prev.rules, { ...rule, id, priority }],
    }))
  }, [settings.rules])

  const updateRule = useCallback((ruleId: string, updates: Partial<LeadRoutingRule>) => {
    setSettings((prev) => ({
      ...prev,
      rules: prev.rules.map((r) =>
        r.id === ruleId ? { ...r, ...updates } : r,
      ),
    }))
  }, [])

  const deleteRule = useCallback((ruleId: string) => {
    setSettings((prev) => ({
      ...prev,
      rules: prev.rules.filter((r) => r.id !== ruleId),
    }))
  }, [])

  const duplicateRule = useCallback((ruleId: string) => {
    const rule = settings.rules.find((r) => r.id === ruleId)
    if (!rule) return
    const id = `rule-${Date.now()}`
    const priority = Math.max(0, ...settings.rules.map((r) => r.priority)) + 1
    setSettings((prev) => ({
      ...prev,
      rules: [
        ...prev.rules,
        {
          ...rule,
          id,
          name: `${rule.name} (copy)`,
          priority,
        },
      ],
    }))
  }, [settings.rules])

  const reorderRules = useCallback((fromIndex: number, toIndex: number) => {
    setSettings((prev) => {
      const rules = [...prev.rules]
      const [removed] = rules.splice(fromIndex, 1)
      rules.splice(toIndex, 0, removed)
      return {
        ...prev,
        rules: rules.map((r, i) => ({ ...r, priority: i })),
      }
    })
  }, [])

  return {
    settings,
    setSettings,
    updateSettings,
    leadAutoCloseSettings,
    updateLeadAutoClose,
    addRule,
    updateRule,
    deleteRule,
    duplicateRule,
    reorderRules,
  }
}
