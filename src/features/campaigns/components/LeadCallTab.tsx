"use client";

import { useState } from "react";
import { format } from "date-fns";
import { RiPhoneLine, RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";
import { Button } from "@/components/Button";
import { useAppTranslations } from "@/lib/useAppTranslations";
import type { LeadCallTranscription } from "../campaigns.types";
import { getLeadTranscriptions, getLeadCallSummary } from "../campaigns.data";

interface LeadCallTabProps {
  leadId: string;
  phone: string;
  onCall: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LeadCallTab({ leadId, phone, onCall }: LeadCallTabProps) {
  const t = useAppTranslations();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const transcriptions = getLeadTranscriptions(leadId);
  const summary = getLeadCallSummary(leadId);

  return (
    <div className="flex flex-col gap-4 py-2">
      <Button variant="secondary" size="sm" onClick={onCall} className="w-fit">
        <RiPhoneLine className="me-2 size-4 rtl:me-0 rtl:ms-2" />
        {t.leads.call} {phone}
      </Button>

      {summary && (
        <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
            {t.leads.callSummary}: {t.leads.conclusion}
          </p>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {summary.conclusion}
          </p>
        </div>
      )}

      {transcriptions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t.leads.noTranscriptions}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {transcriptions.map((tr) => (
            <li
              key={tr.id}
              className="rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId((prev) => (prev === tr.id ? null : tr.id))
                }
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(tr.createdAt), "MMM d, HH:mm")} ·{" "}
                  {formatDuration(tr.durationSeconds)}
                </span>
                {expandedId === tr.id ? (
                  <RiArrowUpSLine className="size-4 shrink-0 text-gray-500 rtl:rotate-180" />
                ) : (
                  <RiArrowDownSLine className="size-4 shrink-0 text-gray-500 rtl:rotate-180" />
                )}
              </button>
              {expandedId === tr.id && (
                <div className="border-t border-gray-200 px-3 py-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
                  {tr.transcriptionText}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
