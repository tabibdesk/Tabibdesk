import type { RemixiconComponentType } from "@remixicon/react"
import {
  RiHomeLine,
  RiUserLine,
  RiCalendarLine,
  RiSettingsLine,
  RiTaskLine,
  RiBarChartLine,
  RiMoneyDollarCircleLine,
  RiArchiveLine,
  RiMegaphoneLine,
  RiShoppingBagLine,
  RiRobot2Line,
  RiWebhookLine,
} from "@remixicon/react"
import type { FeatureKey } from "@/features/settings/settings.types"

export type NavKey = "home" | "patients" | "appointments" | "campaign" | "leads" | "bot" | "insights" | "tasks" | "accounting" | "suppliers" | "archive" | "automations" | "settings"

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
  { name: "Home", navKey: "home", href: "/home", icon: RiHomeLine },
  { name: "Patients", navKey: "patients", href: "/patients", icon: RiUserLine, featureKey: "patients" },
  { name: "Appointments", navKey: "appointments", href: "/appointments", icon: RiCalendarLine, featureKey: "appointments" },
  { name: "Leads", navKey: "leads", href: "/leads", icon: RiMegaphoneLine, featureKey: "campaign" },
  { name: "Tasks", navKey: "tasks", href: "/tasks", icon: RiTaskLine, featureKey: "tasks" },
  { name: "Accounting", navKey: "accounting", href: "/accounting", icon: RiMoneyDollarCircleLine, featureKey: "accounting" },
  { name: "Bot", navKey: "bot", href: "/bot", icon: RiRobot2Line },
  { name: "Insights", navKey: "insights", href: "/insights", icon: RiBarChartLine, featureKey: "insights" },
  { name: "Archive", navKey: "archive", href: "/archive", icon: RiArchiveLine },
  { name: "Suppliers", navKey: "suppliers", href: "/suppliers", icon: RiShoppingBagLine },
  { name: "Automations", navKey: "automations", href: "/automations", icon: RiWebhookLine },
  { name: "Settings", navKey: "settings", href: "/settings", icon: RiSettingsLine },
]

export const assistantNavigation: NavItem[] = [
  { name: "Home", navKey: "home", href: "/home", icon: RiHomeLine },
  { name: "Appointments", navKey: "appointments", href: "/appointments", icon: RiCalendarLine, featureKey: "appointments" },
  { name: "Leads", navKey: "leads", href: "/leads", icon: RiMegaphoneLine, featureKey: "campaign" },
  { name: "Tasks", navKey: "tasks", href: "/tasks", icon: RiTaskLine, featureKey: "tasks" },
  { name: "Accounting", navKey: "accounting", href: "/accounting", icon: RiMoneyDollarCircleLine, featureKey: "accounting" },
  { name: "Bot", navKey: "bot", href: "/bot", icon: RiRobot2Line },
  { name: "Insights", navKey: "insights", href: "/insights", icon: RiBarChartLine, featureKey: "insights" },
  { name: "Archive", navKey: "archive", href: "/archive", icon: RiArchiveLine },
  { name: "Suppliers", navKey: "suppliers", href: "/suppliers", icon: RiShoppingBagLine },
  { name: "Automations", navKey: "automations", href: "/automations", icon: RiWebhookLine },
  { name: "Settings", navKey: "settings", href: "/settings", icon: RiSettingsLine },
]

export const managerNavigation: NavItem[] = [
  { name: "Home", navKey: "home", href: "/home", icon: RiHomeLine },
  { name: "Patients", navKey: "patients", href: "/patients", icon: RiUserLine, featureKey: "patients" },
  { name: "Appointments", navKey: "appointments", href: "/appointments", icon: RiCalendarLine, featureKey: "appointments" },
  { name: "Leads", navKey: "leads", href: "/leads", icon: RiMegaphoneLine, featureKey: "campaign" },
  { name: "Tasks", navKey: "tasks", href: "/tasks", icon: RiTaskLine, featureKey: "tasks" },
  { name: "Accounting", navKey: "accounting", href: "/accounting", icon: RiMoneyDollarCircleLine, featureKey: "accounting" },
  { name: "Bot", navKey: "bot", href: "/bot", icon: RiRobot2Line },
  { name: "Insights", navKey: "insights", href: "/insights", icon: RiBarChartLine, featureKey: "insights" },
  { name: "Archive", navKey: "archive", href: "/archive", icon: RiArchiveLine },
  { name: "Suppliers", navKey: "suppliers", href: "/suppliers", icon: RiShoppingBagLine },
  { name: "Automations", navKey: "automations", href: "/automations", icon: RiWebhookLine },
  { name: "Settings", navKey: "settings", href: "/settings", icon: RiSettingsLine },
]

export function getNavigationForRole(role: Role): NavItem[] {
  if (role === "doctor") return doctorNavigation
  if (role === "manager") return managerNavigation
  return assistantNavigation
}

export function isActiveRoute(itemHref: string, pathname: string): boolean {
  if (itemHref === "/home") {
    return pathname === "/home"
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
  if (itemHref === "/leads") {
    return pathname.startsWith("/leads")
  }
  return pathname.startsWith(itemHref)
}
