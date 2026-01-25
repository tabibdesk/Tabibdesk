"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { RiHistoryLine, RiFilterLine, RiUserLine, RiTimeLine } from "@remixicon/react";
import { listActivities } from "@/api/activity.api";
import { ActivityEvent, ActivityEntityType } from "@/types/activity";
import { format } from "date-fns";
import { cx } from "@/lib/utils";
import Link from "next/link";

interface ActivityPageProps {
  clinicId: string;
}

export function ActivityPage({ clinicId }: ActivityPageProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [entityTypeFilter, setEntityTypeFilter] = useState<ActivityEntityType | "all">("all");

  const pageSize = 20;

  const fetchActivities = async (currentPage: number, append = false) => {
    setLoading(true);
    try {
      const response = await listActivities({
        clinicId,
        entityType: entityTypeFilter === "all" ? undefined : entityTypeFilter,
        page: currentPage,
        pageSize,
      });

      if (append) {
        setEvents(prev => [...prev, ...response.events]);
      } else {
        setEvents(response.events);
      }
      
      setTotal(response.total);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
  }, [clinicId, entityTypeFilter]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage, true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Activity Log" 
        description="Audit trail of all actions performed in this clinic"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {(["all", "patient", "appointment", "task", "payment", "waitlist"] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setPage(1);
                setEntityTypeFilter(type);
              }}
              className={cx(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all capitalize",
                entityTypeFilter === type
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-50"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {loading && events.length === 0 ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <RiHistoryLine className="size-12 text-gray-400" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">No activity recorded yet.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 h-full w-px bg-gray-200 dark:bg-gray-800 md:left-6" />
              
              <div className="space-y-6">
                {events.map((event) => (
                  <ActivityItem key={event.id} event={event} />
                ))}
              </div>
            </div>

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="secondary"
                  onClick={handleLoadMore}
                  isLoading={loading}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ event }: { event: ActivityEvent }) {
  const getEntityLink = (type: ActivityEntityType, id: string) => {
    switch (type) {
      case "patient": return `/patients/${id}`;
      case "appointment": return `/appointments`; // Ideally link to drawer/modal
      case "task": return `/tasks`;
      case "payment": return `/accounting`;
      default: return null;
    }
  };

  const link = getEntityLink(event.entityType, event.entityId);

  return (
    <div className="relative pl-10 md:pl-14">
      {/* Icon dot */}
      <div className="absolute left-2 top-1 flex size-5 items-center justify-center rounded-full bg-white ring-4 ring-white dark:bg-gray-950 dark:ring-gray-950 md:left-4 md:size-6">
        <div className={cx(
          "size-2.5 rounded-full md:size-3",
          event.action === "create" || event.action === "book" ? "bg-green-500" :
          event.action === "delete" || event.action === "cancel" ? "bg-red-500" :
          event.action === "status_change" ? "bg-orange-500" :
          "bg-primary-500"
        )} />
      </div>

      <div className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-gray-700">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {event.actorName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({event.actorRole})
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {event.message}
              </span>
            </div>
            
            {event.entityLabel && (
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target:</span>
                {link ? (
                  <Link href={link} className="text-primary-600 hover:underline dark:text-primary-400">
                    {event.entityLabel}
                  </Link>
                ) : (
                  <span className="text-gray-700 dark:text-gray-300">{event.entityLabel}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 sm:shrink-0">
            <RiTimeLine className="size-3.5" />
            {format(new Date(event.createdAt), "MMM d, h:mm a")}
          </div>
        </div>
      </div>
    </div>
  );
}
