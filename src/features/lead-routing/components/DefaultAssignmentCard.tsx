"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Label } from "@/components/Label"
import { Select } from "@/components/Select"
import { Checkbox } from "@/components/Checkbox"
import { useAppTranslations } from "@/lib/useAppTranslations"
import type {
  LeadRoutingSettings,
  LeadRoutingAssignmentType,
} from "../leadRouting.types"
import type { LeadRoutingUser } from "../useLeadRoutingSettings"

interface DefaultAssignmentCardProps {
  settings: LeadRoutingSettings
  users: LeadRoutingUser[]
  onUpdate: (updates: Partial<LeadRoutingSettings>) => void
  disabled?: boolean
}

export function DefaultAssignmentCard({ settings, users, onUpdate, disabled }: DefaultAssignmentCardProps) {
  const t = useAppTranslations()

  const handleAssignmentTypeChange = (value: LeadRoutingAssignmentType) => {
    const firstId = users[0]?.id ?? ""
    onUpdate({
      defaultAssignmentType: value,
      defaultAssignmentTarget: value === "user" ? firstId : [firstId],
    })
  }

  const currentRoundRobinIds = Array.isArray(settings.defaultAssignmentTarget)
    ? settings.defaultAssignmentTarget
    : settings.defaultAssignmentTarget
      ? [settings.defaultAssignmentTarget]
      : []

  const handleRoundRobinToggle = (userId: string, checked: boolean) => {
    if (checked) {
      onUpdate({ defaultAssignmentTarget: [...currentRoundRobinIds, userId] })
    } else {
      const next = currentRoundRobinIds.filter((id) => id !== userId)
      onUpdate({ defaultAssignmentTarget: next.length > 0 ? next : [users[0]?.id ?? ""] })
    }
  }

  const handleTargetChange = (value: string | string[]) => {
    onUpdate({ defaultAssignmentTarget: value })
  }

  if (!settings.autoAssignmentEnabled) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{t.settings.defaultAssignment}</CardTitle>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {t.settings.whenNoRuleMatches}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="default-type" className="text-xs">
            {t.settings.whenNoRuleMatches}
          </Label>
          <Select
            id="default-type"
            value={settings.defaultAssignmentType}
            onChange={(e) =>
              handleAssignmentTypeChange(e.target.value as LeadRoutingAssignmentType)
            }
            disabled={disabled}
          >
            <option value="user">{t.settings.assignmentUser}</option>
            <option value="round_robin">{t.settings.assignmentRoundRobin}</option>
          </Select>
        </div>

        {settings.defaultAssignmentType === "user" && (
          <div className="space-y-2">
            <Label htmlFor="default-user" className="text-xs">
              {t.settings.assignmentUser}
            </Label>
            <Select
              id="default-user"
              value={
                Array.isArray(settings.defaultAssignmentTarget)
                  ? settings.defaultAssignmentTarget[0]
                  : settings.defaultAssignmentTarget
              }
              onChange={(e) => handleTargetChange(e.target.value)}
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

        {settings.defaultAssignmentType === "round_robin" && (
          <div className="space-y-2">
            <Label className="text-xs">{t.settings.distributionPoolUsers}</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.settings.distributionPoolHelper}
            </p>
            <div className="flex flex-col gap-2 rounded-md border border-gray-200 dark:border-gray-700 p-3 max-h-40 overflow-y-auto">
              {users.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <Checkbox
                    checked={currentRoundRobinIds.includes(u.id)}
                    onCheckedChange={(checked) =>
                      handleRoundRobinToggle(u.id, !!checked)
                    }
                    disabled={disabled}
                  />
                  <span>{u.fullName}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
