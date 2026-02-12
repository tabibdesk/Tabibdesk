/**
 * Repository factory - singleton pattern.
 * Selects backend (mock or supabase) once; implementations are cached.
 */

import type { IPatientsRepository } from "./interfaces/patients.interface"
import type { IAppointmentsRepository } from "./interfaces/appointments.interface"
import type { IAuthRepository } from "./interfaces/auth.interface"
import type { INotesRepository } from "./interfaces/notes.interface"

let patientsRepo: IPatientsRepository | null = null
let appointmentsRepo: IAppointmentsRepository | null = null
let authRepo: IAuthRepository | null = null
let notesRepo: INotesRepository | null = null

export type BackendType = "mock" | "supabase"
let currentBackend: BackendType = "mock"

/**
 * Initialize the repository factory with the desired backend.
 * Call once at app startup or when switching demo mode.
 */
export function initializeRepositories(backend: BackendType = "mock"): void {
  currentBackend = backend
  patientsRepo = null
  appointmentsRepo = null
  authRepo = null
  notesRepo = null
}

/**
 * Get backend type: mock when demo mode or Supabase not configured; otherwise supabase.
 */
export function getBackendType(): BackendType {
  const isSupabaseConfigured = !!(
    typeof process !== "undefined" &&
    process.env?.NEXT_PUBLIC_SUPABASE_URL &&
    process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  if (typeof window !== "undefined") {
    const isDemoMode = localStorage.getItem("demo-mode") === "true"
    if (isDemoMode) return "mock"
  }
  return isSupabaseConfigured ? "supabase" : "mock"
}

export async function getPatientsRepository(): Promise<IPatientsRepository> {
  if (patientsRepo) return patientsRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabasePatientsRepository } = await import(
        "./implementations/supabase/patients"
      )
      patientsRepo = new SupabasePatientsRepository()
    } catch {
      const { MockPatientsRepository } = await import(
        "./implementations/mock/patients"
      )
      patientsRepo = new MockPatientsRepository()
    }
  } else {
    const { MockPatientsRepository } = await import(
      "./implementations/mock/patients"
    )
    patientsRepo = new MockPatientsRepository()
  }
  return patientsRepo
}

export async function getAppointmentsRepository(): Promise<IAppointmentsRepository> {
  if (appointmentsRepo) return appointmentsRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseAppointmentsRepository } = await import(
        "./implementations/supabase/appointments"
      )
      appointmentsRepo = new SupabaseAppointmentsRepository()
    } catch {
      const { MockAppointmentsRepository } = await import(
        "./implementations/mock/appointments"
      )
      appointmentsRepo = new MockAppointmentsRepository()
    }
  } else {
    const { MockAppointmentsRepository } = await import(
      "./implementations/mock/appointments"
    )
    appointmentsRepo = new MockAppointmentsRepository()
  }
  return appointmentsRepo
}

export async function getAuthRepository(): Promise<IAuthRepository> {
  if (authRepo) return authRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseAuthRepository } = await import(
        "./implementations/supabase/auth"
      )
      authRepo = new SupabaseAuthRepository()
    } catch {
      const { MockAuthRepository } = await import(
        "./implementations/mock/auth"
      )
      authRepo = new MockAuthRepository()
    }
  } else {
    const { MockAuthRepository } = await import("./implementations/mock/auth")
    authRepo = new MockAuthRepository()
  }
  return authRepo!
}

export async function getNotesRepository(): Promise<INotesRepository> {
  if (notesRepo) return notesRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseNotesRepository } = await import(
        "./implementations/supabase/notes"
      )
      notesRepo = new SupabaseNotesRepository()
    } catch {
      const { MockNotesRepository } = await import(
        "./implementations/mock/notes"
      )
      notesRepo = new MockNotesRepository()
    }
  } else {
    const { MockNotesRepository } = await import(
      "./implementations/mock/notes"
    )
    notesRepo = new MockNotesRepository()
  }
  return notesRepo
}

/** Reset singletons (e.g. for tests or backend switch). */
export function resetRepositories(): void {
  patientsRepo = null
  appointmentsRepo = null
  authRepo = null
  notesRepo = null
}
