export type SupplierSpecialty =
  | "Generic Supplies"
  | "Dermatology"
  | "Ophthalmology"
  | "ENT"
  | "Gynecology"
  | "Dental"
  | "Physiotherapy"

export interface Supplier {
  id: string
  name: string
  specialty: SupplierSpecialty
  phone: string
  website: string
  logo: string
  supplies: string
}

export interface ListSuppliersParams {
  clinicId?: string
  specialty?: SupplierSpecialty | null
  query?: string
}
