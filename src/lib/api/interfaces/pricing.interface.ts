export interface IPricingRepository {
  getPriceForAppointmentType(clinicId: string, doctorId: string, appointmentType: string): Promise<number | null>
  setPriceForAppointmentType(clinicId: string, doctorId: string, appointmentType: string, price: number): Promise<void>
}
