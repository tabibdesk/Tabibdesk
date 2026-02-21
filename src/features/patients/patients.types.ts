export type PatientStatus = "inactive" | "active" | "lost"

export interface Patient {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  age: number | null
  gender: string
  phone: string
  email: string | null
  address: string | null
  height: number | null
  complaint: string | null
  job: string | null
  social_status?: string | null
  source?: string | null
  source_other?: string | null
  doctor_id: string | null
  status: PatientStatus
  first_visit_at: string | null
  last_visit_at: string | null
  last_activity_at?: string | null
  is_cold?: boolean
  /** Lead lifecycle: active, cold, lapsed, recovered */
  lead_status?: "active" | "cold" | "lapsed" | "recovered" | null
  /** Last meaningful touchpoint */
  last_interaction_date?: string | null
  /** Reason lead was lost (e.g. Price, Distance, No Response) */
  lost_reason?: string | null
  /** Excluded from automated reactivation messages */
  opt_out_reactivation?: boolean | null
  /** Medical conditions (configurable in Settings > Patient) */
  is_diabetic?: boolean | null
  is_hypertensive?: boolean | null
  has_pancreatitis?: boolean | null
  has_gerd?: boolean | null
  has_gastritis?: boolean | null
  has_hepatic?: boolean | null
  has_anaemia?: boolean | null
  has_bronchial_asthma?: boolean | null
  has_rheumatoid?: boolean | null
  has_ihd?: boolean | null
  has_heart_failure?: boolean | null
  is_pregnant?: boolean | null
  is_breastfeeding?: boolean | null
  glp1a_previous_exposure?: boolean | null
  created_at: string
  updated_at: string
}

export interface PatientListItem extends Patient {
  lastAppointmentDate: string | null
}

export interface ListPatientsParams {
  clinicId?: string
  page: number
  pageSize: number
  query?: string
  status?: PatientStatus
  /** Filter by first_visit_at in range (for leads / new patients) */
  firstVisitFrom?: string
  firstVisitTo?: string
}

export interface ListPatientsResponse {
  patients: PatientListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface CreatePatientInput {
  first_name: string
  last_name: string
  phone: string
  email?: string
  gender?: string
  source?: string
  source_other?: string
  address?: string
  complaint?: string
  social_status?: string
}
