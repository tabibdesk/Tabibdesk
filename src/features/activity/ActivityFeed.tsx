"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { RiHistoryLine, RiTimeLine } from "@remixicon/react";
import { listActivities } from "@/api/activity.api";
import { ActivityEvent, ActivityEntityType } from "@/types/activity";
import { format } from "date-fns";
import { cx } from "@/lib/utils";

interface ActivityFeedProps {
  clinicId: string;
  entityId: string;
  entityType: ActivityEntityType;
  title?: string;
  maxItems?: number;
}

export function ActivityFeed({ 
  clinicId, 
  entityId, 
  entityType, 
  title = "Recent Activity",
  maxItems = 10
}: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const response = await listActivities({
          clinicId,
          entityId,
          entityType,
          pageSize: maxItems,
        });
        setEvents(response.events);
      } catch (error) {
        console.error("Failed to fetch activity feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [clinicId, entityId, entityType, maxItems]);

  if (loading && events.length === 0) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
        {title}
      </h3>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
          <RiHistoryLine className="size-8 text-gray-300" />
          <p className="mt-2 text-xs text-gray-500">No activity recorded for this {entityType}.</p>
        </div>
      ) : (
        <div className="relative space-y-4">
          {/* Vertical line */}
          <div className="absolute left-2.5 top-0 h-full w-px bg-gray-100 dark:bg-gray-800" />

          {events.map((event) => (
            <div key={event.id} className="relative pl-8">
              {/* Dot */}
              <div className="absolute left-0 top-1.5 size-5 rounded-full bg-white ring-2 ring-gray-100 dark:bg-gray-950 dark:ring-gray-800 flex items-center justify-center">
                <div className={cx(
                  "size-2 rounded-full",
                  event.action === "create" ? "bg-green-500" :
                  event.action === "delete" ? "bg-red-500" :
                  "bg-primary-500"
                )} />
              </div>

              <div className="space-y-0.5">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{event.actorName}</span>
                  {" "}{event.message}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <RiTimeLine className="size-3" />
                  {format(new Date(event.createdAt), "MMM d, h:mm a")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
