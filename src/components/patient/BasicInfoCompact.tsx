"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/Card"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Select } from "@/components/Select"
import { Textarea } from "@/components/Textarea"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/Drawer"
import {
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
  RiBriefcaseLine,
  RiRulerLine,
  RiCalendarLine,
  RiEditLine,
  RiSaveLine,
  RiCloseLine,
  RiInformationLine,
  RiWhatsappLine,
} from "@remixicon/react"

interface Patient {
  id: string
  first_name: string
  last_name: string
  age: number | null
  gender: string
  phone: string
  email: string | null
  address: string | null
  height: number | null
  job: string | null
  social_status?: string | null
  source?: string | null
  source_other?: string | null
  complaint: string | null
  created_at: string
  updated_at: string
}

interface BasicInfoCompactProps {
  patient: Patient
  onUpdate?: (updates: Partial<Patient>) => Promise<void>
}

interface FormData {
  first_name: string
  last_name: string
  phone: string
  email: string
  gender: string
  age: string
  address: string
  job: string
  height: string
  social_status: string
  source: string
  source_other: string
  complaint: string
}

export function BasicInfoCompact({ patient, onUpdate }: BasicInfoCompactProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showFullComplaint, setShowFullComplaint] = useState(false)
  const [formData, setFormData] = useState<FormData>(() => ({
    first_name: patient.first_name || "",
    last_name: patient.last_name || "",
    phone: patient.phone || "",
    email: patient.email || "",
    gender: patient.gender || "",
    age: patient.age?.toString() || "",
    address: patient.address || "",
    job: patient.job || "",
    height: patient.height?.toString() || "",
    social_status: (patient as any).social_status || "",
    source: (patient as any).source || "",
    source_other: (patient as any).source_other || "",
    complaint: patient.complaint || "",
  }))
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    updateField("source", value)
    if (value !== "other") {
      updateField("source_other", "")
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required"
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format"
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\d\s\+\-\(\)]+$/
      if (!phoneRegex.test(formData.phone)) newErrors.phone = "Invalid phone format"
    }

    if (formData.age && formData.age.trim()) {
      const ageNum = parseInt(formData.age, 10)
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
        newErrors.age = "Age must be between 0 and 150"
      }
    }

    if (formData.height && formData.height.trim()) {
      const heightNum = parseFloat(formData.height)
      if (isNaN(heightNum) || heightNum <= 0) {
        newErrors.height = "Height must be a positive number"
      }
    }

    if (formData.source === "other" && !formData.source_other?.trim()) {
      newErrors.source_other = "Please specify the source"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setIsSaving(true)
    try {
      const updates: Partial<Patient> = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || null,
        gender: formData.gender || "",
        age: formData.age ? parseInt(formData.age, 10) : null,
        address: formData.address?.trim() || null,
        job: formData.job?.trim() || null,
        height: formData.height ? parseFloat(formData.height) : null,
        social_status: formData.social_status?.trim() || null,
        complaint: formData.complaint?.trim() || null,
        source: formData.source || null,
        source_other: formData.source === "other" ? formData.source_other?.trim() || null : null,
      }

      if (onUpdate) {
        await onUpdate(updates)
      }
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update patient:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: patient.first_name || "",
      last_name: patient.last_name || "",
      phone: patient.phone || "",
      email: patient.email || "",
      gender: patient.gender || "",
      age: patient.age?.toString() || "",
      address: patient.address || "",
      job: patient.job || "",
      height: patient.height?.toString() || "",
      social_status: (patient as any).social_status || "",
      source: (patient as any).source || "",
      source_other: (patient as any).source_other || "",
      complaint: patient.complaint || "",
    })
    setErrors({})
    setIsEditing(false)
  }

  const InfoItem = ({ 
    icon: Icon, 
    label, 
    value 
  }: { 
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string | null | undefined 
  }) => {
    if (!value) return null
    return (
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 shrink-0 text-gray-400" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-500">{label}</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
            {value}
          </p>
        </div>
      </div>
    )
  }

  const formatSource = (source: string | null | undefined, sourceOther: string | null | undefined) => {
    if (!source) return null
    const sourceMap: Record<string, string> = {
      facebook: "Facebook",
      instagram: "Instagram",
      friend_recommendation: "Friend Recommendation",
      walk_in: "Walk In",
      other: sourceOther || "Other",
    }
    return sourceMap[source] || source
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }

  const FieldWrapper = ({
    icon: Icon,
    label,
    children,
    required = false,
  }: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    children: React.ReactNode
    required?: boolean
  }) => (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, "_")} className="flex items-center gap-2 text-sm">
        <Icon className="size-4 text-gray-400" />
        <span>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </Label>
      {children}
    </div>
  )

  return (
    <>
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 px-4 py-3 min-h-12 flex flex-row items-center justify-start">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <RiInformationLine className="size-4 text-primary-500/70 dark:text-primary-400/70" />
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Patient Information
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-6 px-1.5 text-[10px] font-bold uppercase tracking-wider">
              <RiEditLine className="size-3" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {patient.phone ? (
              <div className="flex items-center gap-2">
                <RiPhoneLine className="size-3.5 shrink-0 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-500">Phone</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                      {patient.phone}
                    </p>
                    <a
                      href={`https://wa.me/${patient.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      title="WhatsApp"
                    >
                      <RiWhatsappLine className="size-4" />
                    </a>
                  </div>
                </div>
              </div>
            ) : null}
            {patient.email ? (
              <InfoItem icon={RiMailLine} label="Email" value={patient.email} />
            ) : null}
            {patient.address ? (
              <InfoItem icon={RiMapPinLine} label="Address" value={patient.address} />
            ) : null}
            {patient.job ? (
              <InfoItem icon={RiBriefcaseLine} label="Occupation" value={patient.job} />
            ) : null}
            {(patient as any).social_status ? (
              <InfoItem icon={RiUserLine} label="Social status" value={(patient as any).social_status} />
            ) : null}
            {patient.height ? (
              <InfoItem icon={RiRulerLine} label="Height" value={`${patient.height} cm`} />
            ) : null}
            {(patient as any).source ? (
              <InfoItem
                icon={RiUserLine}
                label="Source"
                value={formatSource((patient as any).source, (patient as any).source_other)}
              />
            ) : null}
            <InfoItem
              icon={RiCalendarLine}
              label="Registered"
              value={new Date(patient.created_at).toLocaleDateString()}
            />
          </div>

          {patient.complaint && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-2">
                <RiInformationLine className="size-3.5 shrink-0 text-gray-400 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Complaint</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {showFullComplaint || patient.complaint.length <= 120
                      ? patient.complaint
                      : truncateText(patient.complaint, 120)}
                  </p>
                  {patient.complaint.length > 120 && (
                    <button
                      onClick={() => setShowFullComplaint(!showFullComplaint)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    >
                      {showFullComplaint ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Drawer */}
      <Drawer open={isEditing} onOpenChange={setIsEditing}>
        <DrawerContent side="right" className="w-full sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Edit Patient Information</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FieldWrapper icon={RiUserLine} label="First Name" required>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => updateField("first_name", e.target.value)}
                  hasError={!!errors.first_name}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
                )}
              </FieldWrapper>

              <FieldWrapper icon={RiUserLine} label="Last Name" required>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => updateField("last_name", e.target.value)}
                  hasError={!!errors.last_name}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
                )}
              </FieldWrapper>

              <FieldWrapper icon={RiPhoneLine} label="Phone" required>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  hasError={!!errors.phone}
                  placeholder="+20 100 1234567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                )}
              </FieldWrapper>

              <FieldWrapper icon={RiMailLine} label="Email">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  hasError={!!errors.email}
                  placeholder="patient@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </FieldWrapper>

              <FieldWrapper icon={RiUserLine} label="Gender">
                <Select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </FieldWrapper>

              <FieldWrapper icon={RiUserLine} label="Age">
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  hasError={!!errors.age}
                  placeholder="Enter age"
                  min="0"
                  max="150"
                />
                {errors.age && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.age}</p>
                )}
              </FieldWrapper>

              <FieldWrapper icon={RiMapPinLine} label="Address">
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Enter address"
                />
              </FieldWrapper>

              <FieldWrapper icon={RiBriefcaseLine} label="Occupation">
                <Input
                  id="job"
                  value={formData.job}
                  onChange={(e) => updateField("job", e.target.value)}
                  placeholder="Enter occupation"
                />
              </FieldWrapper>

              <FieldWrapper icon={RiRulerLine} label="Height">
                <div className="relative">
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => updateField("height", e.target.value)}
                    hasError={!!errors.height}
                    placeholder="Enter height"
                    min="0"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    cm
                  </span>
                </div>
                {errors.height && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.height}</p>
                )}
              </FieldWrapper>

              <FieldWrapper icon={RiUserLine} label="Social status">
                <Select
                  id="social_status"
                  value={formData.social_status}
                  onChange={(e) => updateField("social_status", e.target.value)}
                >
                  <option value="">Select social status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Other">Other</option>
                </Select>
              </FieldWrapper>

              <FieldWrapper icon={RiUserLine} label="Source">
                <Select id="source" value={formData.source} onChange={handleSourceChange}>
                  <option value="">Select source</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="friend_recommendation">Friend Recommendation</option>
                  <option value="walk_in">Walk In</option>
                  <option value="other">Other</option>
                </Select>
              </FieldWrapper>

              {formData.source === "other" && (
                <FieldWrapper icon={RiUserLine} label="Specify Other Source">
                  <Input
                    id="source_other"
                    value={formData.source_other}
                    onChange={(e) => updateField("source_other", e.target.value)}
                    hasError={!!errors.source_other}
                    placeholder="Enter source"
                  />
                  {errors.source_other && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.source_other}
                    </p>
                  )}
                </FieldWrapper>
              )}
            </div>

            <FieldWrapper icon={RiInformationLine} label="Complaint">
              <Textarea
                id="complaint"
                value={formData.complaint}
                onChange={(e) => updateField("complaint", e.target.value)}
                placeholder="Enter complaint"
                rows={3}
              />
            </FieldWrapper>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1"
              >
                <RiCloseLine className="mr-2 size-4" />
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                isLoading={isSaving}
                className="flex-[2]"
              >
                <RiSaveLine className="mr-2 size-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
