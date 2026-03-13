"use client"

import { Suspense, useState, useMemo } from "react"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { PageHeader } from "@/components/shared/PageHeader"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { PageSkeleton } from "@/components/skeletons"
import { ReactivationRulesTab } from "@/app/(app)/settings/ReactivationRulesTab"
import { ReEngagementTab } from "@/app/(app)/settings/ReEngagementTab"
import { LeadAutoAssignmentTab } from "@/app/(app)/settings/LeadAutoAssignmentTab"
import { getLeadRoutingUsers } from "@/features/lead-routing/leadRouting.data"
import { useLeadRoutingSettings } from "@/features/lead-routing/useLeadRoutingSettings"

type SubTabId = "automation" | "leadRouting" | "reEngagement"

function AutomationsPageContent() {
  const [activeTab, setActiveTab] = useState<SubTabId>("automation")
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

  const tabs: { id: SubTabId; label: string }[] = [
    { id: "automation", label: t.settings.automationGeneral },
    { id: "leadRouting", label: t.nav.leads },
    { id: "reEngagement", label: t.settings.reengagement },
  ]

  return (
    <div className="page-content">
      <PageHeader title={t.settings.automation} />

      {/* Tab Navigation - same structure as Settings */}
      <div className="!mt-0 space-y-3">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav
            className="-mb-px flex gap-4 overflow-x-auto pb-px sm:gap-8"
            aria-label="Automation tabs"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-1 py-3 text-xs font-medium transition-colors sm:gap-2 sm:py-4 sm:text-sm ${
                    isActive
                      ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4 sm:mt-6 pb-8">
        {activeTab === "automation" && <ReactivationRulesTab />}
        {activeTab === "reEngagement" && <ReEngagementTab />}
        {activeTab === "leadRouting" && (
          <LeadAutoAssignmentTab
            settings={settings}
            updateSettings={updateSettings}
            users={users}
            leadAutoCloseSettings={leadAutoCloseSettings}
            updateLeadAutoClose={updateLeadAutoClose}
            onSave={() => {}}
            addRule={addRule}
            updateRule={updateRule}
            deleteRule={deleteRule}
            duplicateRule={duplicateRule}
            reorderRules={reorderRules}
          />
        )}
      </div>
    </div>
  )
}

export default function AutomationsPage() {
  return (
    <Suspense
      fallback={
        <div className="page-content">
          <PageSkeleton showHeader contentBlocks={2} />
        </div>
      }
    >
      <AutomationsPageContent />
    </Suspense>
  )
}
