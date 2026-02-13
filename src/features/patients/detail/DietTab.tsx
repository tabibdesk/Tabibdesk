"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { RiRestaurantLine, RiHistoryLine } from "@remixicon/react"
import { useAppTranslations } from "@/lib/useAppTranslations"
import { PatientEmptyState } from "./PatientEmptyState"

interface PatientDiet {
  id: string
  patient_id: string
  diet_plan: string
  created_at: string
  updated_at: string
  version: number
  is_active: boolean
}

interface DietTabProps {
  diets: PatientDiet[]
  onEditDiet?: () => void
}

export function DietTab({ diets, onEditDiet: _onEditDiet }: DietTabProps) {
  const t = useAppTranslations()
  // Get active diet
  const activeDiet = diets.find((d) => d.is_active)

  // Get version history (sorted by version descending)
  const versionHistory = [...diets].sort((a, b) => b.version - a.version)

  // Simple markdown-to-HTML renderer for diet plans
  const renderMarkdown = (markdown: string) => {
    // Split into lines
    const lines = markdown.split("\n")
    const elements: JSX.Element[] = []

    lines.forEach((line, index) => {
      // H1
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={index} className="mb-4 mt-6 text-2xl font-bold text-gray-900 dark:text-gray-50">
            {line.replace("# ", "")}
          </h1>
        )
      }
      // H2
      else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={index} className="mb-3 mt-5 text-xl font-semibold text-gray-900 dark:text-gray-50">
            {line.replace("## ", "")}
          </h2>
        )
      }
      // H3
      else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={index} className="mb-2 mt-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            {line.replace("### ", "")}
          </h3>
        )
      }
      // List item
      else if (line.startsWith("- ")) {
        elements.push(
          <li key={index} className="ml-4 text-gray-700 dark:text-gray-300">
            {line.replace("- ", "")}
          </li>
        )
      }
      // Empty line
      else if (line.trim() === "") {
        elements.push(<div key={index} className="h-2" />)
      }
      // Regular paragraph
      else {
        elements.push(
          <p key={index} className="text-gray-700 dark:text-gray-300">
            {line}
          </p>
        )
      }
    })

    return elements
  }

  return (
    <div className="space-y-6">
      {!activeDiet ? (
        <PatientEmptyState
          icon={RiRestaurantLine}
          title={t.profile.noDietPlanYet}
          description={t.profile.addDietPlanDesc}
        />
      ) : (
        <>
          {/* Active Diet Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Current Diet Plan</CardTitle>
                    <Badge color="emerald" size="xs">Active</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Version {activeDiet.version} • Last updated{" "}
                    {new Date(activeDiet.updated_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {renderMarkdown(activeDiet.diet_plan)}
              </div>
            </CardContent>
          </Card>

          {/* Version History */}
          {versionHistory.length > 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RiHistoryLine className="size-5 text-gray-600 dark:text-gray-400" />
                  <CardTitle>Version History</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {versionHistory.map((diet) => (
                    <div
                      key={diet.id}
                      className={`rounded-lg border p-4 ${
                        diet.is_active
                          ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10"
                          : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-gray-50">
                              Version {diet.version}
                            </p>
                            {diet.is_active && <Badge color="emerald" size="xs">Current</Badge>}
                          </div>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Created: {new Date(diet.created_at).toLocaleDateString()} • Updated:{" "}
                            {new Date(diet.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

