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
  RiRobot2Line,
} from "@remixicon/react"
import type { FeatureKey } from "@/features/settings/settings.types"

export type NavKey = "dashboard" | "patients" | "appointments" | "insights" | "bot" | "tasks" | "accounting" | "archive" | "settings"

export type NavItem = {
  name: string // fallback for non-translated contexts
  navKey: NavKey
  href: string
  icon: RemixiconComponentType
  badge?: number
  featureKey?: FeatureKey
}

export type Role = "doctor" | "assistant" | "manager"

export const doctorNavigation: NavItem[] = [
  { name: "Dashboard", navKey: "dashboard", href: "/dashboard", icon: RiHomeLine },
  { name: "Patients", navKey: "patients", href: "/patients", icon: RiUserLine, featureKey: "patients" },
  { name: "Appointments", navKey: "appointments", href: "/appointments", icon: RiCalendarLine, featureKey: "appointments" },
  { name: "Insights", navKey: "insights", href: "/insights", icon: RiBarChartLine, featureKey: "insights" },
  { name: "Bot", navKey: "bot", href: "/bot", icon: RiRobot2Line },
  { name: "Tasks", navKey: "tasks", href: "/tasks", icon: RiTaskLine, featureKey: "tasks" },
  { name: "Accounting", navKey: "accounting", href: "/accounting", icon: RiMoneyDollarCircleLine, featureKey: "accounting" },
  { name: "Archive", navKey: "archive", href: "/archive", icon: RiArchiveLine },
  { name: "Settings", navKey: "settings", href: "/settings", icon: RiSettingsLine },
]

export const assistantNavigation: NavItem[] = [
  { name: "Dashboard", navKey: "dashboard", href: "/dashboard", icon: RiHomeLine },
  { name: "Appointments", navKey: "appointments", href: "/appointments", icon: RiCalendarLine, featureKey: "appointments" },
  { name: "Insights", navKey: "insights", href: "/insights", icon: RiBarChartLine, featureKey: "insights" },
  { name: "Bot", navKey: "bot", href: "/bot", icon: RiRobot2Line },
  { name: "Tasks", navKey: "tasks", href: "/tasks", icon: RiTaskLine, featureKey: "tasks" },
  { name: "Accounting", navKey: "accounting", href: "/accounting", icon: RiMoneyDollarCircleLine, featureKey: "accounting" },
  { name: "Archive", navKey: "archive", href: "/archive", icon: RiArchiveLine },
  { name: "Settings", navKey: "settings", href: "/settings", icon: RiSettingsLine },
]

export const managerNavigation: NavItem[] = [
  { name: "Dashboard", navKey: "dashboard", href: "/dashboard", icon: RiHomeLine },
  { name: "Patients", navKey: "patients", href: "/patients", icon: RiUserLine, featureKey: "patients" },
  { name: "Appointments", navKey: "appointments", href: "/appointments", icon: RiCalendarLine, featureKey: "appointments" },
  { name: "Insights", navKey: "insights", href: "/insights", icon: RiBarChartLine, featureKey: "insights" },
  { name: "Bot", navKey: "bot", href: "/bot", icon: RiRobot2Line },
  { name: "Tasks", navKey: "tasks", href: "/tasks", icon: RiTaskLine, featureKey: "tasks" },
  { name: "Accounting", navKey: "accounting", href: "/accounting", icon: RiMoneyDollarCircleLine, featureKey: "accounting" },
  { name: "Archive", navKey: "archive", href: "/archive", icon: RiArchiveLine },
  { name: "Settings", navKey: "settings", href: "/settings", icon: RiSettingsLine },
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
  if (itemHref === "/bot") {
    return pathname === "/bot"
  }
  return pathname.startsWith(itemHref)
}
