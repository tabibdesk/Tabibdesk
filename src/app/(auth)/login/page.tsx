"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { RiGoogleFill, RiMicrosoftFill, RiFlaskLine } from "@remixicon/react"
import { useDemo } from "@/contexts/demo-context"

export default function LoginPage() {
  const router = useRouter()
  const { enableDemoMode } = useDemo()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }
    
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
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
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // For now, just redirect to dashboard
    router.push("/dashboard")
  }

  const handleDemoMode = () => {
    router.push("/dashboard")
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`)
    // Implement social login here
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
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          <div className="mt-8">
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSocialLogin("google")}
                className="w-full"
              >
                <RiGoogleFill className="mr-2 size-5" />
                Google
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSocialLogin("microsoft")}
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

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <Label htmlFor="email" className="mb-2 block">
                  Email address
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
                  Password
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
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary-600 transition hover:text-primary-500 dark:text-primary-400"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                loadingText="Signing in..."
              >
                Sign in
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleDemoLogin}
              >
                <RiFlaskLine className="mr-2 size-4" />
                Try Demo Mode
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
                variant="light"
                className="w-full"
                onClick={handleDemoMode}
              >
                Try Demo Mode
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary-600 transition hover:text-primary-500 dark:text-primary-400"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="relative hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-900" />
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

