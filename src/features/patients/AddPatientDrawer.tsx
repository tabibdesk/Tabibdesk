"use client"

import { useAppTranslations } from "@/lib/useAppTranslations"
import { useLocale } from "@/contexts/locale-context"
import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"
import { useState } from "react"
import type { CreatePatientInput } from "./patients.types"
import { PatientFormFields, type PatientFormData } from "./PatientFormFields"

interface AddPatientDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreatePatientInput) => Promise<void>
}

export function AddPatientDrawer({ open, onOpenChange, onSubmit }: AddPatientDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const [formData, setFormData] = useState<PatientFormData>({
    first_name: "",
    last_name: "",
    phone: "",
    email: undefined,
    gender: "",
    source: undefined,
    source_other: undefined,
    address: undefined,
    complaint: undefined,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePatientInput, string>>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Partial<Record<keyof CreatePatientInput, string>> = {}
    if (!formData.first_name.trim()) {
      newErrors.first_name = t.patients.errFirstNameRequired
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = t.patients.errLastNameRequired
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t.patients.errPhoneRequired
    }
    if (formData.source === "other" && !formData.source_other?.trim()) {
      newErrors.source_other = t.patients.errSpecifySource
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      // Convert PatientFormData to CreatePatientInput
      const submitData: CreatePatientInput = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: formData.email || undefined,
        gender: formData.gender || undefined,
        source: formData.source || undefined,
        source_other: formData.source === "other" ? formData.source_other : undefined,
        address: formData.address || undefined,
        complaint: formData.complaint || undefined,
      }
      await onSubmit(submitData)
      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        phone: "",
        email: undefined,
        gender: "",
        source: undefined,
        source_other: undefined,
        address: undefined,
        complaint: undefined,
      })
      setErrors({})
      onOpenChange(false)
    } catch (error) {
      // Error handling would go here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>{t.patients.addNewPatient}</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <DrawerBody>
            <PatientFormFields
              formData={formData}
              onChange={setFormData}
              errors={errors}
              showEmail={true}
              showGender={true}
            />
          </DrawerBody>
          <DrawerFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {t.patients.addPatient}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
