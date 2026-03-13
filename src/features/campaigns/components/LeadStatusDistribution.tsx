"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { getBadgeColor } from "@/lib/badgeColors";
import type { LeadStatus } from "../campaigns.types";

interface LeadStatusDistributionProps {
  statusCounts: Record<LeadStatus, number>;
}

const STATUS_ORDER: LeadStatus[] = [
  "new",
  "interested",
  "not_responding",
  "auto_closed",
  "lost",
  "converted",
];

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  interested: "Interested",
  not_responding: "Not Responding",
  auto_closed: "Auto closed",
  lost: "Lost",
  converted: "Converted",
};

const STATUS_COLORS: Record<LeadStatus, "slate" | "success" | "error" | "warning" | "default"> = {
  new: "default",
  interested: "warning",
  not_responding: "slate",
  auto_closed: "slate",
  lost: "error",
  converted: "success",
};

export function LeadStatusDistribution({ statusCounts }: LeadStatusDistributionProps) {
  const total = STATUS_ORDER.reduce((s, k) => s + (statusCounts[k] ?? 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Status Distribution</CardTitle>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Helps staff prioritize pending work
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {STATUS_ORDER.map((status) => {
            const count = statusCounts[status] ?? 0;
            if (count === 0) return null;
            const pct = total > 0 ? ((count / total) * 100).toFixed(0) : "0";
            return (
              <div
                key={status}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800"
              >
                <Badge color={getBadgeColor(STATUS_COLORS[status])} size="xs">
                  {STATUS_LABELS[status]}
                </Badge>
                <span className="font-semibold">{count}</span>
                <span className="text-xs text-gray-500">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
