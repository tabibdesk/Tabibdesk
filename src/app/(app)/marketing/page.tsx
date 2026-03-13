"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppTranslations } from "@/lib/useAppTranslations";
import { useDebounce } from "@/lib/useDebounce";
import { PageHeader } from "@/components/shared/PageHeader";
import { LeadsToolbar } from "@/features/campaigns/components/LeadsToolbar";
import { LeadsList } from "@/features/campaigns/components/LeadsList";
import { LeadDetailsDrawer } from "@/features/campaigns/components/LeadDetailsDrawer";
import { EmptyLeadsState } from "@/features/campaigns/components/EmptyLeadsState";
import { BookAppointmentDrawer } from "@/features/appointments/components/BookAppointmentDrawer";
import { useToast } from "@/hooks/useToast";
import { FeatureGate } from "@/components/guards/FeatureGate";
import {
  MOCK_LEADS,
  MOCK_CAMPAIGNS,
  getCampaignName,
  getAssignableUserNames,
} from "@/features/campaigns/campaigns.data";
import type { Lead } from "@/features/campaigns/campaigns.types";

function filterLeads(
  leads: Lead[],
  search: string,
  campaignId: string,
  status: string,
  assigned: string
): Lead[] {
  const q = search.trim().toLowerCase();
  return leads.filter((lead) => {
    if (q) {
      const matchName = lead.name.toLowerCase().includes(q);
      const matchPhone = lead.phone.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
      const matchService = (lead.serviceInterest ?? "").toLowerCase().includes(q);
      const matchCampaign = getCampaignName(lead.campaignId).toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchService && !matchCampaign) return false;
    }
    if (campaignId && lead.campaignId !== campaignId) return false;
    if (status && lead.status !== status) return false;
    if (assigned && lead.assignedTo !== assigned) return false;
    return true;
  });
}

type TabId = "leads" | "archive";

export default function LeadsPage() {
  const t = useAppTranslations();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("leads");
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [leadForBooking, setLeadForBooking] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

  useEffect(() => {
    const campaign = searchParams.get("campaign");
    if (campaign) setCampaignFilter(campaign);
  }, [searchParams]);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const assignedOptions = useMemo(() => getAssignableUserNames(), []);

  const activeLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.status !== "converted" &&
          l.status !== "lost" &&
          l.status !== "auto_closed"
      ),
    [leads]
  );
  const inactiveLeads = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.status === "converted" ||
          l.status === "lost" ||
          l.status === "auto_closed"
      ),
    [leads]
  );

  const filteredLeads = useMemo(() => {
    const source = activeTab === "leads" ? activeLeads : inactiveLeads;
    return filterLeads(
      source,
      debouncedSearch,
      campaignFilter,
      statusFilter,
      assignedFilter
    );
  }, [
    activeTab,
    activeLeads,
    inactiveLeads,
    debouncedSearch,
    campaignFilter,
    statusFilter,
    assignedFilter,
  ]);
  const hasActiveFilters = !!(searchQuery || campaignFilter || statusFilter || assignedFilter);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsDrawerOpen(true);
  };

  const handleBook = (lead: Lead) => {
    setIsDetailsDrawerOpen(false);
    setSelectedLead(lead);
    setLeadForBooking(lead);
  };

  const handleMarkLost = (lead: Lead) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id ? { ...l, status: "lost" as const } : l
      )
    );
    setSelectedLead(null);
    setIsDetailsDrawerOpen(false);
  };

  const handleLeadUpdate = (updated: Lead) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l))
    );
    setSelectedLead(updated);
  };

  return (
    <FeatureGate feature="campaign">
    <div className="page-content space-y-6 pb-10">
      <PageHeader title={t.leads.title} />

      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex gap-6" aria-label={t.leads.tabsAria}>
          <button
            onClick={() => setActiveTab("leads")}
            className={`shrink-0 border-b-2 px-1 py-3 text-sm font-medium ${
              activeTab === "leads"
                ? "border-primary-500 text-primary-600 dark:border-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {t.leads.tabLeads}
          </button>
          <button
            onClick={() => setActiveTab("archive")}
            className={`shrink-0 border-b-2 px-1 py-3 text-sm font-medium ${
              activeTab === "archive"
                ? "border-primary-500 text-primary-600 dark:border-primary-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {t.leads.tabInactive}
          </button>
        </nav>
      </div>

      <LeadsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        campaignFilter={campaignFilter}
        onCampaignFilterChange={setCampaignFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        assignedFilter={assignedFilter}
        onAssignedFilterChange={setAssignedFilter}
        totalLeads={activeTab === "leads" ? activeLeads.length : inactiveLeads.length}
        filteredCount={filteredLeads.length}
        campaigns={MOCK_CAMPAIGNS}
        assignedOptions={assignedOptions}
        activeTab={activeTab}
      />

      {filteredLeads.length === 0 ? (
        <EmptyLeadsState hasFilters={hasActiveFilters} isInactive={activeTab === "archive"} />
      ) : (
        <LeadsList
          leads={filteredLeads}
          onSelectLead={handleSelectLead}
          onBook={handleBook}
          onLeadUpdate={handleLeadUpdate}
          assignedOptions={assignedOptions}
        />
      )}

      <LeadDetailsDrawer
        lead={selectedLead}
        open={isDetailsDrawerOpen}
        onOpenChange={setIsDetailsDrawerOpen}
        onBook={handleBook}
        onMarkLost={handleMarkLost}
        onLeadUpdate={handleLeadUpdate}
        assignedOptions={assignedOptions}
      />

      <BookAppointmentDrawer
        open={!!leadForBooking}
        onClose={() => {
          setLeadForBooking(null);
          setSelectedLead(null);
        }}
        onBookingComplete={() => {
          if (leadForBooking) {
            setLeads((prev) =>
              prev.map((l) =>
                l.id === leadForBooking.id
                  ? { ...l, status: "converted" as const, convertedPatientId: l.id }
                  : l
              )
            );
          }
          showToast("Appointment booked successfully", "success");
          setLeadForBooking(null);
          setSelectedLead(null);
        }}
        lead={leadForBooking}
      />
    </div>
    </FeatureGate>
  );
}
