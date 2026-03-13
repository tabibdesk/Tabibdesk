"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { format, parseISO } from "date-fns";

interface LeadTimelineProps {
  leadsByDay: { date: string; count: number }[];
}

export function LeadTimeline({ leadsByDay }: LeadTimelineProps) {
  const maxCount = Math.max(...leadsByDay.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads Over Time</CardTitle>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Best performing days and when ads peaked
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leadsByDay.map(({ date, count }) => (
            <div key={date} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-sm text-gray-600 dark:text-gray-400">
                {format(parseISO(date), "MMM d")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="h-6 w-full overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded bg-primary-600"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-8 shrink-0 text-right text-sm font-semibold">
                {count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
