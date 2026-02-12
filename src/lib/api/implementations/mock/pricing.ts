import type { IPricingRepository } from "../../interfaces/pricing.interface"

let pricingStore = new Map<string, number>()

const DEFAULT_PRICES: Record<string, number> = {
  consultation: 300,
  checkup: 200,
  followup: 150,
  procedure: 500,
}

function getPricingKey(clinicId: string, doctorId: string, appointmentType: string): string {
  return `${clinicId}-${doctorId}-${appointmentType}`
}

export class MockPricingRepository implements IPricingRepository {
  async getPriceForAppointmentType(clinicId: string, doctorId: string, appointmentType: string): Promise<number | null> {
    const key = getPricingKey(clinicId, doctorId, appointmentType)
    if (pricingStore.has(key)) {
      return pricingStore.get(key)!
    }
    return DEFAULT_PRICES[appointmentType] || 300
  }

  async setPriceForAppointmentType(
    clinicId: string,
    doctorId: string,
    appointmentType: string,
    price: number,
  ): Promise<void> {
    const key = getPricingKey(clinicId, doctorId, appointmentType)
    pricingStore.set(key, price)
  }
}
