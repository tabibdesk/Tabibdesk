"use client"

import { useState, useMemo } from "react"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { getLeadRoutingUsers } from "@/features/lead-routing/leadRouting.data"
import { useLeadRoutingSettings } from "@/features/lead-routing/useLeadRoutingSettings"
import { AutoAssignmentToggleCard } from "@/features/lead-routing/components/AutoAssignmentToggleCard"
import { DefaultAssignmentCard } from "@/features/lead-routing/components/DefaultAssignmentCard"
import { ExistingPatientRoutingCard } from "@/features/lead-routing/components/ExistingPatientRoutingCard"
import { LeadAutoCloseCard } from "@/features/lead-routing/components/LeadAutoCloseCard"
import { RoutingRulesList } from "@/features/lead-routing/components/RoutingRulesList"
import { RoutingRuleEditorDrawer } from "@/features/lead-routing/components/RoutingRuleEditorDrawer"
import type { LeadRoutingRule } from "@/features/lead-routing/leadRouting.types"

export function LeadAutoAssignmentTab() {
  const t = useAppTranslations()
  const { currentClinic } = useUserClinic()
  const users = useMemo(
    () => getLeadRoutingUsers(currentClinic ? [currentClinic.id] : []),
    [currentClinic?.id]
  )
  const {
    settings,
    updateSettings,
    leadAutoCloseSettings,
    updateLeadAutoClose,
    addRule,
    updateRule,
    deleteRule,
    duplicateRule,
    reorderRules,
  } = useLeadRoutingSettings(users)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add")
  const [editingRule, setEditingRule] = useState<LeadRoutingRule | null>(null)

  const handleAddRule = () => {
    setDrawerMode("add")
    setEditingRule(null)
    setDrawerOpen(true)
  }

  const handleEditRule = (rule: LeadRoutingRule) => {
    setDrawerMode("edit")
    setEditingRule(rule)
    setDrawerOpen(true)
  }

  const handleSaveRule = (rule: Omit<LeadRoutingRule, "id" | "priority">) => {
    if (drawerMode === "add") {
      addRule(rule)
    } else if (editingRule) {
      updateRule(editingRule.id, rule)
    }
    setDrawerOpen(false)
    setEditingRule(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {t.settings.leadAutoAssignment}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          {t.settings.leadAutoAssignmentDesc}
        </p>
      </div>

      <AutoAssignmentToggleCard settings={settings} onUpdate={updateSettings} />
      <DefaultAssignmentCard settings={settings} users={users} onUpdate={updateSettings} />
      <ExistingPatientRoutingCard settings={settings} users={users} onUpdate={updateSettings} />

      <LeadAutoCloseCard settings={leadAutoCloseSettings} onUpdate={updateLeadAutoClose} />

      <RoutingRulesList
        rules={settings.rules}
        users={users}
        onAddRule={handleAddRule}
        onEditRule={handleEditRule}
        onDuplicateRule={duplicateRule}
        onDeleteRule={deleteRule}
        onReorderRules={reorderRules}
      />

      <RoutingRuleEditorDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        users={users}
        initialRule={editingRule}
        onSave={handleSaveRule}
      />
    </div>
  )
}
