"use client";

import { SearchInput } from "@/components/SearchInput";
import { useAppTranslations } from "@/lib/useAppTranslations";
import { Select } from "@/components/Select";
import type { LeadStatus } from "../campaigns.types";
import type { Campaign } from "../campaigns.types";

interface LeadsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  campaignFilter: string;
  onCampaignFilterChange: (id: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  assignedFilter: string;
  onAssignedFilterChange: (assigned: string) => void;
  totalLeads: number;
  filteredCount: number;
  campaigns: Campaign[];
  assignedOptions: string[];
  activeTab?: "leads" | "archive";
}

const LEADS_TAB_STATUSES: LeadStatus[] = ["new", "interested", "not_responding"];
const INACTIVE_TAB_STATUSES: LeadStatus[] = ["auto_closed", "converted", "lost"];

export function LeadsToolbar({
  searchQuery,
  onSearchChange,
  campaignFilter,
  onCampaignFilterChange,
  statusFilter,
  onStatusFilterChange,
  assignedFilter,
  onAssignedFilterChange,
  totalLeads,
  filteredCount,
  campaigns,
  assignedOptions,
  activeTab = "leads",
}: LeadsToolbarProps) {
  const t = useAppTranslations();
  const statusOptions = activeTab === "archive" ? INACTIVE_TAB_STATUSES : LEADS_TAB_STATUSES;
  const hasActiveFilters = searchQuery || campaignFilter || statusFilter || assignedFilter;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <SearchInput
          placeholder={t.leads.searchPlaceholder}
          value={searchQuery}
          onSearchChange={onSearchChange}
          className="flex-1 min-w-0"
        />
        <div className="flex flex-wrap gap-2">
          <Select
            id="campaign-filter"
            value={campaignFilter}
            onChange={(e) => onCampaignFilterChange(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">{t.leads.allCampaigns}</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full sm:w-36"
          >
            <option value="">{t.leads.allStatuses}</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {(t.leads.statusLabels as Record<string, string>)[s] ?? s.replace("_", " ")}
              </option>
            ))}
          </Select>
          <Select
            id="assigned-filter"
            value={assignedFilter}
            onChange={(e) => onAssignedFilterChange(e.target.value)}
            className="w-full sm:w-36"
          >
            <option value="">{t.leads.allAssigned}</option>
            {assignedOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {hasActiveFilters && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredCount !== 1
            ? t.leads.leadsFoundPlural.replace("{count}", String(filteredCount))
            : t.leads.leadsFound.replace("{count}", String(filteredCount))}
        </p>
      )}
    </div>
  );
}
