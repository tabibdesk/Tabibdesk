"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import type { CampaignFunnel } from "../campaigns.types";

interface CampaignConversionFunnelProps {
  funnel: CampaignFunnel;
}

const STEPS = [
  { key: "leads", label: "Lead" },
  { key: "contacted", label: "Contacted" },
  { key: "booked", label: "Booked" },
  { key: "visited", label: "Visited" },
  { key: "treated", label: "Treated" },
] as const;

export function CampaignConversionFunnel({ funnel }: CampaignConversionFunnelProps) {
  const maxCount = funnel.leads;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Shows where patients are lost in the journey
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {STEPS.map((step, i) => {
            const count = funnel[step.key];
            const prevCount = i === 0 ? count : funnel[STEPS[i - 1].key];
            const pct = prevCount > 0 ? ((count / prevCount) * 100).toFixed(0) : "0";
            const pctOfTotal = maxCount > 0 ? ((count / maxCount) * 100).toFixed(0) : "0";

            return (
              <div key={step.key} className="relative">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{step.label}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {count}
                    </span>
                    {" · "}
                    {i > 0 ? `${pct}% of previous` : "100%"}
                    {" · "}
                    {pctOfTotal}% of total
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all"
                    style={{
                      width: maxCount > 0 ? `${(count / maxCount) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
