"use client"

import { BrandName } from "@/components/shared/BrandName"

/**
 * Handles errors in the root layout. Must define its own <html> and <body>
 * because it replaces the root layout when active.
 */
export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#f9fafb",
          color: "#111827",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "20rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#158ce2",
              margin: 0,
            }}
          >
            Error
          </p>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              marginTop: "0.75rem",
              marginBottom: 0,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
              marginTop: "0.5rem",
              marginBottom: 0,
            }}
          >
            You can try again or head back to the dashboard.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginTop: "2rem",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0.625rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                background: "#fff",
                color: "#374151",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/dashboard"
              style={{
                display: "block",
                padding: "0.625rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                borderRadius: "0.5rem",
                background: "#158ce2",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Go to dashboard
            </a>
          </div>
          <a
            href="/dashboard"
            style={{
              display: "inline-block",
              marginTop: "3rem",
              fontSize: "0.75rem",
              textDecoration: "none",
            }}
          >
            <BrandName className="text-xs" />
          </a>
        </div>
      </body>
    </html>
  )
}
