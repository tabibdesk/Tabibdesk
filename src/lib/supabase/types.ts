export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string
          plan_tier: string
          owner_id: string
          status: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan_tier: string
          owner_id: string
          status?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan_tier?: string
          owner_id?: string
          status?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clinic_members: {
        Row: {
          id: string
          user_id: string
          clinic_id: string
          role: string
          invited_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          clinic_id: string
          role: string
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          clinic_id?: string
          role?: string
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clinics: {
        Row: {
          id: string
          subscription_id: string
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
          subscription_id: string
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
          subscription_id?: string
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
          address: string | null
          age: number | null
          height: number | null
          complaint: string | null
          job: string | null
          social_status: string | null
          source: string | null
          source_other: string | null
          status: string | null
          doctor_id: string | null
          first_visit_at: string | null
          last_visit_at: string | null
          last_activity_at: string | null
          is_cold: boolean | null
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
          address?: string | null
          age?: number | null
          height?: number | null
          complaint?: string | null
          job?: string | null
          social_status?: string | null
          source?: string | null
          source_other?: string | null
          status?: string | null
          doctor_id?: string | null
          first_visit_at?: string | null
          last_visit_at?: string | null
          last_activity_at?: string | null
          is_cold?: boolean | null
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
          address?: string | null
          age?: number | null
          height?: number | null
          complaint?: string | null
          job?: string | null
          social_status?: string | null
          source?: string | null
          source_other?: string | null
          status?: string | null
          doctor_id?: string | null
          first_visit_at?: string | null
          last_visit_at?: string | null
          last_activity_at?: string | null
          is_cold?: boolean | null
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
          doctor_id: string | null
          type: string | null
          patient_name: string | null
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
          doctor_id?: string | null
          type?: string | null
          patient_name?: string | null
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
          doctor_id?: string | null
          type?: string | null
          patient_name?: string | null
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
