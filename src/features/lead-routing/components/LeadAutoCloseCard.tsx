"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Label } from "@/components/Label"
import { Switch } from "@/components/Switch"
import { Input } from "@/components/Input"
import { useAppTranslations } from "@/lib/useAppTranslations"
import type { LeadAutoCloseSettings } from "../leadAutoClose.types"

interface LeadAutoCloseCardProps {
  settings: LeadAutoCloseSettings
  onUpdate: (updates: Partial<LeadAutoCloseSettings>) => void
  /** When true, omits the card header (for use when title/subtitle are shown above the card) */
  hideHeader?: boolean
}

export function LeadAutoCloseCard({ settings, onUpdate, hideHeader }: LeadAutoCloseCardProps) {
  const t = useAppTranslations()

  return (
    <Card>
      {!hideHeader && (
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t.settings.leadAutoClose}</CardTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {t.settings.leadAutoCloseDesc}
          </p>
        </CardHeader>
      )}
      <CardContent className={hideHeader ? "space-y-4 pt-6" : "space-y-4"}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <Label htmlFor="enable-auto-close" className="text-sm font-medium">
              {t.settings.enableAutoClose}
            </Label>
          </div>
          <Switch
            id="enable-auto-close"
            checked={settings.enabled}
            onCheckedChange={(checked) => onUpdate({ enabled: checked })}
          />
        </div>

        {!settings.enabled && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t.settings.leadsStayUnchanged}
          </p>
        )}

        {settings.enabled && (
          <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-2">
              <Label htmlFor="days-until-stale" className="text-xs">
                {t.settings.daysUntilStale}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="days-until-stale"
                  type="number"
                  min={1}
                  max={365}
                  value={settings.daysUntilStale}
                  onChange={(e) =>
                    onUpdate({ daysUntilStale: Math.max(1, Number(e.target.value) || 1) })
                  }
                  className="w-24"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t.settings.days}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.settings.daysUntilStaleHelper}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="min-w-0 flex-1">
                <Label htmlFor="reopen-on-reply" className="text-sm font-medium">
                  {t.settings.reopenOnPatientReply}
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t.settings.reopenOnPatientReplyHelper}
                </p>
              </div>
              <Switch
                id="reopen-on-reply"
                checked={settings.reopenOnPatientReply}
                onCheckedChange={(checked) => onUpdate({ reopenOnPatientReply: checked })}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
