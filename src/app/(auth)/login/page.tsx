"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { RiGoogleFill, RiMicrosoftFill, RiFlaskLine } from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"
import { useLocale } from "@/contexts/locale-context"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { createClient } from "@/lib/supabase/client"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { enableDemoMode, disableDemoMode } = useDemo()
  const { setLanguage } = useLocale()
  const t = useAppTranslations()

  useEffect(() => {
    const urlLang = searchParams.get("lang")
    if (urlLang === "ar" || urlLang === "en") setLanguage(urlLang)
  }, [searchParams, setLanguage])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = t.auth.emailRequired
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t.auth.emailInvalid
    }

    if (!password) {
      newErrors.password = t.auth.passwordRequired
    } else if (password.length < 6) {
      newErrors.password = t.auth.passwordMinLength
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDemoLogin = () => {
    enableDemoMode()
    router.push("/dashboard")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setErrors({})

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        console.error("[v0] Sign in error:", error.message, error.status)
        setErrors({ general: "Unable to sign in. Please check your credentials and try again." })
        return
      }
      disableDemoMode()
      router.push("/dashboard")
      router.refresh()
    } catch (err: unknown) {
      console.error("[v0] Sign in exception:", err)
      setErrors({ general: "Unable to sign in. Please check your credentials and try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "azure") => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })
      if (error) {
        console.error("[v0] OAuth sign in error:", error.message, error.status)
        setErrors({ general: "Unable to sign in with this provider. Please try again." })
      }
    } catch (err: unknown) {
      console.error("[v0] OAuth sign in exception:", err)
      setErrors({ general: "Unable to sign in with this provider. Please try again." })
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
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSocialLogin("google" as "google")}
                className="w-full"
              >
                <RiGoogleFill className="me-2 size-5" />
                Google
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSocialLogin("azure")}
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

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <Label htmlFor="email" className="mb-2 block">
                  {t.auth.email}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors({ ...errors, email: undefined })
                  }}
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors({ ...errors, password: undefined })
                  }}
                  placeholder="••••••••"
                  hasError={!!errors.password}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-gray-700 dark:bg-gray-900"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ms-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    {t.auth.rememberMe}
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary-600 transition hover:text-primary-500 dark:text-primary-400"
                  >
                    {t.auth.forgotPassword}
                  </a>
                </div>
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
                loadingText={t.auth.signingIn}
              >
                {t.auth.signIn}
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
                variant="light"
                className="w-full"
                onClick={handleDemoLogin}
              >
                <RiFlaskLine className="mr-2 size-4 rtl:ml-2 rtl:mr-0" />
                {t.auth.tryDemoMode}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {t.auth.dontHaveAccount}{" "}
              <Link
                href="/register"
                className="font-medium text-primary-600 transition hover:text-primary-500 dark:text-primary-400"
              >
                {t.auth.signUpForFree}
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

function LoginPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-gray-600 dark:text-gray-400">Loading...</div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  )
}

