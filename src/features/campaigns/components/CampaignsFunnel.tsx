"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { useAppTranslations } from "@/lib/useAppTranslations";
import { FunnelStep } from "../campaigns.types";

interface CampaignsFunnelProps {
  steps: FunnelStep[];
}

export function CampaignsFunnel({ steps }: CampaignsFunnelProps) {
  const t = useAppTranslations();
  const maxCount = Math.max(...steps.map((s) => s.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.marketing.conversionFunnel}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.label} className="relative">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">{step.label}</span>
                <div className="text-right">
                  <span className="font-bold">{step.count}</span>
                  <span className="text-gray-500 ml-2">({step.percentage}%)</span>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${(step.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
