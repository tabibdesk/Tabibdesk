"use client";

import { Card, CardContent } from "@/components/Card";
import { useAppTranslations } from "@/lib/useAppTranslations";
import type { MarketingMetrics } from "../campaigns.types";
import {
  RiMoneyDollarCircleLine,
  RiGroupLine,
  RiUserAddLine,
  RiCalendarCheckLine,
  RiPercentLine,
} from "@remixicon/react";

interface MarketingKPIsProps {
  metrics: MarketingMetrics;
}

export function MarketingKPIs({ metrics }: MarketingKPIsProps) {
  const t = useAppTranslations();

  const kpis = [
    {
      label: t.insights.adSpendTotal,
      value: `${metrics.totalAdSpend.toLocaleString()} EGP`,
      icon: RiMoneyDollarCircleLine,
    },
    {
      label: t.marketing.totalLeads,
      value: metrics.totalLeads.toLocaleString(),
      icon: RiGroupLine,
    },
    {
      label: t.marketing.costPerLead,
      value: `${metrics.costPerLead.toFixed(0)} EGP`,
      icon: RiUserAddLine,
    },
    {
      label: t.marketing.bookings,
      value: metrics.totalBookings.toLocaleString(),
      icon: RiCalendarCheckLine,
    },
    {
      label: t.marketing.conversionRate,
      value: `${metrics.conversionRate}%`,
      icon: RiPercentLine,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between pb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {kpi.label}
              </p>
              <kpi.icon className="size-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
