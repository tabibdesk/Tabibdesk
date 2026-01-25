import type { RemixiconComponentType } from "@remixicon/react"
import {
  RiHomeLine,
  RiUserLine,
  RiCalendarLine,
  RiSettingsLine,
  RiUserSearchLine,
  RiTaskLine,
  RiBarChartLine,
  RiMoneyDollarCircleLine,
  RiArchiveLine,
  RiHistoryLine,
} from "@remixicon/react"
import type { FeatureKey } from "@/features/settings/settings.types"

export type NavItem = {
  name: string
  href: string
  icon: RemixiconComponentType
  badge?: number
  featureKey?: FeatureKey
}

export type Role = "doctor" | "assistant" | "manager"

export const doctorNavigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: RiHomeLine },
  { name: "Patients", href: "/patients", icon: RiUserLine, featureKey: "patients" },
  { name: "Appointments", href: "/appointments", icon: RiCalendarLine, featureKey: "appointments" },
  { name: "Insights", href: "/insights", icon: RiBarChartLine, featureKey: "insights" },
  { name: "Tasks", href: "/tasks", icon: RiTaskLine, featureKey: "tasks" },
  { name: "Archive", href: "/archive", icon: RiArchiveLine },
  { name: "Activity", href: "/activity", icon: RiHistoryLine },
  { name: "Accounting", href: "/accounting", icon: RiMoneyDollarCircleLine, featureKey: "accounting" },
  { name: "Settings", href: "/settings", icon: RiSettingsLine },
]

export const assistantNavigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: RiHomeLine },
  { name: "Leads", href: "/assistant/leads", icon: RiUserSearchLine },
  { name: "Appointments", href: "/appointments", icon: RiCalendarLine, featureKey: "appointments" },
  { name: "Insights", href: "/insights", icon: RiBarChartLine, featureKey: "insights" },
  { name: "Tasks", href: "/tasks", icon: RiTaskLine, featureKey: "tasks" },
  { name: "Archive", href: "/archive", icon: RiArchiveLine },
  { name: "Activity", href: "/activity", icon: RiHistoryLine },
  { name: "Accounting", href: "/accounting", icon: RiMoneyDollarCircleLine, featureKey: "accounting" },
  { name: "Settings", href: "/settings", icon: RiSettingsLine },
]

export const managerNavigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: RiHomeLine },
  { name: "Patients", href: "/patients", icon: RiUserLine, featureKey: "patients" },
  { name: "Appointments", href: "/appointments", icon: RiCalendarLine, featureKey: "appointments" },
  { name: "Insights", href: "/insights", icon: RiBarChartLine, featureKey: "insights" },
  { name: "Tasks", href: "/tasks", icon: RiTaskLine, featureKey: "tasks" },
  { name: "Archive", href: "/archive", icon: RiArchiveLine },
  { name: "Activity", href: "/activity", icon: RiHistoryLine },
  { name: "Accounting", href: "/accounting", icon: RiMoneyDollarCircleLine, featureKey: "accounting" },
  { name: "Settings", href: "/settings", icon: RiSettingsLine },
]

export function getNavigationForRole(role: Role): NavItem[] {
  if (role === "doctor") return doctorNavigation
  if (role === "manager") return managerNavigation
  return assistantNavigation
}

export function isActiveRoute(itemHref: string, pathname: string): boolean {
  if (itemHref === "/dashboard") {
    return pathname === "/dashboard"
  }
  if (itemHref === "/tasks") {
    return pathname === "/tasks"
  }
  if (itemHref === "/insights") {
    return pathname === "/insights"
  }
  return pathname.startsWith(itemHref)
}
