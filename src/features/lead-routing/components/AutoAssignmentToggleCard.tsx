"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Label } from "@/components/Label"
import { Switch } from "@/components/Switch"
import { useAppTranslations } from "@/lib/useAppTranslations"
import type { LeadRoutingSettings } from "../leadRouting.types"

interface AutoAssignmentToggleCardProps {
  settings: LeadRoutingSettings
  onUpdate: (updates: Partial<LeadRoutingSettings>) => void
}

export function AutoAssignmentToggleCard({ settings, onUpdate }: AutoAssignmentToggleCardProps) {
  const t = useAppTranslations()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{t.settings.leadAutoAssignment}</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          {t.settings.leadAutoAssignmentDesc}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <Label htmlFor="enable-auto" className="text-sm font-medium">
              {t.settings.enableAutoAssignment}
            </Label>
          </div>
          <Switch
            id="enable-auto"
            checked={settings.autoAssignmentEnabled}
            onCheckedChange={(checked) => onUpdate({ autoAssignmentEnabled: checked })}
          />
        </div>

        {!settings.autoAssignmentEnabled && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t.settings.leadsRemainUnassigned}
          </p>
        )}

        {settings.autoAssignmentEnabled && (
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Label className="text-xs text-gray-600 dark:text-gray-400">
              {t.settings.defaultAssignment}
            </Label>
            <div className="flex flex-wrap gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="assignment-mode"
                  checked={settings.assignmentMode === "manual"}
                  onChange={() => onUpdate({ assignmentMode: "manual" })}
                  className="rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                {t.settings.manualAssignment}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="assignment-mode"
                  checked={settings.assignmentMode === "auto_rules"}
                  onChange={() => onUpdate({ assignmentMode: "auto_rules" })}
                  className="rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                {t.settings.autoAssignWithRules}
              </label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
