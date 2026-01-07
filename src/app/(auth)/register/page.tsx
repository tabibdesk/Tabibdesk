"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { RiGoogleFill, RiMicrosoftFill, RiCheckLine, RiFlaskLine } from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"

export default function RegisterPage() {
  const router = useRouter()
  const { enableDemoMode } = useDemo()
  const [formData, setFormData] = useState({
    clinicName: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  })

  const calculatePasswordStrength = (password: string) => {
    let score = 0
    if (!password) return { score: 0, label: "", color: "" }

    // Length
    if (password.length >= 8) score++
    if (password.length >= 12) score++

    // Contains lowercase
    if (/[a-z]/.test(password)) score++

    // Contains uppercase
    if (/[A-Z]/.test(password)) score++

    // Contains number
    if (/\d/.test(password)) score++

    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return { score, label: "Weak", color: "text-red-600" }
    if (score <= 4) return { score, label: "Medium", color: "text-yellow-600" }
    return { score, label: "Strong", color: "text-green-600" }
  }

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password))
    }
  }, [formData.password])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clinicName.trim()) {
      newErrors.clinicName = "Clinic name is required"
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // For now, just redirect to dashboard
    router.push("/dashboard")
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

  const handleSocialSignup = (provider: string) => {
    console.log(`Sign up with ${provider}`)
    // Implement social signup here
  }

  return (
    <div className="flex min-h-screen">
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
            <h2 className="mt-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          <div className="mt-8">
            {/* Social Signup Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSocialSignup("google")}
                className="w-full"
              >
                <RiGoogleFill className="mr-2 size-5" />
                Google
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSocialSignup("microsoft")}
                className="w-full"
              >
                <RiMicrosoftFill className="mr-2 size-5" />
                Microsoft
              </Button>
            </div>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="clinicName" className="mb-2 block">
                  Clinic Name
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
                  Your Full Name
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
                  Email address
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
                  Password
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
                        Password strength:
                      </span>
                      <span className={`font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
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
                  Confirm Password
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
                      <RiCheckLine className="mr-1 size-4" />
                      Passwords match
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

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                loadingText="Creating account..."
              >
                Create account
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                    Or
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleDemoMode}
              >
                <RiFlaskLine className="mr-2 size-4" />
                Try Demo Mode
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary-600 transition hover:text-primary-500 dark:text-primary-400"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="relative hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-500 to-secondary-700" />
        <div className="absolute right-8 top-8 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <span className="text-xl font-bold text-white">TD</span>
          </div>
          <span className="text-2xl font-bold text-white">TabibDesk</span>
        </div>
      </div>
    </div>
  )
}

