"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Label } from "@/components/Label"
import { Switch } from "@/components/Switch"
import { Select } from "@/components/Select"
import { useAppTranslations } from "@/lib/useAppTranslations"
import type { LeadRoutingSettings } from "../leadRouting.types"
import type { LeadRoutingUser } from "../useLeadRoutingSettings"

interface ExistingPatientRoutingCardProps {
  settings: LeadRoutingSettings
  users: LeadRoutingUser[]
  onUpdate: (updates: Partial<LeadRoutingSettings>) => void
  disabled?: boolean
}

export function ExistingPatientRoutingCard({
  settings,
  users,
  onUpdate,
  disabled,
}: ExistingPatientRoutingCardProps) {
  const t = useAppTranslations()

  if (!settings.autoAssignmentEnabled || settings.assignmentMode !== "auto_rules") return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{t.settings.existingPatientBehavior}</CardTitle>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {t.settings.existingPatientHelper}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <Label htmlFor="prefer-previous" className="text-sm font-medium">
              {t.settings.preferPreviousOwner}
            </Label>
          </div>
          <Switch
            id="prefer-previous"
            checked={settings.preferPreviousOwnerForExistingPatients}
            onCheckedChange={(checked) =>
              onUpdate({ preferPreviousOwnerForExistingPatients: checked })
            }
            disabled={disabled}
          />
        </div>

        {settings.preferPreviousOwnerForExistingPatients && (
          <div className="space-y-2 ps-4 border-s-2 border-gray-200 dark:border-gray-700">
            <Label htmlFor="existing-fallback-user" className="text-xs text-gray-600 dark:text-gray-400">
              {t.settings.existingPatientFallbackUser}
            </Label>
            <Select
              id="existing-fallback-user"
              value={settings.existingPatientFallbackUserId ?? ""}
              onChange={(e) =>
                onUpdate({
                  existingPatientFallbackUserId: e.target.value || null,
                })
              }
              disabled={disabled}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
