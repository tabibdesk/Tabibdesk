"use client";

import { ActivityPage } from "@/features/activity/ActivityPage";
import { useUserClinic } from "@/contexts/user-clinic-context";

export default function ActivityRoute() {
  const { currentClinic } = useUserClinic();

  return <ActivityPage clinicId={currentClinic.id} />;
}
