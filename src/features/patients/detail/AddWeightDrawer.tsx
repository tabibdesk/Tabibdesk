"use client"

import { useState } from "react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { useLocale } from "@/contexts/locale-context"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Textarea } from "@/components/Textarea"
export interface AddWeightPayload {
  patientId: string
  weight: number
  recordedDate: string
  notes?: string | null
}

interface AddWeightDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: AddWeightPayload) => Promise<void>
  patientId: string
}

export function AddWeightDrawer({
  open,
  onOpenChange,
  onSubmit,
  patientId,
}: AddWeightDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [weight, setWeight] = useState("")
  const [recordedDate, setRecordedDate] = useState(() => new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numWeight = parseFloat(weight)
    if (Number.isNaN(numWeight) || numWeight <= 0) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        patientId,
        weight: numWeight,
        recordedDate,
        notes: notes.trim() || null,
      })
      onOpenChange(false)
      setWeight("")
      setRecordedDate(new Date().toISOString().split("T")[0])
      setNotes("")
    } catch (error) {
      console.error("Failed to add weight", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>{t.profile.addWeightTitle}</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit}>
          <DrawerBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">{t.profile.weightKg}</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="1"
                placeholder={t.profile.weightPlaceholder}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recorded-date">{t.profile.date}</Label>
              <Input
                id="recorded-date"
                type="date"
                value={recordedDate}
                onChange={(e) => setRecordedDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight-notes">{t.profile.notesOptional}</Label>
              <Textarea
                id="weight-notes"
                placeholder={t.profile.notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || !weight.trim()}>
              {isSubmitting ? t.profile.addingWeight : t.profile.addWeightBtn}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
