"use client";

import { Card, CardContent } from "@/components/Card";
import type { Campaign } from "../campaigns.types";
import {
  RiMoneyDollarCircleLine,
  RiGroupLine,
  RiUserAddLine,
  RiCalendarCheckLine,
  RiPercentLine,
  RiUserHeartLine,
} from "@remixicon/react";

interface CampaignDetailMetricsProps {
  campaign: Campaign;
  patientsTreated?: number;
}

export function CampaignDetailMetrics({
  campaign,
  patientsTreated,
}: CampaignDetailMetricsProps) {
  const treated = patientsTreated ?? Math.round(campaign.bookings * 0.65);
  const convRateLeadToBook = campaign.leads > 0
    ? ((campaign.bookings / campaign.leads) * 100).toFixed(1)
    : "0";

  const metrics = [
    {
      label: "Ad Spend",
      value: `${campaign.spend.toLocaleString()} EGP`,
      icon: RiMoneyDollarCircleLine,
    },
    {
      label: "Leads",
      value: campaign.leads.toLocaleString(),
      icon: RiGroupLine,
    },
    {
      label: "Cost per Lead",
      value: `${campaign.costPerLead.toFixed(1)} EGP`,
      icon: RiUserAddLine,
    },
    {
      label: "Booked Appointments",
      value: campaign.bookings.toString(),
      icon: RiCalendarCheckLine,
    },
    {
      label: "Conversion Rate (Lead → Booking)",
      value: `${convRateLeadToBook}%`,
      icon: RiPercentLine,
    },
    {
      label: "Patients Treated",
      value: treated.toString(),
      icon: RiUserHeartLine,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((m) => (
        <Card key={m.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {m.label}
              </p>
              <m.icon className="size-4 shrink-0 text-gray-400" />
            </div>
            <p className="mt-1.5 text-lg font-semibold text-gray-900 dark:text-white">
              {m.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
