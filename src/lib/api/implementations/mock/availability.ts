import type { IAvailabilityRepository } from "../../interfaces/availability.interface"

let availabilityStore = new Map<string, any>()

export class MockAvailabilityRepository implements IAvailabilityRepository {
  async getByDoctorId(doctorId: string, date: string): Promise<any[]> {
    const key = `${doctorId}-${date}`
    return availabilityStore.get(key) || []
  }

  async create(doctorId: string, date: string, slots: any[]): Promise<any> {
    const key = `${doctorId}-${date}`
    availabilityStore.set(key, slots)
    return { doctorId, date, slots }
  }

  async update(doctorId: string, date: string, slots: any[]): Promise<any> {
    const key = `${doctorId}-${date}`
    availabilityStore.set(key, slots)
    return { doctorId, date, slots }
  }
}
