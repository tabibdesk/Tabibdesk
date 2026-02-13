"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { mockQueries } from "@/data/mock/mock-queries"
import * as mockData from "@/data/mock/mock-data"
import { initializeRepositories, getBackendType, resetRepositories } from "@/lib/api/repository-factory"

interface DemoContextType {
  isDemoMode: boolean
  enableDemoMode: () => void
  disableDemoMode: () => void
  demoDoctor: typeof mockData.mockDoctor
  demoPatients: typeof mockData.mockPatients
  mockQueries: typeof mockQueries
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage to prevent flash of empty state
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("demo-mode")
      return stored === "false" ? false : true
    }
    return true // Default to demo mode for development
  })

  useEffect(() => {
    const storedDemoMode = localStorage.getItem("demo-mode")
    if (storedDemoMode === "false") {
      setIsDemoMode(false)
    } else {
      setIsDemoMode(true)
      if (storedDemoMode === null) {
        localStorage.setItem("demo-mode", "true")
      }
    }
  }, [])

  useEffect(() => {
    const backend = isDemoMode ? "mock" : getBackendType()
    resetRepositories()
    initializeRepositories(backend)
  }, [isDemoMode])

  // Sync cookie when isDemoMode is true so middleware allows dashboard access (e.g. on refresh)
  useEffect(() => {
    if (isDemoMode && typeof document !== "undefined") {
      document.cookie = "demo-mode=true;path=/;max-age=86400;SameSite=Lax"
    }
  }, [isDemoMode])

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true)
    localStorage.setItem("demo-mode", "true")
    // Set cookie so middleware can allow dashboard access (middleware runs server-side, can't read localStorage)
    if (typeof document !== "undefined") {
      document.cookie = "demo-mode=true;path=/;max-age=86400;SameSite=Lax"
    }
  }, [])

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false)
    localStorage.setItem("demo-mode", "false")
    // Clear cookie so middleware enforces auth on next navigation
    if (typeof document !== "undefined") {
      document.cookie = "demo-mode=;path=/;max-age=0;SameSite=Lax"
    }
  }, [])

  const value: DemoContextType = {
    isDemoMode,
    enableDemoMode,
    disableDemoMode,
    demoDoctor: mockData.mockDoctor,
    demoPatients: mockData.mockPatients,
    mockQueries,
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error("useDemo must be used within a DemoProvider")
  }
  return context
}

