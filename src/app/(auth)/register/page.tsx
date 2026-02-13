"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { RiGoogleFill, RiMicrosoftFill, RiCheckLine, RiFlaskLine } from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"
import { useLocale } from "@/contexts/locale-context"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { createClient } from "@/lib/supabase/client"

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { enableDemoMode, disableDemoMode } = useDemo()
  const { setLanguage } = useLocale()
  const t = useAppTranslations()

  useEffect(() => {
    const urlLang = searchParams.get("lang")
    if (urlLang === "ar" || urlLang === "en") setLanguage(urlLang)
  }, [searchParams, setLanguage])
  const [formData, setFormData] = useState({
    clinicName: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    labelKey: "weak" | "medium" | "strong" | ""
    color: string
  }>({ score: 0, labelKey: "", color: "" })

  const calculatePasswordStrength = (password: string): { score: number; labelKey: "weak" | "medium" | "strong" | ""; color: string } => {
    let score = 0
    if (!password) return { score: 0, labelKey: "", color: "" }

    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return { score, labelKey: "weak", color: "text-red-600" }
    if (score <= 4) return { score, labelKey: "medium", color: "text-yellow-600" }
    return { score, labelKey: "strong", color: "text-green-600" }
  }

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password))
    }
  }, [formData.password])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clinicName.trim()) newErrors.clinicName = t.auth.clinicNameRequired
    if (!formData.fullName.trim()) newErrors.fullName = t.auth.fullNameRequired
    if (!formData.email) {
      newErrors.email = t.auth.emailRequired
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.auth.emailInvalid
    }
    if (!formData.password) {
      newErrors.password = t.auth.passwordRequired
    } else if (formData.password.length < 8) {
      newErrors.password = t.auth.passwordMinLength8
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t.auth.confirmPasswordRequired
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.auth.passwordsDontMatch
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    
    // Disable demo mode immediately when registration is initiated
    disableDemoMode()

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            clinic_name: formData.clinicName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })
      if (error) {
        console.error("[v0] Sign up error:", error.message, error.status)
        setErrors({ general: "Unable to create account. Please try again." })
        return
      }
      // If email confirmation is required, Supabase returns a user with identities = []
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        console.warn("[v0] Account already exists for email:", formData.email)
        setErrors({ general: "An account with this email already exists." })
        return
      }
      // Redirect to success or dashboard depending on email confirmation setting
      if (data.session) {
        // Immediate login - redirect to dashboard
        router.push("/dashboard")
        router.refresh()
      } else {
        // Email confirmation required - show banner on this page
        setShowSuccessBanner(true)
        setFormData({
          clinicName: "",
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
        })
      }
    } catch (err: unknown) {
      console.error("[v0] Sign up exception:", err)
      setErrors({ general: "Unable to create account. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoMode = () => {
    enableDemoMode()
    router.push("/dashboard")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error for this field
    const newErrors = { ...errors }
    delete newErrors[name]
    setErrors(newErrors)
  }

  const handleSocialSignup = async (provider: "google" | "azure") => {
    // Disable demo mode immediately
    disableDemoMode()
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })
      if (error) {
        console.error("[v0] OAuth sign up error:", error.message, error.status)
        setErrors({ general: "Unable to sign up with this provider. Please try again." })
      }
    } catch (err: unknown) {
      console.error("[v0] OAuth sign up exception:", err)
      setErrors({ general: "Unable to sign up with this provider. Please try again." })
    }
  }
    }
  }

  return (
    <div className="flex min-h-screen rtl:flex-row-reverse">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500">
                <span className="text-lg font-bold text-white">TD</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                TabibDesk
              </span>
            </div>
          </div>

          <div className="mt-8">
            {/* Social Signup Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSocialSignup("google" as "google")}
                className="w-full"
              >
                <RiGoogleFill className="me-2 size-5" />
                Google
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSocialSignup("azure")}
                className="w-full"
              >
                <RiMicrosoftFill className="me-2 size-5" />
                Microsoft
              </Button>
            </div>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                  {t.auth.orContinueWithEmail}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="clinicName" className="mb-2 block">
                  {t.auth.clinicName}
                </Label>
                <Input
                  id="clinicName"
                  name="clinicName"
                  type="text"
                  value={formData.clinicName}
                  onChange={handleChange}
                  placeholder="Dr. Ahmed Clinic"
                  hasError={!!errors.clinicName}
                />
                {errors.clinicName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.clinicName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="fullName" className="mb-2 block">
                  {t.auth.fullName}
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Dr. Ahmed Hassan"
                  hasError={!!errors.fullName}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="mb-2 block">
                  {t.auth.email}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@clinic.com"
                  hasError={!!errors.email}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="mb-2 block">
                  {t.auth.password}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  hasError={!!errors.password}
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t.auth.passwordStrength}:
                      </span>
                      <span className={`font-medium ${passwordStrength.color}`}>
                        {passwordStrength.labelKey ? (passwordStrength.labelKey === "weak" ? t.auth.weak : passwordStrength.labelKey === "medium" ? t.auth.medium : t.auth.strong) : ""}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-1">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i <= passwordStrength.score
                              ? passwordStrength.score <= 2
                                ? "bg-red-500"
                                : passwordStrength.score <= 4
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="mb-2 block">
                  {t.auth.confirmPassword}
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  hasError={!!errors.confirmPassword}
                />
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <p className="mt-1 flex items-center text-sm text-green-600 dark:text-green-400">
                      <RiCheckLine className="mr-1 size-4 rtl:ml-1 rtl:mr-0" />
                      {t.auth.passwordsMatch}
                    </p>
                  )}
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="mt-0.5 size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-gray-700 dark:bg-gray-900"
                />
                <label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="font-medium text-primary-600 transition hover:text-primary-500 dark:text-primary-400"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="font-medium text-primary-600 transition hover:text-primary-500 dark:text-primary-400"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {errors.general && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.general}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                loadingText={t.auth.creatingAccount}
              >
                {t.auth.createAccount}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                    {t.auth.or}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleDemoMode}
              >
                <RiFlaskLine className="mr-2 size-4 rtl:ml-2 rtl:mr-0" />
                {t.auth.tryDemoMode}
              </Button>
            </form>

            {/* Success Banner */}
            {showSuccessBanner && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                <div className="flex items-start gap-3">
                  <RiCheckLine className="mt-0.5 size-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      {t.auth.thankYouForSigningUp || "Thank you for signing up!"}
                    </h3>
                    <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                      {t.auth.checkEmailToConfirm || "Check your email to confirm your account before signing in."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {t.auth.alreadyHaveAccount}{" "}
              <Link
                href="/login"
                className="font-medium text-primary-600 transition hover:text-primary-500 dark:text-primary-400"
              >
                {t.auth.signIn}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="relative hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-900" />
        <div className="absolute right-8 top-8 flex items-center gap-3 rtl:right-auto rtl:left-8">
          <div className="flex size-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <span className="text-xl font-bold text-white">TD</span>
          </div>
          <span className="text-2xl font-bold text-white">TabibDesk</span>
        </div>
      </div>
    </div>
  )
}

function RegisterPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-gray-600 dark:text-gray-400">Loading...</div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageFallback />}>
      <RegisterPageContent />
    </Suspense>
  )
}

