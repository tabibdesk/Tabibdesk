"use client";

import { useAppTranslations } from "@/lib/useAppTranslations";
import { MarketingKPIs } from "@/features/campaigns/components/MarketingKPIs";
import { CampaignsFunnel } from "@/features/campaigns/components/CampaignsFunnel";
import { CampaignsTable } from "@/features/campaigns/components/CampaignsTable";
import { MOCK_CAMPAIGNS, MOCK_METRICS, MOCK_FUNNEL } from "@/features/campaigns/campaigns.data";

export function MarketingInsightsTab() {
  const t = useAppTranslations();

  return (
    <div className="space-y-8">
      <MarketingKPIs metrics={MOCK_METRICS} />
      <CampaignsFunnel steps={MOCK_FUNNEL} />
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {t.marketing.campaigns}
        </h3>
        <CampaignsTable campaigns={MOCK_CAMPAIGNS} />
      </div>
    </div>
  );
}
