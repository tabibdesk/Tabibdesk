"use client"

import { UserProfileDesktop } from "./UserProfile"
import MobileSidebar from "./MobileSidebar"

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-10 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6 dark:border-gray-800 dark:bg-gray-950">
      {/* Left side - Logo (mobile) or breadcrumb/title (desktop) */}
      <div className="flex items-center gap-x-4">
        {/* Mobile: Show logo */}
        <div className="flex items-center gap-x-2 lg:hidden">
          <span className="flex aspect-square size-7 items-center justify-center rounded bg-primary-600 p-2 text-xs font-medium text-white dark:bg-primary-500">
            TD
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
            TabibDesk
          </span>
        </div>
        
        {/* Desktop: Page title or breadcrumb can go here */}
        <div className="hidden lg:block">
          {/* This can be populated with dynamic page title later */}
        </div>
      </div>

      {/* Right side - User menu and mobile sidebar toggle */}
      <div className="flex items-center gap-x-2">
        <UserProfileDesktop />
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden">
          <MobileSidebar />
        </div>
      </div>
    </header>
  )
}

