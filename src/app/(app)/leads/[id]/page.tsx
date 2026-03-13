"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CampaignRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/leads?campaign=${encodeURIComponent(id)}`);
    } else {
      router.replace("/leads");
    }
  }, [id, router]);

  return null;
}
