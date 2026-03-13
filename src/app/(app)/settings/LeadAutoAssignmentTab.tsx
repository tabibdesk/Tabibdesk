"use client"

import { useState } from "react"
import { Button } from "@/components/Button"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { AutoAssignmentToggleCard } from "@/features/lead-routing/components/AutoAssignmentToggleCard"
import { DefaultAssignmentCard } from "@/features/lead-routing/components/DefaultAssignmentCard"
import { ExistingPatientRoutingCard } from "@/features/lead-routing/components/ExistingPatientRoutingCard"
import { LeadAutoCloseCard } from "@/features/lead-routing/components/LeadAutoCloseCard"
import { RoutingRulesList } from "@/features/lead-routing/components/RoutingRulesList"
import { RoutingRuleEditorDrawer } from "@/features/lead-routing/components/RoutingRuleEditorDrawer"
import type { LeadRoutingRule } from "@/features/lead-routing/leadRouting.types"
import type { LeadRoutingSettings } from "@/features/lead-routing/leadRouting.types"
import type { LeadRoutingUser } from "@/features/lead-routing/useLeadRoutingSettings"
import type { LeadAutoCloseSettings } from "@/features/lead-routing/leadAutoClose.types"

interface LeadAutoAssignmentTabProps {
  settings: LeadRoutingSettings
  updateSettings: (updates: Partial<LeadRoutingSettings>) => void
  users: LeadRoutingUser[]
  leadAutoCloseSettings: LeadAutoCloseSettings
  updateLeadAutoClose: (updates: Partial<LeadAutoCloseSettings>) => void
  onSave?: () => void | Promise<void>
  addRule: (rule: Omit<LeadRoutingRule, "id" | "priority">) => void
  updateRule: (ruleId: string, updates: Partial<LeadRoutingRule>) => void
  deleteRule: (ruleId: string) => void
  duplicateRule: (ruleId: string) => void
  reorderRules: (fromIndex: number, toIndex: number) => void
}

export function LeadAutoAssignmentTab({
  settings,
  updateSettings,
  users,
  leadAutoCloseSettings,
  updateLeadAutoClose,
  onSave,
  addRule,
  updateRule,
  deleteRule,
  duplicateRule,
  reorderRules,
}: LeadAutoAssignmentTabProps) {

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

  const t = useAppTranslations()
  const showAutoAssignSettings = settings.autoAssignmentEnabled && settings.assignmentMode === "auto_rules"

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
      {showAutoAssignSettings && (
        <>
          <DefaultAssignmentCard settings={settings} users={users} onUpdate={updateSettings} />
          <ExistingPatientRoutingCard settings={settings} users={users} onUpdate={updateSettings} />
        </>
      )}

      {showAutoAssignSettings && (
        <>
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
        </>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {t.settings.leadAutoClose}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          {t.settings.leadAutoCloseDesc}
        </p>
      </div>
      <LeadAutoCloseCard
        settings={leadAutoCloseSettings}
        onUpdate={updateLeadAutoClose}
        hideHeader
      />

      {/* Save Button */}
      <div className="flex justify-end pt-4 pb-8">
        <Button
          variant="primary"
          onClick={() => onSave?.()}
          className="w-full sm:w-auto"
        >
          {t.settings.saveChanges}
        </Button>
      </div>
    </div>
  )
}
