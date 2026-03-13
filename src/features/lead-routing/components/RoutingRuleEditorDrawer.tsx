"use client"

import { useState, useEffect } from "react"
import { useLocale } from "@/contexts/locale-context"
import { useAppTranslations } from "@/lib/useAppTranslations"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerHeaderTitle,
} from "@/components/Drawer"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Switch } from "@/components/Switch"
import { Select } from "@/components/Select"
import { Checkbox } from "@/components/Checkbox"
import type {
  LeadRoutingRule,
  LeadRoutingConditionType,
  LeadRoutingAssignmentType,
} from "../leadRouting.types"
import type { LeadRoutingUser } from "../useLeadRoutingSettings"
import {
  LEAD_ROUTING_CAMPAIGNS,
  LEAD_ROUTING_SOURCES,
  LEAD_ROUTING_TREATMENT_INTERESTS,
  LEAD_ROUTING_LOCATIONS,
} from "../leadRouting.data"

interface RoutingRuleEditorDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  users: LeadRoutingUser[]
  initialRule?: LeadRoutingRule | null
  onSave: (rule: Omit<LeadRoutingRule, "id" | "priority">) => void
}

function emptyForm(users: LeadRoutingUser[]): Omit<LeadRoutingRule, "id" | "priority"> {
  const firstId = users[0]?.id ?? ""
  return {
    name: "",
    isEnabled: true,
    conditionType: "campaign",
    conditionValue: LEAD_ROUTING_CAMPAIGNS[0]?.id ?? "",
    assignmentType: "user",
    assignmentTarget: firstId,
  }
}

function getConditionValueOptions(conditionType: LeadRoutingConditionType) {
  switch (conditionType) {
    case "campaign":
      return LEAD_ROUTING_CAMPAIGNS
    case "source":
      return LEAD_ROUTING_SOURCES
    case "treatment_interest":
      return LEAD_ROUTING_TREATMENT_INTERESTS
    case "existing_patient":
      return [
        { id: "yes", name: "Yes" },
        { id: "no", name: "No" },
      ] as { id: string; name: string }[]
    case "location":
      return LEAD_ROUTING_LOCATIONS
    default:
      return []
  }
}

export function RoutingRuleEditorDrawer({
  open,
  onOpenChange,
  mode,
  users,
  initialRule = null,
  onSave,
}: RoutingRuleEditorDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const [form, setForm] = useState<Omit<LeadRoutingRule, "id" | "priority">>(() =>
    emptyForm(users)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialRule) {
        setForm({
          name: initialRule.name,
          isEnabled: initialRule.isEnabled,
          conditionType: initialRule.conditionType,
          conditionValue: initialRule.conditionValue,
          assignmentType: initialRule.assignmentType,
          assignmentTarget: initialRule.assignmentTarget,
        })
      } else {
        setForm(emptyForm(users))
      }
    }
  }, [open, mode, initialRule, users])

  const handleConditionTypeChange = (value: LeadRoutingConditionType) => {
    const options = getConditionValueOptions(value)
    const firstValue = options[0]?.id ?? ""
    setForm((prev) => ({
      ...prev,
      conditionType: value,
      conditionValue: firstValue,
    }))
  }

  const handleAssignmentTypeChange = (value: LeadRoutingAssignmentType) => {
    const firstId = users[0]?.id ?? ""
    const target = value === "user" ? firstId : [firstId]
    setForm((prev) => ({
      ...prev,
      assignmentType: value,
      assignmentTarget: target,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setIsSubmitting(true)
    onSave(form)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const conditionOptions = getConditionValueOptions(form.conditionType)
  const title = mode === "add" ? t.settings.addRuleDrawerTitle : t.settings.editRuleDrawerTitle

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-lg">
        <DrawerHeader>
          <DrawerHeaderTitle title={title} />
        </DrawerHeader>
        <form onSubmit={handleSubmit}>
          <DrawerBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">{t.settings.ruleName}</Label>
              <Input
                id="rule-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g. Existing patients"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="rule-enabled" className="text-sm font-medium">
                {form.isEnabled ? t.settings.enabled : t.settings.disabled}
              </Label>
              <Switch
                id="rule-enabled"
                checked={form.isEnabled}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isEnabled: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition-type" className="text-xs">
                {t.settings.when}
              </Label>
              <Select
                id="condition-type"
                value={form.conditionType}
                onChange={(e) =>
                  handleConditionTypeChange(e.target.value as LeadRoutingConditionType)
                }
              >
                <option value="campaign">{t.settings.conditionCampaign}</option>
                <option value="source">{t.settings.conditionSource}</option>
                <option value="treatment_interest">{t.settings.conditionTreatmentInterest}</option>
                <option value="existing_patient">{t.settings.conditionExistingPatient}</option>
                <option value="location">{t.settings.conditionLocation}</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition-value" className="text-xs">
                {form.conditionType === "campaign"
                  ? t.settings.conditionCampaign
                  : form.conditionType === "source"
                    ? t.settings.conditionSource
                    : form.conditionType === "treatment_interest"
                      ? t.settings.conditionTreatmentInterest
                      : form.conditionType === "existing_patient"
                        ? t.settings.conditionExistingPatient
                        : t.settings.conditionLocation}
              </Label>
              <Select
                id="condition-value"
                value={form.conditionValue}
                onChange={(e) => setForm((prev) => ({ ...prev, conditionValue: e.target.value }))}
              >
                {conditionOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment-type" className="text-xs">
                {t.settings.then}
              </Label>
              <Select
                id="assignment-type"
                value={form.assignmentType}
                onChange={(e) =>
                  handleAssignmentTypeChange(e.target.value as LeadRoutingAssignmentType)
                }
              >
                <option value="user">{t.settings.assignmentUser}</option>
                <option value="round_robin">{t.settings.assignmentRoundRobin}</option>
              </Select>
            </div>

            {form.assignmentType === "user" && (
              <div className="space-y-2">
                <Label htmlFor="assignment-target-user" className="text-xs">
                  {t.settings.assignmentUser}
                </Label>
                <Select
                  id="assignment-target-user"
                  value={
                    Array.isArray(form.assignmentTarget) ? "" : form.assignmentTarget
                  }
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, assignmentTarget: e.target.value }))
                  }
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {form.assignmentType === "round_robin" && (
              <div className="space-y-2">
                <Label className="text-xs">{t.settings.distributionPoolUsers}</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.settings.distributionPoolHelper}
                </p>
                <div className="flex flex-col gap-2 rounded-md border border-gray-200 dark:border-gray-700 p-3 max-h-40 overflow-y-auto">
                  {users.map((u) => {
                    const ids = Array.isArray(form.assignmentTarget)
                      ? form.assignmentTarget
                      : form.assignmentTarget ? [form.assignmentTarget] : []
                    return (
                      <label
                        key={u.id}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <Checkbox
                          checked={ids.includes(u.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setForm((prev) => ({
                                ...prev,
                                assignmentTarget: [...ids, u.id],
                              }))
                            } else {
                              const next = ids.filter((id) => id !== u.id)
                              setForm((prev) => ({
                                ...prev,
                                assignmentTarget:
                                  next.length > 0 ? next : [users[0]?.id ?? ""],
                              }))
                            }
                          }}
                        />
                        <span>{u.fullName}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !form.name.trim()}
            >
              {isSubmitting ? t.settings.saving : t.settings.saveChanges}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
