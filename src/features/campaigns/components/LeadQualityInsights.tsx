"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";

interface LeadQualityInsightsProps {
  treatmentInterest: Record<string, number>;
  locationBreakdown: Record<string, number>;
}

export function LeadQualityInsights({
  treatmentInterest,
  locationBreakdown,
}: LeadQualityInsightsProps) {
  const treatmentEntries = Object.entries(treatmentInterest).sort((a, b) => b[1] - a[1]);
  const locationEntries = Object.entries(locationBreakdown).sort((a, b) => b[1] - a[1]);
  const totalTreatment = treatmentEntries.reduce((s, [, n]) => s + n, 0);
  const totalLocation = locationEntries.reduce((s, [, n]) => s + n, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Treatment Interest</CardTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Which services attract patients
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {treatmentEntries.map(([name, count]) => {
              const pct = totalTreatment > 0 ? ((count / totalTreatment) * 100).toFixed(0) : "0";
              return (
                <div
                  key={name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700 dark:text-gray-300">{name}</span>
                  <span className="font-medium">
                    {count} <span className="text-gray-500">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Where leads are coming from
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {locationEntries.map(([name, count]) => {
              const pct = totalLocation > 0 ? ((count / totalLocation) * 100).toFixed(0) : "0";
              return (
                <div
                  key={name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700 dark:text-gray-300">{name}</span>
                  <span className="font-medium">
                    {count} <span className="text-gray-500">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
