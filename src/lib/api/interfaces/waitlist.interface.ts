export interface IWaitlistRepository {
  list(appointmentTypeId: string): Promise<any[]>
  create(patientId: string, appointmentTypeId: string): Promise<any>
  approve(id: string): Promise<any>
  reject(id: string): Promise<any>
}
