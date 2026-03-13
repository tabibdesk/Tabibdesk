"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import type { Campaign } from "../campaigns.types";

interface CampaignRevenueAttributionProps {
  campaign: Campaign;
  patientsTreated?: number;
  avgTreatmentValue?: number;
  revenuePerLead?: number;
  revenuePerPatient?: number;
  costPerPatient?: number;
}

export function CampaignRevenueAttribution({
  campaign,
  patientsTreated,
  avgTreatmentValue,
  revenuePerLead,
  revenuePerPatient,
  costPerPatient,
}: CampaignRevenueAttributionProps) {
  const treated = patientsTreated ?? Math.round(campaign.bookings * 0.65);
  const avgValue = avgTreatmentValue ?? Math.round(campaign.revenue / (treated || 1));
  const revPerLead = revenuePerLead ?? (campaign.leads > 0 ? campaign.revenue / campaign.leads : 0);
  const revPerPatient = revenuePerPatient ?? (treated > 0 ? campaign.revenue / treated : 0);
  const cpp = costPerPatient ?? (treated > 0 ? campaign.spend / treated : 0);

  const metrics = [
    { label: "Patients treated", value: treated },
    { label: "Avg treatment value", value: `${avgValue.toLocaleString()} EGP` },
    { label: "Total revenue", value: `${campaign.revenue.toLocaleString()} EGP` },
    { label: "Revenue per lead", value: `${Math.round(revPerLead).toLocaleString()} EGP` },
    { label: "Revenue per patient", value: `${Math.round(revPerPatient).toLocaleString()} EGP` },
    { label: "Cost per patient", value: `${Math.round(cpp).toLocaleString()} EGP` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Attribution</CardTitle>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Revenue and ROI from this campaign
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
              <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                {m.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            ROI: {campaign.roi}x
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            Spend: {campaign.spend.toLocaleString()} EGP → Revenue:{" "}
            {campaign.revenue.toLocaleString()} EGP
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
