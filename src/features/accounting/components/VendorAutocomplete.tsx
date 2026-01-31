"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/Input"
import { suggestVendors, createVendor } from "@/api/vendors.api"
import type { Vendor } from "@/types/vendor"
import { useDebounce } from "@/lib/useDebounce"

interface VendorAutocompleteProps {
  clinicId: string
  value?: string
  onChange: (vendorName: string) => void
  onSelect?: (vendor: Vendor) => void
  /** Phone to use when creating a new vendor (e.g. from parent form) */
  createVendorPhone?: string
  placeholder?: string
  className?: string
}

export function VendorAutocomplete({
  clinicId,
  value = "",
  onChange,
  onSelect,
  createVendorPhone,
  placeholder = "Type to search or add new vendor",
  className,
}: VendorAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<Vendor[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedInput = useDebounce(inputValue, 300)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    async function fetchSuggestions() {
      if (!clinicId) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoading(true)
      try {
        const results = await suggestVendors({
          clinicId,
          input: debouncedInput,
        })
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch (error) {
        console.error("Failed to fetch vendor suggestions:", error)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedInput, clinicId])

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

  const handleSelectSuggestion = async (vendor: Vendor) => {
    setInputValue(vendor.name)
    onChange(vendor.name)
    onSelect?.(vendor)
    setShowSuggestions(false)
  }

  const handleCreateNew = async () => {
    if (!inputValue.trim()) return

    try {
      const newVendor = await createVendor({
        clinicId,
        name: inputValue.trim(),
        phone: createVendorPhone?.trim() || undefined,
      })
      setInputValue(newVendor.name)
      onChange(newVendor.name)
      onSelect?.(newVendor)
      setShowSuggestions(false)
    } catch (error) {
      console.error("Failed to create vendor:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !showSuggestions && inputValue.trim()) {
      handleCreateNew()
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
      />

      {showSuggestions && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((vendor) => (
                <button
                  key={vendor.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(vendor)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 dark:text-gray-50 dark:hover:bg-gray-800"
                >
                  <span className="block font-medium">{vendor.name}</span>
                  {vendor.phone && (
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {vendor.phone}
                    </span>
                  )}
                </button>
              ))}
              {inputValue.trim() && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="w-full px-4 py-2 text-left text-sm text-primary-600 hover:bg-gray-50 dark:text-primary-400 dark:hover:bg-gray-800"
                  >
                    + Add &quot;{inputValue.trim()}&quot;
                  </button>
                </div>
              )}
            </>
          ) : inputValue.trim() ? (
            <button
              type="button"
              onClick={handleCreateNew}
              className="w-full px-4 py-2 text-left text-sm text-primary-600 hover:bg-gray-50 dark:text-primary-400 dark:hover:bg-gray-800"
            >
              + Add &quot;{inputValue.trim()}&quot;
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
