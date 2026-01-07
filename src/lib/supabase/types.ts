export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      patients: {
        Row: {
          id: string
          clinic_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          scheduled_at: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          scheduled_at: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          scheduled_at?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      visits: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          appointment_id: string | null
          visit_date: string
          diagnosis: string | null
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          appointment_id?: string | null
          visit_date: string
          diagnosis?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          appointment_id?: string | null
          visit_date?: string
          diagnosis?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
  }
}

