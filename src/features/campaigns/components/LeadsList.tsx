"use client";

import { useAppTranslations } from "@/lib/useAppTranslations";
import { Lead } from "../campaigns.types";
import { getCampaignName } from "../campaigns.data";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { getBadgeColor } from "@/lib/badgeColors";
import { RiEyeLine } from "@remixicon/react";
import { format } from "date-fns";

interface LeadsListProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onBook: (lead: Lead) => void;
  onLeadUpdate?: (lead: Lead) => void;
  assignedOptions?: string[];
}

export function LeadsList({
  leads,
  onSelectLead,
  onBook,
  onLeadUpdate,
  assignedOptions = [],
}: LeadsListProps) {
  const t = useAppTranslations();
  const getStatusVariant = (status: Lead["status"]): "default" | "neutral" | "slate" | "success" | "error" | "warning" => {
    switch (status) {
      case "new":
        return "default";
      case "interested":
        return "warning";
      case "not_responding":
        return "slate";
      case "auto_closed":
        return "slate";
      case "converted":
        return "success";
      case "lost":
        return "error";
      default:
        return "neutral";
    }
  };
  const getStatusLabel = (status: Lead["status"]) =>
    (t.leads.statusLabels as Record<string, string>)[status] ?? status.replace("_", " ");

  if (leads.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/50">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No leads found for the selected criteria.
        </p>
      </div>
    );
  }

  const handleAssignChange = (lead: Lead, assignedTo: string) => {
    if (!onLeadUpdate) return;
    onLeadUpdate({ ...lead, assignedTo: assignedTo || undefined });
  };

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
        >
          {/* Top row: Name, status badge, and actions (always visible) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div
              className="flex min-w-0 flex-1 cursor-pointer flex-col gap-2"
              onClick={() => onSelectLead(lead)}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {lead.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{lead.phone}</span>
                <Badge color={getBadgeColor(getStatusVariant(lead.status))} size="xs">
                  {getStatusLabel(lead.status)}
                </Badge>
              </div>
              <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
                <span>{getCampaignName(lead.campaignId)}</span>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{t.leads.createdAt}: {format(new Date(lead.createdAt), "MMM d")}</span>
                  {lead.lastContact && (
                    <span>{t.leads.lastContact}: {format(new Date(lead.lastContact), "MMM d")}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: assignee dropdown + view */}
            <div className="flex shrink-0 items-center gap-2">
              {(assignedOptions.length > 0 || lead.assignedTo) && (
                onLeadUpdate && assignedOptions.length > 0 ? (
                  <Select
                    value={lead.assignedTo ?? ""}
                    onChange={(e) => handleAssignChange(lead, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-auto min-w-[100px] max-w-[140px] border-gray-200 py-1 text-xs dark:border-gray-700"
                  >
                    <option value="">{t.leads.unassigned}</option>
                    {assignedOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {lead.assignedTo ?? t.leads.unassigned}
                  </span>
                )
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLead(lead);
                }}
                title={t.leads.viewDetails}
                aria-label={t.leads.viewDetails}
              >
                <RiEyeLine className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
