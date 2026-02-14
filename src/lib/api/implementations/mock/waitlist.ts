import type { IWaitlistRepository } from "../../interfaces/waitlist.interface"

let waitlistStore: { id: string; patient_id: string; appointment_type: string; status: string; created_at: string }[] = []
let initialized = false

function initStore() {
  if (!initialized) {
    waitlistStore = []
    initialized = true
  }
}

function generateId(): string {
  return `wl-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export class MockWaitlistRepository implements IWaitlistRepository {
  async list(appointmentTypeId: string): Promise<any[]> {
    initStore()
    return waitlistStore.filter((w) => w.appointment_type === appointmentTypeId && w.status === "pending")
  }

  async create(patientId: string, appointmentTypeId: string): Promise<any> {
    initStore()
    const entry = {
      id: generateId(),
      patient_id: patientId,
      appointment_type: appointmentTypeId,
      status: "pending",
      created_at: new Date().toISOString(),
    }
    waitlistStore.push(entry)
    return entry
  }

  async approve(id: string): Promise<any> {
    initStore()
    const entry = waitlistStore.find((w) => w.id === id)
    if (!entry) throw new Error("Waitlist entry not found")
    entry.status = "approved"
    return entry
  }

  async reject(id: string): Promise<any> {
    initStore()
    const entry = waitlistStore.find((w) => w.id === id)
    if (!entry) throw new Error("Waitlist entry not found")
    entry.status = "rejected"
    return entry
  }
}
