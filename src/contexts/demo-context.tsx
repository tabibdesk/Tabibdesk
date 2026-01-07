"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { mockQueries } from "@/data/mock/mock-queries"
import * as mockData from "@/data/mock/mock-data"

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
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    const storedDemoMode = localStorage.getItem("demo-mode")
    if (storedDemoMode === "true") {
      setIsDemoMode(true)
    }
  }, [])

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true)
    localStorage.setItem("demo-mode", "true")
  }, [])

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false)
    localStorage.removeItem("demo-mode")
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

