"use client";

import { useAppTranslations } from "@/lib/useAppTranslations";
import { RiUserSearchLine } from "@remixicon/react";
import { EmptyState } from "@/components/EmptyState";

interface EmptyLeadsStateProps {
  hasFilters: boolean;
  isInactive?: boolean;
}

export function EmptyLeadsState({ hasFilters, isInactive }: EmptyLeadsStateProps) {
  const t = useAppTranslations();
  return (
    <EmptyState
      icon={RiUserSearchLine}
      title={isInactive ? t.leads.emptyInactiveTitle : t.leads.emptyStateTitle}
      description={isInactive ? t.leads.emptyInactiveDescription : t.leads.emptyStateDescription}
    />
  );
}
