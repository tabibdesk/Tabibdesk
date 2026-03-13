"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { RiAddLine } from "@remixicon/react"
import { RoutingRuleCard } from "./RoutingRuleCard"
import type { LeadRoutingRule } from "../leadRouting.types"
import type { LeadRoutingUser } from "../useLeadRoutingSettings"

interface RoutingRulesListProps {
  users: LeadRoutingUser[]
  rules: LeadRoutingRule[]
  onAddRule: () => void
  onEditRule: (rule: LeadRoutingRule) => void
  onDuplicateRule: (ruleId: string) => void
  onDeleteRule: (ruleId: string) => void
  onReorderRules: (fromIndex: number, toIndex: number) => void
}

export function RoutingRulesList({
  rules,
  users,
  onAddRule,
  onEditRule,
  onDuplicateRule,
  onDeleteRule,
  onReorderRules,
}: RoutingRulesListProps) {
  const t = useAppTranslations()
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(index))
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    onReorderRules(draggedIndex, dropIndex)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm font-semibold">{t.settings.routingRules}</CardTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {t.settings.firstMatchingWins}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={onAddRule}
        >
          <RiAddLine className="size-4" />
          {t.settings.addRule}
        </Button>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            {t.settings.noRulesYet}
          </p>
        ) : (
          <div className="space-y-2">
            {rules
              .sort((a, b) => a.priority - b.priority)
              .map((rule, index) => (
                <RoutingRuleCard
                  key={rule.id}
                  rule={rule}
                  users={users}
                  index={index}
                  onEdit={onEditRule}
                  onDuplicate={onDuplicateRule}
                  onDelete={onDeleteRule}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  draggedIndex={draggedIndex}
                  dragOverIndex={dragOverIndex}
                />
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
