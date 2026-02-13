"use client"

import React from "react"
import { PageHeader } from "./PageHeader"

interface PageLayoutProps {
  /** Page title (rendered in PageHeader) */
  title?: React.ReactNode
  /** Optional description under title */
  description?: React.ReactNode
  /** Actions (e.g. buttons, select) in header */
  actions?: React.ReactNode
  /** Custom header element instead of PageHeader (e.g. PatientPageHeader) */
  header?: React.ReactNode
  /** Page content - spacing between header and content is consistent (space-y-6) */
  children: React.ReactNode
  className?: string
}

/**
 * Page layout wrapper - ensures consistent spacing between page header/title and content (matches dashboard).
 * Use page-content class and space-y-6 for uniform spacing across all pages.
 */
export function PageLayout({
  title,
  description,
  actions,
  header,
  children,
  className,
}: PageLayoutProps) {
  return (
    <div className={`page-content ${className ?? ""}`.trim()}>
      {header !== undefined
        ? header
        : title != null && <PageHeader title={title} description={description} actions={actions} />}
      {children}
    </div>
  )
}
