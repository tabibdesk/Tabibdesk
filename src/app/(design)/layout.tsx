import Link from "next/link"

export default function DesignLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500">
                  <span className="text-sm font-bold text-white">TD</span>
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                  TabibDesk
                </span>
              </div>
              <span className="text-sm text-gray-400">|</span>
              <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Design Library
              </h1>
            </div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50"
            >
              Back to App →
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

