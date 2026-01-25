import { ActivityEvent, ListActivityParams, ListActivityResponse } from "@/types/activity";
import { mockData } from "@/data/mock/mock-data";
import { mockUsers } from "@/data/mock/users-clinics";

// In-memory store for activities (demo mode)
let activitiesStore: ActivityEvent[] = [];

// Seed some initial activities for demo
const seedActivities = () => {
  if (activitiesStore.length > 0) return;

  const now = new Date();
  const demoActivities: ActivityEvent[] = [
    {
      id: "act-001",
      clinicId: "clinic-001",
      actorUserId: "user-001",
      actorName: "Dr. Ahmed Hassan",
      actorRole: "doctor",
      action: "create",
      entityType: "patient",
      entityId: "patient-001",
      entityLabel: "Fatima Mohamed",
      message: "Created patient record for Fatima Mohamed",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "act-002",
      clinicId: "clinic-001",
      actorUserId: "user-003",
      actorName: "Mariam Mohamed",
      actorRole: "assistant",
      action: "book",
      entityType: "appointment",
      entityId: "apt-001",
      entityLabel: "Appt: Fatima Mohamed",
      message: "Booked new appointment for Fatima Mohamed",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 1).toISOString(),
    },
    {
      id: "act-003",
      clinicId: "clinic-001",
      actorUserId: "user-001",
      actorName: "Dr. Ahmed Hassan",
      actorRole: "doctor",
      action: "note_added",
      entityType: "patient",
      entityId: "patient-001",
      entityLabel: "Fatima Mohamed",
      message: "Added clinical note to Fatima Mohamed's profile",
      createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
    }
  ];

  activitiesStore = [...demoActivities];
};

seedActivities();

/**
 * Log a new activity event
 */
export async function logActivity(event: Omit<ActivityEvent, "id" | "createdAt">): Promise<ActivityEvent> {
  const newEvent: ActivityEvent = {
    ...event,
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  activitiesStore.unshift(newEvent);
  return newEvent;
}

/**
 * List activity events with filters
 */
export async function listActivities(params: ListActivityParams): Promise<ListActivityResponse> {
  const { 
    clinicId, 
    entityId, 
    entityType, 
    actorUserId, 
    action, 
    from, 
    to, 
    page = 1, 
    pageSize = 20 
  } = params;

  let filtered = activitiesStore.filter(a => a.clinicId === clinicId);

  if (entityId) {
    filtered = filtered.filter(a => a.entityId === entityId);
  }

  if (entityType) {
    filtered = filtered.filter(a => a.entityType === entityType);
  }

  if (actorUserId) {
    filtered = filtered.filter(a => a.actorUserId === actorUserId);
  }

  if (action) {
    filtered = filtered.filter(a => a.action === action);
  }

  if (from) {
    const fromDate = new Date(from);
    filtered = filtered.filter(a => new Date(a.createdAt) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    filtered = filtered.filter(a => new Date(a.createdAt) <= toDate);
  }

  // Sort by date desc
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const events = filtered.slice(start, end);

  return {
    events,
    total,
    hasMore: end < total,
  };
}
