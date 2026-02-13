"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  RiComputerLine,
  RiMoonLine,
  RiSunLine,
  RiUserSettingsLine,
  RiLogoutBoxRLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiUser3Line,
} from "@remixicon/react"
import { useTheme } from "next-themes"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useLocale } from "@/contexts/locale-context"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { cx, focusRing } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuContent,
  DropdownMenuSubMenuTrigger,
  DropdownMenuTrigger,
} from "@/components/Dropdown"
import { Tooltip } from "@/components/Tooltip"

interface SidebarUserProfileProps {
  mode: "dropdown" | "inline" | "collapsed"
  align?: "center" | "start" | "end"
  children?: React.ReactNode
}

export function SidebarUserProfile({ mode, align = "start", children }: SidebarUserProfileProps) {
  const router = useRouter()
  const { currentUser, allUsers, setCurrentUser } = useUserClinic()
  const { theme, setTheme } = useTheme()
  const { isRtl } = useLocale()
  const t = useAppTranslations()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSwitchUserOpen, setIsSwitchUserOpen] = React.useState(false)
  const [isThemeOpen, setIsThemeOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("[v0] Sign out error:", error)
      // Fallback redirect even if sign out fails
      router.push("/")
    } finally {
      setIsSigningOut(false)
    }
  }

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const roleLabel =
    currentUser.role === "doctor" ? t.common.doctor :
    currentUser.role === "manager" ? t.common.manager :
    t.common.assistant

  // Desktop modes (Expanded & Collapsed) use Dropdown
  if (mode === "dropdown" || mode === "collapsed") {
    const triggerButton = children ? children : (
      <button
        className={cx(
          "group flex w-full items-center rounded-lg text-sm font-medium transition-colors",
          mode === "collapsed" ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50",
          focusRing
        )}
        aria-label="User settings"
      >
        {mode === "dropdown" ? (
          <>
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
              {currentUser.avatar_initials}
            </div>
            <div className="flex-1 min-w-0 text-start">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                {currentUser.full_name}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {roleLabel}
              </p>
            </div>
          </>
        ) : (
          <div className="flex size-5 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
            {currentUser.avatar_initials}
          </div>
        )}
      </button>
    )

    return (
      <DropdownMenu>
        {mode === "collapsed" ? (
          <Tooltip content={currentUser.full_name} side={isRtl ? "left" : "right"}>
            <DropdownMenuTrigger asChild>
              {triggerButton}
            </DropdownMenuTrigger>
          </Tooltip>
        ) : (
          <DropdownMenuTrigger asChild>
            {triggerButton}
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent
          align={align}
          side={mode === "collapsed" ? (isRtl ? "left" : "right") : "top"}
          className="w-64"
        >
          <DropdownMenuLabel>
            <div className="flex items-center gap-3 px-1 py-1.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                {currentUser.avatar_initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">{currentUser.full_name}</span>
                <span className="truncate text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {allUsers.length > 0 && (
              <>
                <DropdownMenuSubMenu>
                  <DropdownMenuSubMenuTrigger>
                    <RiUserSettingsLine className="size-4 shrink-0 me-2" aria-hidden="true" />
                    {t.common.switchUser}
                  </DropdownMenuSubMenuTrigger>
                  <DropdownMenuSubMenuContent>
                    {allUsers.map((user) => (
                      <DropdownMenuItem
                        key={user.id}
                        onClick={() => setCurrentUser(user.id)}
                        className={user.id === currentUser.id ? "bg-gray-100 dark:bg-gray-800" : ""}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                            {user.avatar_initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{user.full_name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {user.role === "doctor" ? t.common.doctor : user.role === "manager" ? t.common.manager : t.common.assistant}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubMenuContent>
                </DropdownMenuSubMenu>
              </>
            )}
            <DropdownMenuSubMenu>
              <DropdownMenuSubMenuTrigger>
                <RiSunLine className="size-4 shrink-0 me-2" aria-hidden="true" />
                {t.common.theme}
              </DropdownMenuSubMenuTrigger>
              <DropdownMenuSubMenuContent>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light" iconType="check">
                    <RiSunLine className="size-4 shrink-0 me-2" aria-hidden="true" />
                    {t.common.light}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark" iconType="check">
                    <RiMoonLine className="size-4 shrink-0 me-2" aria-hidden="true" />
                    {t.common.dark}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system" iconType="check">
                    <RiComputerLine className="size-4 shrink-0 me-2" aria-hidden="true" />
                    {t.common.system}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubMenuContent>
            </DropdownMenuSubMenu>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-red-600 dark:text-red-400 focus:bg-red-50 focus:dark:bg-red-900/10"
          >
            <RiLogoutBoxRLine className="size-4 shrink-0 me-2" />
            {isSigningOut ? t.common.signingOut || "Signing out..." : t.common.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Inline Mode (Mobile Drawer)
  return (
    <div className="flex flex-col gap-1 w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cx(
          "flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition-colors",
          "hover:bg-gray-100 hover:border-gray-300",
          "dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800 dark:hover:border-gray-700",
          focusRing
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
          {currentUser.avatar_initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
            {currentUser.full_name}
          </p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {roleLabel}
          </p>
        </div>
        {isOpen ? (
          <RiArrowUpSLine className="size-4 shrink-0 text-gray-500" />
        ) : (
          <RiArrowDownSLine className="size-4 shrink-0 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col gap-0.5 ps-3 pt-1">
          {/* Switch User Toggle */}
          {allUsers.length > 0 && (
            <>
              <button
                onClick={() => setIsSwitchUserOpen(!isSwitchUserOpen)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <RiUserSettingsLine className="size-4" />
                  <span>{t.common.switchUser}</span>
                </div>
                <RiArrowDownSLine className={cx("size-4 transition-transform", isSwitchUserOpen && "rotate-180")} />
              </button>
              
              {isSwitchUserOpen && (
                <div className="flex flex-col gap-1 ps-8 py-1">
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setCurrentUser(user.id)}
                      className={cx(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                        user.id === currentUser.id
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      )}
                    >
                      <div className="flex size-5 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                        {user.avatar_initials}
                      </div>
                      <span>{user.full_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <div className="flex items-center gap-2">
              <RiSunLine className="size-4" />
              <span>{t.common.theme}</span>
            </div>
            <RiArrowDownSLine className={cx("size-4 transition-transform", isThemeOpen && "rotate-180")} />
          </button>

          {isThemeOpen && (
            <div className="flex flex-col gap-1 ps-8 py-1">
              {[
                { id: "light", label: "Light", icon: RiSunLine },
                { id: "dark", label: "Dark", icon: RiMoonLine },
                { id: "system", label: "System", icon: RiComputerLine },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={cx(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                    theme === opt.id
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  )}
                >
                  <opt.icon className="size-3.5" />
                  <span>{opt.id === "light" ? t.common.light : opt.id === "dark" ? t.common.dark : t.common.system}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/10"
          >
            <RiLogoutBoxRLine className="size-4" />
            <span>{isSigningOut ? t.common.signingOut || "Signing out..." : t.common.signOut}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export { SidebarUserProfile as DropdownUserProfile }

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const roleLabel =
    currentUser.role === "doctor" ? t.common.doctor :
    currentUser.role === "manager" ? t.common.manager :
    t.common.assistant

  // Desktop modes (Expanded & Collapsed) use Dropdown
  if (mode === "dropdown" || mode === "collapsed") {
    const triggerButton = children ? children : (
      <button
        className={cx(
          "group flex w-full items-center rounded-lg text-sm font-medium transition-colors",
          mode === "collapsed" ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
          "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50",
          focusRing
        )}
        aria-label="User settings"
      >
        {mode === "dropdown" ? (
          <>
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
              {currentUser.avatar_initials}
            </div>
            <div className="flex-1 min-w-0 text-start">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                {currentUser.full_name}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {roleLabel}
              </p>
            </div>
          </>
        ) : (
          <div className="flex size-5 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
            {currentUser.avatar_initials}
          </div>
        )}
      </button>
    )

    return (
      <DropdownMenu>
        {mode === "collapsed" ? (
          <Tooltip content={currentUser.full_name} side={isRtl ? "left" : "right"}>
            <DropdownMenuTrigger asChild>
              {triggerButton}
            </DropdownMenuTrigger>
          </Tooltip>
        ) : (
          <DropdownMenuTrigger asChild>
            {triggerButton}
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent
          align={align}
          side={mode === "collapsed" ? (isRtl ? "left" : "right") : "top"}
          className="w-64"
        >
          <DropdownMenuLabel>
            <div className="flex items-center gap-3 px-1 py-1.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                {currentUser.avatar_initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">{currentUser.full_name}</span>
                <span className="truncate text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSubMenu>
              <DropdownMenuSubMenuTrigger>
                <RiUserSettingsLine className="size-4 shrink-0 me-2" aria-hidden="true" />
                {t.common.switchUser}
              </DropdownMenuSubMenuTrigger>
              <DropdownMenuSubMenuContent>
                {allUsers.map((user) => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => setCurrentUser(user.id)}
                    className={user.id === currentUser.id ? "bg-gray-100 dark:bg-gray-800" : ""}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                        {user.avatar_initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.full_name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {user.role === "doctor" ? t.common.doctor : user.role === "manager" ? t.common.manager : t.common.assistant}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubMenuContent>
            </DropdownMenuSubMenu>
            <DropdownMenuSubMenu>
              <DropdownMenuSubMenuTrigger>
                <RiSunLine className="size-4 shrink-0 me-2" aria-hidden="true" />
                {t.common.theme}
              </DropdownMenuSubMenuTrigger>
              <DropdownMenuSubMenuContent>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light" iconType="check">
                    <RiSunLine className="size-4 shrink-0 me-2" aria-hidden="true" />
                    {t.common.light}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark" iconType="check">
                    <RiMoonLine className="size-4 shrink-0 me-2" aria-hidden="true" />
                    {t.common.dark}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system" iconType="check">
                    <RiComputerLine className="size-4 shrink-0 me-2" aria-hidden="true" />
                    {t.common.system}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubMenuContent>
            </DropdownMenuSubMenu>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="text-red-600 dark:text-red-400 focus:bg-red-50 focus:dark:bg-red-900/10"
          >
            <RiLogoutBoxRLine className="size-4 shrink-0 me-2" />
            {t.common.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Inline Mode (Mobile Drawer)
  return (
    <div className="flex flex-col gap-1 w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cx(
          "flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition-colors",
          "hover:bg-gray-100 hover:border-gray-300",
          "dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800 dark:hover:border-gray-700",
          focusRing
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
          {currentUser.avatar_initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
            {currentUser.full_name}
          </p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {roleLabel}
          </p>
        </div>
        {isOpen ? (
          <RiArrowUpSLine className="size-4 shrink-0 text-gray-500" />
        ) : (
          <RiArrowDownSLine className="size-4 shrink-0 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col gap-0.5 ps-3 pt-1">
          {/* Switch User Toggle */}
          <button
            onClick={() => setIsSwitchUserOpen(!isSwitchUserOpen)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <div className="flex items-center gap-2">
              <RiUserSettingsLine className="size-4" />
              <span>{t.common.switchUser}</span>
            </div>
            <RiArrowDownSLine className={cx("size-4 transition-transform", isSwitchUserOpen && "rotate-180")} />
          </button>
          
          {isSwitchUserOpen && (
            <div className="flex flex-col gap-1 ps-8 py-1">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setCurrentUser(user.id)}
                  className={cx(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                    user.id === currentUser.id
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex size-5 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                    {user.avatar_initials}
                  </div>
                  <span>{user.full_name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <div className="flex items-center gap-2">
              <RiSunLine className="size-4" />
              <span>{t.common.theme}</span>
            </div>
            <RiArrowDownSLine className={cx("size-4 transition-transform", isThemeOpen && "rotate-180")} />
          </button>

          {isThemeOpen && (
            <div className="flex flex-col gap-1 ps-8 py-1">
              {[
                { id: "light", label: "Light", icon: RiSunLine },
                { id: "dark", label: "Dark", icon: RiMoonLine },
                { id: "system", label: "System", icon: RiComputerLine },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={cx(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                    theme === opt.id
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  )}
                >
                  <opt.icon className="size-3.5" />
                  <span>{opt.id === "light" ? t.common.light : opt.id === "dark" ? t.common.dark : t.common.system}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
          >
            <RiLogoutBoxRLine className="size-4" />
            <span>{t.common.signOut}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export { SidebarUserProfile as DropdownUserProfile }
