"use client"

import { useState, useEffect } from "react"
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
import { Select } from "@/components/Select"
import { Textarea } from "@/components/Textarea"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { useToast } from "@/hooks/useToast"
import { createExpense } from "@/api/expenses.api"
import { uploadFile } from "@/api/files.api"
import { VendorAutocomplete } from "./VendorAutocomplete"
import type { ExpenseCategory, ExpenseMethod } from "@/types/expense"
import { RiUploadLine, RiFileLine } from "@remixicon/react"

interface AddExpenseDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddExpenseDrawer({
  open,
  onOpenChange,
  onSuccess,
}: AddExpenseDrawerProps) {
  const t = useAppTranslations()
  const { isRtl } = useLocale()
  const { currentClinic, currentUser } = useUserClinic()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<ExpenseCategory>("supplies")
  const [amount, setAmount] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [vendor, setVendor] = useState("")
  const [vendorPhone, setVendorPhone] = useState("")
  const [description, setDescription] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<ExpenseMethod>("cash")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptFileId, setReceiptFileId] = useState<string | undefined>(undefined)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (open) {
      setCategory("supplies")
      setAmount("")
      setDateFrom("")
      setDateTo("")
      setVendor("")
      setVendorPhone("")
      setDescription("")
      setPaymentMethod("cash")
      setReceiptFile(null)
      setReceiptFileId(undefined)
    }
  }, [open])

  // Reset marketing-specific fields when switching away from marketing; clear vendor when switching categories
  useEffect(() => {
    if (category !== "marketing") {
      setDateFrom("")
      setDateTo("")
    }
    setVendor("")
  }, [category])

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setReceiptFile(file)
    setUploadingReceipt(true)

    try {
      const result = await uploadFile({
        clinicId: currentClinic.id,
        entityType: "expense",
        entityId: `temp_${Date.now()}`,
        file,
      })
      setReceiptFileId(result.fileId)
    } catch (error) {
      console.error("Failed to upload receipt:", error)
      showToast(t.expense.failedToUploadReceipt, "error")
      setReceiptFile(null)
    } finally {
      setUploadingReceipt(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0) {
      showToast(t.expense.pleaseEnterValidAmount, "error")
      return
    }

    if (category === "marketing") {
      if (!dateFrom || !dateTo) {
        showToast(t.expense.adSpendDateRangeRequired, "error")
        return
      }
      if (new Date(dateFrom) > new Date(dateTo)) {
        showToast(t.expense.adSpendDateFromBeforeTo, "error")
        return
      }
      if (!vendor) {
        showToast(t.expense.marketingPlatformRequired, "error")
        return
      }
    }

    setLoading(true)
    try {
      await createExpense({
        clinicId: currentClinic.id,
        category,
        amount: parseFloat(amount),
        method: category === "marketing" ? "transfer" : paymentMethod,
        vendorName: vendor || undefined,
        note: category === "marketing" ? undefined : description || undefined,
        receiptFileId: category === "marketing" ? undefined : receiptFileId,
        createdByUserId: currentUser.id,
        dateFrom: category === "marketing" ? dateFrom : undefined,
        dateTo: category === "marketing" ? dateTo : undefined,
      })

      showToast("Expense added successfully", "success")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create expense:", error)
      showToast(t.expense.failedToAddExpense, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>{t.expense.addExpense}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  {t.expense.category} <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                >
                  <option value="supplies">{t.expense.categorySupplies}</option>
                  <option value="rent">{t.expense.categoryRent}</option>
                  <option value="salaries">{t.expense.categorySalaries}</option>
                  <option value="utilities">{t.expense.categoryUtilities}</option>
                  <option value="marketing">{t.expense.categoryMarketing}</option>
                  <option value="other">{t.expense.categoryOther}</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">
                  {t.expense.amount} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              {category === "marketing" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="platform">
                      {t.expense.marketingPlatform} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      id="platform"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                    >
                      <option value="">{t.expense.marketingPlatformPlaceholder}</option>
                      <option value="Meta WhatsApp">{t.expense.platformMetaWhatsApp}</option>
                      <option value="Meta Instagram">{t.expense.platformMetaInstagram}</option>
                      <option value="Meta Facebook">{t.expense.platformMetaFacebook}</option>
                      <option value="Google">{t.expense.platformGoogle}</option>
                      <option value="Other">{t.expense.platformOther}</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="block">{t.expense.adSpendDateRange} <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="dateFrom" className="text-xs text-gray-600 dark:text-gray-400">{t.expense.adSpendFrom}</Label>
                        <Input
                          id="dateFrom"
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="dateTo" className="text-xs text-gray-600 dark:text-gray-400">{t.expense.adSpendTo}</Label>
                        <Input
                          id="dateTo"
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="vendor">{t.expense.vendorSupplier}</Label>
                    <VendorAutocomplete
                      clinicId={currentClinic.id}
                      value={vendor}
                      onChange={setVendor}
                      onSelect={(v) => setVendorPhone(v.phone ?? "")}
                      createVendorPhone={vendorPhone}
                      placeholder={t.expense.vendorPlaceholder}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendorPhone">{t.expense.vendorPhone}</Label>
                    <Input
                      id="vendorPhone"
                      type="tel"
                      value={vendorPhone}
                      onChange={(e) => setVendorPhone(e.target.value)}
                      placeholder={t.expense.vendorPhonePlaceholder}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t.expense.description}</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t.expense.descriptionPlaceholder}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">
                      {t.expense.paymentMethod} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as ExpenseMethod)}
                    >
                      <option value="cash">{t.expense.methodCash}</option>
                      <option value="instapay">{t.expense.methodInstapay}</option>
                      <option value="transfer">{t.expense.methodTransfer}</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receipt">{t.expense.receiptProof}</Label>
                    <div className="space-y-2">
                      <label
                        htmlFor="receipt"
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <RiUploadLine className="size-4" />
                        {receiptFile ? receiptFile.name : t.expense.uploadReceipt}
                      </label>
                      <input
                        id="receipt"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleReceiptUpload}
                        className="hidden"
                        disabled={uploadingReceipt}
                      />
                      {uploadingReceipt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t.expense.uploading}</p>
                      )}
                      {receiptFileId && (
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                          <RiFileLine className="size-4" />
                          {t.expense.receiptUploaded}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.expense.receiptHint}
                    </p>
                  </div>
                </>
              )}
            </div>

            <DrawerFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1 sm:flex-initial"
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  loading ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  (category === "marketing" && (!dateFrom || !dateTo || !vendor))
                }
                isLoading={loading}
                className="flex-1 sm:flex-initial"
              >
                {t.expense.addExpense}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
