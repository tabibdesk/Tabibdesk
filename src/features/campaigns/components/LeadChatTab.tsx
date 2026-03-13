"use client";

import { useRef, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  RiWhatsappLine,
  RiInstagramLine,
  RiFacebookCircleLine,
  RiChat3Line,
  RiSendPlaneLine,
  RiMoreFill,
} from "@remixicon/react";
import { useAppTranslations } from "@/lib/useAppTranslations";
import type { LeadMessage, LeadMessageSource } from "../campaigns.types";
import { getLeadMessages, MESSAGE_TEMPLATES } from "../campaigns.data";
import { cx } from "@/lib/utils";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/Dropdown";

const SOURCE_ICONS: Record<
  LeadMessageSource,
  React.ComponentType<{ className?: string }>
> = {
  whatsapp: RiWhatsappLine,
  instagram: RiInstagramLine,
  facebook: RiFacebookCircleLine,
  other: RiChat3Line,
};

const SOURCE_COLORS: Record<LeadMessageSource, string> = {
  whatsapp: "text-[#25D366]",
  instagram: "text-pink-500",
  facebook: "text-blue-600",
  other: "text-gray-500",
};

interface LeadChatTabProps {
  leadId: string;
}

function MessageSourceIcon({
  source,
  ariaLabel,
}: {
  source: LeadMessageSource;
  ariaLabel: string;
}) {
  const Icon = SOURCE_ICONS[source];
  const colorClass = SOURCE_COLORS[source];
  return (
    <Icon
      className={cx("size-4 shrink-0", colorClass)}
      aria-label={ariaLabel}
    />
  );
}

export function LeadChatTab({ leadId }: LeadChatTabProps) {
  const t = useAppTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<LeadMessage[]>(() =>
    getLeadMessages(leadId)
  );

  const sourceLabels: Record<LeadMessageSource, string> = {
    whatsapp: t.leads.sourceWhatsapp,
    instagram: t.leads.sourceInstagram,
    facebook: t.leads.sourceFacebook,
    other: t.leads.sourceOther,
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = () => {
    const text = messageInput.trim();
    if (!text) return;
    const newMsg: LeadMessage = {
      id: `local-${Date.now()}`,
      leadId,
      text,
      direction: "outbound",
      source: "whatsapp",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessageInput("");
  };

  const handleSelectTemplate = (text: string) => {
    setMessageInput(text);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto py-2"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.leads.chatEmpty}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg: LeadMessage) => {
              const isOutbound = msg.direction === "outbound";
              return (
                <div
                  key={msg.id}
                  className={cx(
                    "flex gap-2",
                    isOutbound ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <MessageSourceIcon
                    source={msg.source}
                    ariaLabel={sourceLabels[msg.source]}
                  />
                  <div
                    className={cx(
                      "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                      isOutbound
                        ? "bg-primary-600 text-white rounded-tr-none"
                        : "rounded-tl-none border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                    )}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <p
                      className={cx(
                        "mt-1 text-xs",
                        isOutbound ? "text-primary-100" : "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {format(new Date(msg.createdAt), "MMM d, HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-[#090E1A]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 shrink-0 p-0"
                aria-label={t.leads.templates}
              >
                <RiMoreFill className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {MESSAGE_TEMPLATES.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onSelect={() => handleSelectTemplate(template.text)}
                >
                  <span className="line-clamp-2 text-sm">{template.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={t.leads.chatPlaceholder}
            className="min-h-9 flex-1 text-sm"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!messageInput.trim()}
            className="h-9 shrink-0 px-3"
            aria-label={t.leads.send}
          >
            <RiSendPlaneLine className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
