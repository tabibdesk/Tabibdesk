"use client"

import { useState, useEffect } from "react"
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
  const { currentClinic, currentUser } = useUserClinic()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<ExpenseCategory>("supplies")
  const [amount, setAmount] = useState("")
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
      setVendor("")
      setVendorPhone("")
      setDescription("")
      setPaymentMethod("cash")
      setReceiptFile(null)
      setReceiptFileId(undefined)
    }
  }, [open])

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
      showToast("Failed to upload receipt", "error")
      setReceiptFile(null)
    } finally {
      setUploadingReceipt(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0) {
      showToast("Please enter a valid amount", "error")
      return
    }

    setLoading(true)
    try {
      await createExpense({
        clinicId: currentClinic.id,
        category,
        amount: parseFloat(amount),
        method: paymentMethod,
        vendorName: vendor || undefined,
        note: description || undefined,
        receiptFileId: receiptFileId,
        createdByUserId: currentUser.id,
      })

      showToast("Expense added successfully", "success")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create expense:", error)
      showToast("Failed to add expense", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-full sm:max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>Add Expense</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                >
                  <option value="supplies">Supplies</option>
                  <option value="rent">Rent</option>
                  <option value="salaries">Salaries</option>
                  <option value="utilities">Utilities</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount (EGP) <span className="text-red-500">*</span>
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

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor/Supplier</Label>
                <VendorAutocomplete
                  clinicId={currentClinic.id}
                  value={vendor}
                  onChange={setVendor}
                  onSelect={(v) => setVendorPhone(v.phone ?? "")}
                  createVendorPhone={vendorPhone}
                  placeholder="Type to search or add new vendor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendorPhone">Vendor phone (optional)</Label>
                <Input
                  id="vendorPhone"
                  type="tel"
                  value={vendorPhone}
                  onChange={(e) => setVendorPhone(e.target.value)}
                  placeholder="Vendor phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of expense (optional)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as ExpenseMethod)}
                >
                  <option value="cash">Cash</option>
                  <option value="instapay">InstaPay</option>
                  <option value="transfer">Transfer</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt/Proof (Optional)</Label>
                <div className="space-y-2">
                  <label
                    htmlFor="receipt"
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <RiUploadLine className="size-4" />
                    {receiptFile ? receiptFile.name : "Upload receipt or proof"}
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Uploading...</p>
                  )}
                  {receiptFileId && (
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                      <RiFileLine className="size-4" />
                      Receipt uploaded successfully
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload a receipt or proof of payment (optional but recommended)
                </p>
              </div>
            </div>

            <DrawerFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !amount || parseFloat(amount) <= 0}
                isLoading={loading}
                className="flex-1 sm:flex-initial"
              >
                Add Expense
              </Button>
            </DrawerFooter>
          </form>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
