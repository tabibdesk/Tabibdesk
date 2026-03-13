"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerHeaderTitle,
} from "@/components/Drawer";
import { Button } from "@/components/Button";
import type { Lead, LeadStatus, DisqualificationReason } from "../campaigns.types";
import { Badge } from "@/components/Badge";
import { getCampaignName } from "../campaigns.data";
import { useAppTranslations } from "@/lib/useAppTranslations";
import { useDemo } from "@/contexts/demo-context";
import { format } from "date-fns";
import {
  RiCalendarCheckLine,
  RiCloseCircleLine,
  RiArrowDownSLine,
  RiUserAddLine,
  RiUserLine,
  RiSparkling2Line,
  RiExternalLinkLine,
  RiLoader2Fill,
} from "@remixicon/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { LeadChatTab } from "./LeadChatTab";
import { LeadCallTab } from "./LeadCallTab";
import { LeadNotesTab } from "./LeadNotesTab";
import { getLeadAiSummary } from "../campaigns.data";
import { cx } from "@/lib/utils";

type TabId = "chat" | "call" | "notes";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "?";
}

/** Statuses available in dropdown; "converted" is set only when booking an appointment */
const SELECTABLE_STATUSES: LeadStatus[] = [
  "new",
  "interested",
  "not_responding",
  "auto_closed",
  "lost",
];

const DISQUALIFICATION_REASONS: DisqualificationReason[] = [
  "not_interested",
  "wrong_number",
  "outside_area",
  "already_treated_elsewhere",
  "budget_issue",
];

const STATUS_BADGE_COLORS: Record<
  LeadStatus,
  "blue" | "emerald" | "amber" | "indigo" | "red"
> = {
  new: "blue",           // fresh, unqualified
  interested: "emerald", // positive, engaged
  not_responding: "amber", // warning, needs follow-up
  auto_closed: "indigo", // system-closed, can reopen
  converted: "indigo",   // success, completed
  lost: "red",           // negative, closed
};

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBook: (lead: Lead) => void;
  onMarkLost?: (lead: Lead) => void;
  onLeadUpdate?: (lead: Lead) => void;
  assignedOptions?: string[];
}

export function LeadDetailsDrawer({
  lead,
  open,
  onOpenChange,
  onBook,
  onMarkLost,
  onLeadUpdate,
  assignedOptions = [],
}: LeadDetailsDrawerProps) {
  const t = useAppTranslations();
  const { isDemoMode } = useDemo();
  const [activeTab, setActiveTab] = useState<TabId>("notes");
  const [statusOpen, setStatusOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [markLostOpen, setMarkLostOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [matchedPatients, setMatchedPatients] = useState<{ id: string; first_name: string; last_name: string; phone: string }[]>([]);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  useEffect(() => {
    if (!linkOpen || !lead) return;
    const digits = normalizePhone(lead.phone);
    if (digits.length < 2) {
      setMatchedPatients([]);
      return;
    }
    setIsLoadingMatch(true);
    // Search with last 7+ digits so API matches (phones may have spaces/formatting)
    const searchQuery = digits.length >= 7 ? digits.slice(-7) : digits;
    fetch(`/api/patients/search?q=${encodeURIComponent(searchQuery)}&demo=${isDemoMode}`)
      .then((res) => res.json())
      .then((data: { id: string; first_name: string; last_name: string; phone: string }[]) => {
        const leadDigits = digits;
        const matches = data.filter((p) => {
          const pDigits = normalizePhone(p.phone);
          return pDigits === leadDigits || pDigits.includes(leadDigits) || leadDigits.includes(pDigits);
        });
        setMatchedPatients(matches.slice(0, 5));
      })
      .finally(() => setIsLoadingMatch(false));
  }, [linkOpen, lead?.id, lead?.phone, isDemoMode]);

  if (!lead) return null;

  const statusLabels = t.leads.statusLabels as Record<string, string>;
  const disqualifyReasons = t.leads.disqualifyReasons as Record<string, string>;

  const handleCall = () => {
    window.location.href = `tel:${lead.phone}`;
  };

  const handleMarkLost = (reason?: DisqualificationReason) => {
    const updated: Lead = {
      ...lead,
      status: "lost",
      ...(reason && { disqualificationReason: reason }),
    };
    if (onLeadUpdate) onLeadUpdate(updated);
    onMarkLost?.(updated);
    setMarkLostOpen(false);
    onOpenChange(false);
  };

  const handleStatusChange = (status: Lead["status"]) => {
    if (!onLeadUpdate) return;
    onLeadUpdate({ ...lead, status });
    setStatusOpen(false);
  };

  const handleLinkToPatient = (patientId: string) => {
    if (!onLeadUpdate) return;
    onLeadUpdate({ ...lead, convertedPatientId: patientId, status: "converted" });
    setLinkOpen(false);
  };

  const handleAssignChange = (assignedTo: string) => {
    if (!onLeadUpdate) return;
    onLeadUpdate({ ...lead, assignedTo: assignedTo || undefined });
    setAssigneeOpen(false);
  };

  const assignedName = lead.assignedTo ?? null;

  const canChangeStatus =
    onLeadUpdate && lead.status !== "converted";

  const tabs: { id: TabId; label: string }[] = [
    { id: "notes", label: t.leads.tabNotes },
    { id: "chat", label: t.leads.tabChat },
    { id: "call", label: t.leads.tabCall },
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex h-dvh max-h-dvh w-full flex-col overflow-hidden sm:max-w-2xl">
        <DrawerHeader noBorder>
          <DrawerHeaderTitle
            title={
              <div className="flex items-center gap-2">
                {lead.convertedPatientId ? (
                  <Link
                    href={`/patients/${lead.convertedPatientId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    {lead.name}
                    <RiExternalLinkLine className="size-4 shrink-0" aria-hidden />
                  </Link>
                ) : (
                  <span>{lead.name}</span>
                )}
                {!lead.convertedPatientId && (
                  <Popover open={linkOpen} onOpenChange={setLinkOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700 dark:text-primary-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
                        aria-label={t.leads.linkToPatient}
                      >
                        <RiUserAddLine className="size-3.5" />
                        {t.leads.linkToPatient}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="z-[9999] w-64 p-2" sideOffset={4}>
                      {isLoadingMatch ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-6">
                          <RiLoader2Fill className="size-5 animate-spin text-primary-600 dark:text-primary-400" aria-hidden />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t.common.loading}
                          </p>
                        </div>
                      ) : matchedPatients.length === 0 ? (
                        <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          {t.leads.noPatientMatch}
                        </p>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {matchedPatients.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleLinkToPatient(p.id)}
                              className="flex items-center gap-2 rounded px-2 py-2 text-start text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <RiUserLine className="size-4 shrink-0 text-gray-500" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {p.first_name} {p.last_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{p.phone}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            }
            description={
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        disabled={!canChangeStatus}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent p-0 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rtl:flex-row-reverse"
                        aria-label={t.leads.changeStatus}
                      >
                        <Badge color={STATUS_BADGE_COLORS[lead.status]} size="xs">
                          {statusLabels[lead.status] ?? lead.status}
                        </Badge>
                        <RiArrowDownSLine className="size-4 shrink-0 text-gray-500 rtl:rotate-180" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="z-[9999] w-auto p-2" sideOffset={4}>
                      <div className="flex flex-col gap-1">
                        {SELECTABLE_STATUSES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleStatusChange(s)}
                            className="w-full rounded px-2 py-1.5 text-start transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Badge color={STATUS_BADGE_COLORS[s]} size="xs" className="w-full justify-start">
                              {statusLabels[s] ?? s.replace("_", " ")}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {assignedOptions.length > 0 && (
                    <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={!onLeadUpdate}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent p-0 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rtl:flex-row-reverse"
                          aria-label={t.marketing.assignedTo}
                        >
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                            {assignedName ? getInitials(assignedName) : "—"}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {assignedName ?? t.leads.unassigned}
                          </span>
                          <RiArrowDownSLine className="size-4 shrink-0 text-gray-500 rtl:rotate-180" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="z-[9999] w-52 p-2" sideOffset={4}>
                        <button
                          type="button"
                          onClick={() => handleAssignChange("")}
                          className="flex w-full items-center gap-2 rounded px-2 py-2 text-start text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                            —
                          </div>
                          {t.leads.unassigned}
                        </button>
                        {assignedOptions.map((a) => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => handleAssignChange(a)}
                            className="flex w-full items-center gap-2 rounded px-2 py-2 text-start text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                              {getInitials(a)}
                            </div>
                            {a}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            }
          />
          <DrawerClose />
        </DrawerHeader>
        <DrawerBody className="flex min-h-0 flex-1 flex-col overflow-hidden py-0">
          <div className="shrink-0 rounded-lg border border-primary-100 bg-primary-50/80 px-4 py-3 dark:border-primary-900/30 dark:bg-primary-900/20 mb-3">
            <p className="text-xs text-primary-700 dark:text-primary-300">
              {getCampaignName(lead.campaignId)}
              <span aria-hidden className="mx-1.5">·</span>
              {t.leads.createdAt}: {format(new Date(lead.createdAt), "MMM d")}
            </p>
            {getLeadAiSummary(lead.id) && (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <RiSparkling2Line className="size-4 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
                  <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">{t.leads.aiSummary}</span>
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{getLeadAiSummary(lead.id)}</p>
              </>
            )}
          </div>
          <nav className="shrink-0 border-b border-gray-200 dark:border-gray-800" aria-label={t.leads.tabsAria}>
            <div className="flex gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cx(
                    "shrink-0 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-4">
            {activeTab === "notes" && (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <LeadNotesTab lead={lead} onLeadUpdate={onLeadUpdate} />
              </div>
            )}
            {activeTab === "chat" && (
              <div className="flex min-h-0 flex-1 flex-col">
                <LeadChatTab leadId={lead.id} />
              </div>
            )}
            {activeTab === "call" && (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <LeadCallTab leadId={lead.id} phone={lead.phone} onCall={handleCall} />
              </div>
            )}
          </div>
        </DrawerBody>
        <DrawerFooter className="flex flex-wrap gap-2">
          {lead.status !== "converted" && (
            <>
              {lead.status !== "lost" && (onMarkLost || onLeadUpdate) && (
                <Popover open={markLostOpen} onOpenChange={setMarkLostOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ms-auto rtl:me-auto rtl:ms-0"
                    >
                      <RiCloseCircleLine className="me-2 size-4 rtl:me-0 rtl:ms-2" />
                      {t.leads.markAsLost}
                      <RiArrowDownSLine className="ms-1 size-4 rtl:rotate-180" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="z-[9999] w-56 p-2" sideOffset={4}>
                    <p className="mb-2 px-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t.leads.disqualify}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {DISQUALIFICATION_REASONS.map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => handleMarkLost(reason)}
                          className="w-full rounded px-2 py-2 text-start text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {disqualifyReasons[reason] ?? reason.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <Button size="sm" onClick={() => onBook(lead)}>
                <RiCalendarCheckLine className="me-2 size-4 rtl:me-0 rtl:ms-2" />
                {t.leads.bookAppointment}
              </Button>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
