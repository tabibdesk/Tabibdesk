export interface IAvailabilityRepository {
  getByDoctorId(doctorId: string, date: string): Promise<any[]>
  create(doctorId: string, date: string, slots: any[]): Promise<any>
  update(doctorId: string, date: string, slots: any[]): Promise<any>
}
