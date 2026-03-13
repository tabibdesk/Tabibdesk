"use client";

import { Card, CardContent } from "@/components/Card";
import { useAppTranslations } from "@/lib/useAppTranslations";
import { MarketingMetrics } from "../campaigns.types";
import { 
  RiGroupLine, 
  RiCalendarCheckLine, 
  RiPercentLine, 
  RiMoneyDollarCircleLine, 
  RiUserAddLine 
} from "@remixicon/react";

interface CampaignsKPIsProps {
  metrics: MarketingMetrics;
}

export function CampaignsKPIs({ metrics }: CampaignsKPIsProps) {
  const t = useAppTranslations();
  const kpis = [
    {
      label: t.marketing.totalLeads,
      value: metrics.totalLeads.toLocaleString(),
      icon: RiGroupLine,
      trend: "+12%",
      trendUp: true,
    },
    {
      label: t.marketing.bookings,
      value: metrics.totalBookings.toLocaleString(),
      icon: RiCalendarCheckLine,
      trend: "+5%",
      trendUp: true,
    },
    {
      label: t.marketing.conversionRate,
      value: `${metrics.conversionRate}%`,
      icon: RiPercentLine,
      trend: "-2%",
      trendUp: false,
    },
    {
      label: t.marketing.revenue,
      value: `${metrics.totalRevenue.toLocaleString()} EGP`,
      icon: RiMoneyDollarCircleLine,
      trend: "+18%",
      trendUp: true,
    },
    {
      label: t.marketing.costPerLead,
      value: `${metrics.costPerLead} EGP`,
      icon: RiUserAddLine,
      trend: "-5%",
      trendUp: true, // Lower is better
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {kpi.label}
              </p>
              <kpi.icon className="size-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{kpi.value}</div>
              <span
                className={`text-xs font-medium ${
                  kpi.trendUp ? "text-green-600" : "text-red-600"
                }`}
              >
                {kpi.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
