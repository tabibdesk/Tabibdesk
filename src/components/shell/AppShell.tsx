"use client"

import { cx } from "@/lib/utils"
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { FloatingBotWidget } from "@/features/insights/FloatingBotWidget"

interface AppShellProps {
  children: React.ReactNode
  role?: "doctor" | "assistant" | "manager" // Optional, will use current user's role if not provided
}

function AppShellContent({ children, role: propRole }: AppShellProps) {
  const { isCollapsed } = useSidebar()
  const { currentUser } = useUserClinic()
  // Use prop role if provided, otherwise use current user's role
  const role = propRole || currentUser.role

  return (
    <div className="flex min-h-screen w-full flex-col bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div
        className={cx(
          "flex flex-1 flex-col w-full transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:ps-16" : "lg:ps-72"
        )}
      >
        <Topbar role={role as "doctor" | "assistant" | "manager"} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="w-full pt-3 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Floating bot widget - available on all app pages */}
      <FloatingBotWidget />
    </div>
  )
}

export function AppShell({ children, role }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellContent role={role}>{children}</AppShellContent>
    </SidebarProvider>
  )
}
