"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Input } from "@/components/Input"
import { mockData } from "@/data/mock/mock-data"
import { useDebounce } from "@/lib/useDebounce"

export interface PatientOption {
  id: string
  displayName: string
  phone?: string
}

interface PatientAutocompleteProps {
  value?: string
  onChange: (displayValue: string) => void
  onSelect?: (patient: PatientOption) => void
  placeholder?: string
  className?: string
}

export function PatientAutocomplete({
  value = "",
  onChange,
  onSelect,
  placeholder = "Search patient by name or phone",
  className,
}: PatientAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedInput = useDebounce(inputValue.trim().toLowerCase(), 250)

  const suggestions = useMemo(() => {
    if (!debouncedInput) return []
    const patients = mockData.patients
    const search = debouncedInput
    return patients
      .filter((p) => {
        const name = `${p.first_name} ${p.last_name}`.toLowerCase()
        const phone = (p.phone || "").toLowerCase()
        return name.includes(search) || phone.includes(search)
      })
      .slice(0, 15)
      .map((p) => ({
        id: p.id,
        displayName: `${p.first_name} ${p.last_name}`,
        phone: p.phone || undefined,
      }))
  }, [debouncedInput])

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setShowSuggestions(true)
  }

  const handleSelect = (patient: PatientOption) => {
    setInputValue(patient.displayName)
    onChange(patient.displayName)
    onSelect?.(patient)
    setShowSuggestions(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true)
        }}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showSuggestions && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {suggestions.length > 0 ? (
            suggestions.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => handleSelect(patient)}
                className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-50 dark:text-gray-50 dark:hover:bg-gray-800"
              >
                <span className="font-medium">{patient.displayName}</span>
                {patient.phone && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">{patient.phone}</span>
                )}
              </button>
            ))
          ) : debouncedInput ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No patients found</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
