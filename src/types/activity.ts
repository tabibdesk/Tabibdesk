export type ActivityEntityType =
  | "patient"
  | "appointment"
  | "task"
  | "payment"
  | "invoice"
  | "waitlist"
  | "settings"
  | "auth";

export type ActivityAction =
  | "create"
  | "update"
  | "status_change"
  | "assign"
  | "cancel"
  | "complete"
  | "approve"
  | "offer"
  | "book"
  | "reschedule"
  | "note_added"
  | "upload"
  | "export"
  | "delete";

/** Single activity event (alias used by API layer). */
export type Activity = ActivityEvent

export interface ActivityEvent {
  id: string;
  clinicId: string;
  actorUserId: string;
  actorName: string;
  actorRole?: string;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: string;
  entityLabel?: string; // e.g. "Ahmed Hassan" or "Appt 12:30"
  message: string;      // human readable: "Marked appointment as No-show"
  createdAt: string;    // ISO
  meta?: Record<string, unknown>; // minimal optional payload
}

export interface ListActivityParams {
  clinicId: string;
  entityId?: string;
  entityType?: ActivityEntityType;
  actorUserId?: string;
  action?: ActivityAction;
  from?: string;
  to?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}

export interface ListActivityResponse {
  events: ActivityEvent[];
  total: number;
  hasMore: boolean;
}
