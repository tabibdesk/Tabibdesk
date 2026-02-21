"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { SearchInput } from "@/components/SearchInput"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { getBadgeColor } from "@/lib/badgeColors"
import { PageHeader } from "@/components/shared/PageHeader"
import {
  RiUserAddLine,
  RiUserSearchLine,
  RiPhoneLine,
  RiMailLine,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
} from "@remixicon/react"

interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  status: "new" | "contacted" | "qualified" | "converted" | "lost"
  source: string
  createdAt: string
}

export default function AssistantLeadsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "contacted" | "qualified" | "converted" | "lost">("all")
  const [leads] = useState<Lead[]>([
    {
      id: "1",
      name: "Ahmed Mohamed",
      phone: "+20 100 123 4567",
      email: "ahmed@example.com",
      status: "new",
      source: "Website",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Fatima Ali",
      phone: "+20 100 234 5678",
      email: null,
      status: "contacted",
      source: "Referral",
      createdAt: new Date().toISOString(),
    },
  ])

  const filteredLeads = leads.filter((lead) => {
    if (searchTerm && !lead.name.toLowerCase().includes(searchTerm.toLowerCase()) && !lead.phone.includes(searchTerm)) {
      return false
    }
    if (filterStatus !== "all" && lead.status !== filterStatus) {
      return false
    }
    return true
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "error" | "warning" | "neutral"> = {
      new: "default",
      contacted: "warning",
      qualified: "default",
      converted: "success",
      lost: "error",
    }
    return <Badge color={getBadgeColor(variants[status] || "neutral")} size="xs">{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        actions={
          <Button>
            <RiUserAddLine className="mr-2 size-4" />
            Add Lead
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search by name or phone..."
            value={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "new", "contacted", "qualified", "converted", "lost"] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "primary" : "secondary"}
              onClick={() => setFilterStatus(status)}
              className="text-sm capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {filteredLeads.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{lead.name}</CardTitle>
                    <div className="mt-2">{getStatusBadge(lead.status)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <RiPhoneLine className="size-4 shrink-0" />
                  <span>{lead.phone}</span>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <RiMailLine className="size-4 shrink-0" />
                    <span>{lead.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <RiTimeLine className="size-4 shrink-0" />
                  <span>Source: {lead.source}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="primary" size="sm" className="flex-1">
                    <RiCheckLine className="mr-1 size-4" />
                    Contact
                  </Button>
                  <Button variant="ghost" size="sm">
                    <RiCloseLine className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <RiUserSearchLine className="mx-auto size-12 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {searchTerm ? "No leads found matching your search." : "No leads yet."}
            </p>
            {!searchTerm && (
              <Button className="mt-4">
                <RiUserAddLine className="mr-2 size-4" />
                Add First Lead
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
