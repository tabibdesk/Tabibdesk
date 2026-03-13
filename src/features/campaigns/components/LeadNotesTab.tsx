"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Textarea";
import { useAppTranslations } from "@/lib/useAppTranslations";
import type { Lead } from "../campaigns.types";

interface LeadNotesTabProps {
  lead: Lead;
  onLeadUpdate?: (lead: Lead) => void;
}

export function LeadNotesTab({ lead, onLeadUpdate }: LeadNotesTabProps) {
  const t = useAppTranslations();
  const [noteInput, setNoteInput] = useState("");

  const handleAddNote = () => {
    if (!noteInput.trim() || !onLeadUpdate) return;
    const updated: Lead = {
      ...lead,
      notes: lead.notes ? `${lead.notes}\n${noteInput.trim()}` : noteInput.trim(),
    };
    onLeadUpdate(updated);
    setNoteInput("");
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      {lead.notes && (
        <div className="rounded-md border border-yellow-100 bg-yellow-50 p-3 text-sm text-gray-700 dark:border-yellow-900/20 dark:bg-yellow-900/10 dark:text-gray-300">
          {lead.notes}
        </div>
      )}
      {onLeadUpdate && (
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder={t.leads.addNote}
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            rows={3}
            className="min-h-[80px] resize-y"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddNote}
            disabled={!noteInput.trim()}
            className="self-end"
          >
            {t.common.save}
          </Button>
        </div>
      )}
    </div>
  );
}
