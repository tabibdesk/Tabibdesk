/**
 * Repository factory - singleton pattern.
 * Selects backend (mock or supabase) once; implementations are cached.
 */

import type { IPatientsRepository } from "./interfaces/patients.interface"
import type { IAppointmentsRepository } from "./interfaces/appointments.interface"
import type { IAuthRepository } from "./interfaces/auth.interface"
import type { INotesRepository } from "./interfaces/notes.interface"
import type { ITasksRepository } from "./interfaces/tasks.interface"
import type { IInvoicesRepository } from "./interfaces/invoices.interface"
import type { IPaymentsRepository } from "./interfaces/payments.interface"
import type { IExpensesRepository } from "./interfaces/expenses.interface"
import type { IVendorsRepository } from "./interfaces/vendors.interface"
import type { IPrescriptionsRepository } from "./interfaces/prescriptions.interface"
import type { IActivityRepository } from "./interfaces/activity.interface"
import type { IAttachmentsRepository } from "./interfaces/attachments.interface"
import type { ISettingsRepository } from "./interfaces/settings.interface"
import type { IAvailabilityRepository } from "./interfaces/availability.interface"
import type { IWaitlistRepository } from "./interfaces/waitlist.interface"
import type { IProgressRepository } from "./interfaces/progress.interface"
import type { IDraftDuesRepository } from "./interfaces/draft-dues.interface"
import type { IPricingRepository } from "./interfaces/pricing.interface"

let patientsRepo: IPatientsRepository | null = null
let appointmentsRepo: IAppointmentsRepository | null = null
let authRepo: IAuthRepository | null = null
let notesRepo: INotesRepository | null = null
let tasksRepo: ITasksRepository | null = null
let invoicesRepo: IInvoicesRepository | null = null
let paymentsRepo: IPaymentsRepository | null = null
let expensesRepo: IExpensesRepository | null = null
let vendorsRepo: IVendorsRepository | null = null
let prescriptionsRepo: IPrescriptionsRepository | null = null
let activityRepo: IActivityRepository | null = null
let attachmentsRepo: IAttachmentsRepository | null = null
let settingsRepo: ISettingsRepository | null = null
let availabilityRepo: IAvailabilityRepository | null = null
let waitlistRepo: IWaitlistRepository | null = null
let progressRepo: IProgressRepository | null = null
let draftDuesRepo: IDraftDuesRepository | null = null
let pricingRepo: IPricingRepository | null = null

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
  tasksRepo = null
  invoicesRepo = null
  paymentsRepo = null
  expensesRepo = null
  vendorsRepo = null
  prescriptionsRepo = null
  activityRepo = null
  attachmentsRepo = null
  settingsRepo = null
  availabilityRepo = null
  waitlistRepo = null
  progressRepo = null
  draftDuesRepo = null
  pricingRepo = null
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

export async function getTasksRepository(): Promise<ITasksRepository> {
  if (tasksRepo) return tasksRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseTasksRepository } = await import(
        "./implementations/supabase/tasks"
      )
      tasksRepo = new SupabaseTasksRepository()
    } catch {
      const { MockTasksRepository } = await import(
        "./implementations/mock/tasks"
      )
      tasksRepo = new MockTasksRepository()
    }
  } else {
    const { MockTasksRepository } = await import(
      "./implementations/mock/tasks"
    )
    tasksRepo = new MockTasksRepository()
  }
  return tasksRepo
}

export async function getInvoicesRepository(): Promise<IInvoicesRepository> {
  if (invoicesRepo) return invoicesRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseInvoicesRepository } = await import(
        "./implementations/supabase/invoices"
      )
      invoicesRepo = new SupabaseInvoicesRepository()
    } catch {
      const { MockInvoicesRepository } = await import(
        "./implementations/mock/invoices"
      )
      invoicesRepo = new MockInvoicesRepository()
    }
  } else {
    const { MockInvoicesRepository } = await import(
      "./implementations/mock/invoices"
    )
    invoicesRepo = new MockInvoicesRepository()
  }
  return invoicesRepo
}

export async function getPaymentsRepository(): Promise<IPaymentsRepository> {
  if (paymentsRepo) return paymentsRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabasePaymentsRepository } = await import(
        "./implementations/supabase/payments"
      )
      paymentsRepo = new SupabasePaymentsRepository()
    } catch {
      const { MockPaymentsRepository } = await import(
        "./implementations/mock/payments"
      )
      paymentsRepo = new MockPaymentsRepository()
    }
  } else {
    const { MockPaymentsRepository } = await import(
      "./implementations/mock/payments"
    )
    paymentsRepo = new MockPaymentsRepository()
  }
  return paymentsRepo
}

export async function getExpensesRepository(): Promise<IExpensesRepository> {
  if (expensesRepo) return expensesRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseExpensesRepository } = await import(
        "./implementations/supabase/expenses"
      )
      expensesRepo = new SupabaseExpensesRepository()
    } catch {
      const { MockExpensesRepository } = await import(
        "./implementations/mock/expenses"
      )
      expensesRepo = new MockExpensesRepository()
    }
  } else {
    const { MockExpensesRepository } = await import(
      "./implementations/mock/expenses"
    )
    expensesRepo = new MockExpensesRepository()
  }
  return expensesRepo
}

export async function getVendorsRepository(): Promise<IVendorsRepository> {
  if (vendorsRepo) return vendorsRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseVendorsRepository } = await import(
        "./implementations/supabase/vendors"
      )
      vendorsRepo = new SupabaseVendorsRepository()
    } catch {
      const { MockVendorsRepository } = await import(
        "./implementations/mock/vendors"
      )
      vendorsRepo = new MockVendorsRepository()
    }
  } else {
    const { MockVendorsRepository } = await import(
      "./implementations/mock/vendors"
    )
    vendorsRepo = new MockVendorsRepository()
  }
  return vendorsRepo
}

export async function getPrescriptionsRepository(): Promise<IPrescriptionsRepository> {
  if (prescriptionsRepo) return prescriptionsRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabasePrescriptionsRepository } = await import(
        "./implementations/supabase/prescriptions"
      )
      prescriptionsRepo = new SupabasePrescriptionsRepository()
    } catch {
      const { MockPrescriptionsRepository } = await import(
        "./implementations/mock/prescriptions"
      )
      prescriptionsRepo = new MockPrescriptionsRepository()
    }
  } else {
    const { MockPrescriptionsRepository } = await import(
      "./implementations/mock/prescriptions"
    )
    prescriptionsRepo = new MockPrescriptionsRepository()
  }
  return prescriptionsRepo
}

export async function getActivityRepository(): Promise<IActivityRepository> {
  if (activityRepo) return activityRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseActivityRepository } = await import(
        "./implementations/supabase/activity"
      )
      activityRepo = new SupabaseActivityRepository()
    } catch {
      const { MockActivityRepository } = await import(
        "./implementations/mock/activity"
      )
      activityRepo = new MockActivityRepository()
    }
  } else {
    const { MockActivityRepository } = await import(
      "./implementations/mock/activity"
    )
    activityRepo = new MockActivityRepository()
  }
  return activityRepo
}

export async function getAttachmentsRepository(): Promise<IAttachmentsRepository> {
  if (attachmentsRepo) return attachmentsRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseAttachmentsRepository } = await import(
        "./implementations/supabase/attachments"
      )
      attachmentsRepo = new SupabaseAttachmentsRepository()
    } catch {
      const { MockAttachmentsRepository } = await import(
        "./implementations/mock/attachments"
      )
      attachmentsRepo = new MockAttachmentsRepository()
    }
  } else {
    const { MockAttachmentsRepository } = await import(
      "./implementations/mock/attachments"
    )
    attachmentsRepo = new MockAttachmentsRepository()
  }
  return attachmentsRepo
}

export async function getSettingsRepository(): Promise<ISettingsRepository> {
  if (settingsRepo) return settingsRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseSettingsRepository } = await import(
        "./implementations/supabase/settings"
      )
      settingsRepo = new SupabaseSettingsRepository()
    } catch {
      const { MockSettingsRepository } = await import(
        "./implementations/mock/settings"
      )
      settingsRepo = new MockSettingsRepository()
    }
  } else {
    const { MockSettingsRepository } = await import(
      "./implementations/mock/settings"
    )
    settingsRepo = new MockSettingsRepository()
  }
  return settingsRepo
}

export async function getAvailabilityRepository(): Promise<IAvailabilityRepository> {
  if (availabilityRepo) return availabilityRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseAvailabilityRepository } = await import(
        "./implementations/supabase/availability"
      )
      availabilityRepo = new SupabaseAvailabilityRepository()
    } catch {
      const { MockAvailabilityRepository } = await import(
        "./implementations/mock/availability"
      )
      availabilityRepo = new MockAvailabilityRepository()
    }
  } else {
    const { MockAvailabilityRepository } = await import(
      "./implementations/mock/availability"
    )
    availabilityRepo = new MockAvailabilityRepository()
  }
  return availabilityRepo
}

export async function getWaitlistRepository(): Promise<IWaitlistRepository> {
  if (waitlistRepo) return waitlistRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseWaitlistRepository } = await import(
        "./implementations/supabase/waitlist"
      )
      waitlistRepo = new SupabaseWaitlistRepository()
    } catch {
      const { MockWaitlistRepository } = await import(
        "./implementations/mock/waitlist"
      )
      waitlistRepo = new MockWaitlistRepository()
    }
  } else {
    const { MockWaitlistRepository } = await import(
      "./implementations/mock/waitlist"
    )
    waitlistRepo = new MockWaitlistRepository()
  }
  return waitlistRepo
}

export async function getProgressRepository(): Promise<IProgressRepository> {
  if (progressRepo) return progressRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseProgressRepository } = await import(
        "./implementations/supabase/progress"
      )
      progressRepo = new SupabaseProgressRepository()
    } catch {
      const { MockProgressRepository } = await import(
        "./implementations/mock/progress"
      )
      progressRepo = new MockProgressRepository()
    }
  } else {
    const { MockProgressRepository } = await import(
      "./implementations/mock/progress"
    )
    progressRepo = new MockProgressRepository()
  }
  return progressRepo
}

export async function getDraftDuesRepository(): Promise<IDraftDuesRepository> {
  if (draftDuesRepo) return draftDuesRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabaseDraftDuesRepository } = await import(
        "./implementations/supabase/draft-dues"
      )
      draftDuesRepo = new SupabaseDraftDuesRepository()
    } catch {
      const { MockDraftDuesRepository } = await import(
        "./implementations/mock/draft-dues"
      )
      draftDuesRepo = new MockDraftDuesRepository()
    }
  } else {
    const { MockDraftDuesRepository } = await import(
      "./implementations/mock/draft-dues"
    )
    draftDuesRepo = new MockDraftDuesRepository()
  }
  return draftDuesRepo
}

export async function getPricingRepository(): Promise<IPricingRepository> {
  if (pricingRepo) return pricingRepo
  if (currentBackend === "supabase") {
    try {
      const { SupabasePricingRepository } = await import(
        "./implementations/supabase/pricing"
      )
      pricingRepo = new SupabasePricingRepository()
    } catch {
      const { MockPricingRepository } = await import(
        "./implementations/mock/pricing"
      )
      pricingRepo = new MockPricingRepository()
    }
  } else {
    const { MockPricingRepository } = await import(
      "./implementations/mock/pricing"
    )
    pricingRepo = new MockPricingRepository()
  }
  return pricingRepo
}

/** Reset singletons (e.g. for tests or backend switch). */
export function resetRepositories(): void {
  patientsRepo = null
  appointmentsRepo = null
  authRepo = null
  notesRepo = null
  tasksRepo = null
  invoicesRepo = null
  paymentsRepo = null
  expensesRepo = null
  vendorsRepo = null
  prescriptionsRepo = null
  activityRepo = null
  attachmentsRepo = null
  settingsRepo = null
  availabilityRepo = null
  waitlistRepo = null
  progressRepo = null
  draftDuesRepo = null
  pricingRepo = null
}

