"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import type { CampaignResponseMetrics } from "../campaigns.types";

interface LeadResponseMetricsProps {
  metrics: CampaignResponseMetrics;
  totalLeads: number;
}

export function LeadResponseMetrics({ metrics, totalLeads }: LeadResponseMetricsProps) {
  const pctNeverContacted =
    totalLeads > 0 ? ((metrics.neverContactedCount / totalLeads) * 100).toFixed(1) : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Response Metrics</CardTitle>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Conversion depends on how fast the clinic responds
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Avg response time
            </p>
            <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
              {metrics.avgResponseTimeMinutes} min
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Contacted within 10 min
            </p>
            <p className="mt-1 text-xl font-semibold text-green-600 dark:text-green-500">
              {metrics.pctContactedWithin10Min}%
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Never contacted
            </p>
            <p className="mt-1 text-xl font-semibold text-amber-600 dark:text-amber-500">
              {metrics.neverContactedCount} <span className="text-sm font-normal">({pctNeverContacted}%)</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
