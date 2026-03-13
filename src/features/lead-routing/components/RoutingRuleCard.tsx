"use client"

import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { RiEditLine, RiDeleteBinLine, RiFileCopyLine, RiMenuLine } from "@remixicon/react"
import type { LeadRoutingRule } from "../leadRouting.types"
import type { LeadRoutingUser } from "../useLeadRoutingSettings"
import {
  LEAD_ROUTING_CAMPAIGNS,
  LEAD_ROUTING_SOURCES,
  LEAD_ROUTING_TREATMENT_INTERESTS,
  LEAD_ROUTING_LOCATIONS,
} from "../leadRouting.data"

interface RoutingRuleCardProps {
  users: LeadRoutingUser[]
  rule: LeadRoutingRule
  index: number
  onEdit: (rule: LeadRoutingRule) => void
  onDuplicate: (ruleId: string) => void
  onDelete: (ruleId: string) => void
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  draggedIndex: number | null
  dragOverIndex: number | null
}

function getConditionLabel(rule: LeadRoutingRule): string {
  switch (rule.conditionType) {
    case "campaign":
      return LEAD_ROUTING_CAMPAIGNS.find((c) => c.id === rule.conditionValue)?.name ?? rule.conditionValue
    case "source":
      return LEAD_ROUTING_SOURCES.find((s) => s.id === rule.conditionValue)?.name ?? rule.conditionValue
    case "treatment_interest":
      return LEAD_ROUTING_TREATMENT_INTERESTS.find((t) => t.id === rule.conditionValue)?.name ?? rule.conditionValue
    case "existing_patient":
      return rule.conditionValue === "yes"
        ? "Existing patient = Yes"
        : "Existing patient = No"
    case "location":
      return LEAD_ROUTING_LOCATIONS.find((l) => l.id === rule.conditionValue)?.name ?? rule.conditionValue
    default:
      return rule.conditionValue
  }
}

function getAssignmentLabel(rule: LeadRoutingRule, users: LeadRoutingUser[]): string {
  if (Array.isArray(rule.assignmentTarget)) {
    const names = rule.assignmentTarget
      .map((id) => users.find((u) => u.id === id)?.fullName)
      .filter(Boolean)
    return names.length > 0 ? `Round robin: ${(names as string[]).join(", ")}` : "—"
  }
  const user = users.find((u) => u.id === rule.assignmentTarget)
  return user?.fullName ?? "—"
}

export function RoutingRuleCard({
  rule,
  users,
  index,
  onEdit,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggedIndex,
  dragOverIndex,
}: RoutingRuleCardProps) {
  const t = useAppTranslations()
  const whenSummary = getConditionLabel(rule)
  const thenSummary = getAssignmentLabel(rule, users)

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`flex flex-col gap-2 rounded-lg border border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between ${
        draggedIndex === index ? "opacity-50" : ""
      } ${dragOverIndex === index ? "border-primary-300 bg-primary-50/30 dark:border-primary-700 dark:bg-primary-900/10" : ""} cursor-move`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div
          className="flex size-8 shrink-0 items-center justify-center text-gray-400 dark:text-gray-500"
          aria-hidden
        >
          <RiMenuLine className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{rule.name}</span>
            <Badge
              color={rule.isEnabled ? "emerald" : "neutral"}
              size="xs"
            >
              {rule.isEnabled ? t.settings.enabled : t.settings.disabled}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600 dark:text-gray-400">
            <span>
              {t.settings.when}: {whenSummary}
            </span>
            <span>
              {t.settings.then}: {thenSummary}
            </span>
            <span>
              #{rule.priority + 1}
            </span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(rule)}
          aria-label={t.common.edit}
          title={t.common.edit}
        >
          <RiEditLine className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDuplicate(rule.id)}
          aria-label={t.settings.duplicate}
          title={t.settings.duplicate}
        >
          <RiFileCopyLine className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(rule.id)}
          aria-label={t.settings.deleteAvailability}
          title={t.settings.deleteAvailability}
        >
          <RiDeleteBinLine className="size-4" />
        </Button>
      </div>
    </div>
  )
}
