"use client"

import { useState, useEffect } from "react"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Card, CardContent } from "@/components/Card"
import { useToast } from "@/hooks/useToast"
import { useUserClinic } from "@/contexts/user-clinic-context"
import { listPending, approve, reject } from "./approvals.api"
import { createTask } from "@/features/tasks/tasks.api"
import { DEMO_CLINIC_ID } from "@/data/mock/mock-data"
import type { AppointmentApprovalRequest } from "./waitlist.types"
import {
  RiCalendarLine,
  RiTimeLine,
  RiUserLine,
  RiCheckLine,
  RiCloseLine,
  RiTaskLine,
  RiExternalLinkLine,
} from "@remixicon/react"
import { cx } from "@/lib/utils"
import { ListSkeleton } from "@/components/skeletons"

export interface ApprovalsDrawerProps {
  open: boolean
  onClose: () => void
}

export function ApprovalsDrawer({ open, onClose }: ApprovalsDrawerProps) {
  const { showToast } = useToast()
  const { currentUser, currentClinic } = useUserClinic()
  const clinicId = currentClinic?.id || DEMO_CLINIC_ID

  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<AppointmentApprovalRequest[]>([])

  useEffect(() => {
    if (open) {
      fetchPendingRequests()
    }
  }, [open, clinicId])

  const fetchPendingRequests = async () => {
    setLoading(true)
    try {
      const pending = await listPending({ clinicId })
      setRequests(pending)
    } catch (error) {
      console.error("Failed to fetch pending approvals:", error)
      showToast("Failed to load pending approvals", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (request: AppointmentApprovalRequest) => {
    try {
      await approve({ requestId: request.id })
      showToast(`Approved appointment for ${request.patientName}`, "success")
      // Remove from list
      setRequests((prev) => prev.filter((r) => r.id !== request.id))
    } catch (error) {
      console.error("Failed to approve request:", error)
      showToast("Failed to approve request", "error")
    }
  }

  const handleReject = async (request: AppointmentApprovalRequest) => {
    try {
      await reject(request.id, "Rejected by assistant")
      showToast(`Rejected appointment for ${request.patientName}`, "info")
      // Remove from list
      setRequests((prev) => prev.filter((r) => r.id !== request.id))
    } catch (error) {
      console.error("Failed to reject request:", error)
      showToast("Failed to reject request", "error")
    }
  }

  const handleSuggestAlternative = async (request: AppointmentApprovalRequest) => {
    try {
      // Create a task for suggesting alternative time
      await createTask({
        title: `Suggest alternative time for ${request.patientName}`,
        description: `Patient requested: ${formatDateTime(request.requestedStartAt)}. Contact patient to suggest alternative time.`,
        type: "appointment",
        priority: "normal",
        patientId: request.patientId,
        clinicId: request.clinicId,
        createdByUserId: currentUser.id,
      })

      showToast("Task created for alternative time suggestion", "success")
    } catch (error) {
      console.error("Failed to create task:", error)
      showToast("Failed to create task", "error")
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent
        side="right"
        className={cx(
          "sm:max-w-lg", // desktop: 500px width
          "max-sm:w-full max-sm:inset-x-0" // mobile: full screen
        )}
      >
        <DrawerHeader>
          <DrawerTitle>Pending Approvals</DrawerTitle>
          <DrawerDescription>
            Review and approve appointment requests from integrations and online bookings.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody>
          {loading ? (
            <div className="py-4">
              <ListSkeleton rows={4} />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <RiCheckLine className="mx-auto size-12 text-gray-400" />
              <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-50">
                No pending approvals
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                All appointment requests have been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border-gray-200 dark:border-gray-800">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Patient Info */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
                            <RiUserLine className="size-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-50">
                              {request.patientName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request.patientPhone}
                            </p>
                          </div>
                        </div>
                        <Badge color={request.source === "integration" ? "indigo" : "gray"} size="xs">
                          {request.source === "integration" ? "Integration" : "Online"}
                        </Badge>
                      </div>

                      {/* Appointment Details */}
                      <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center gap-2 text-sm">
                          <RiCalendarLine className="size-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">{formatDate(request.requestedStartAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <RiTimeLine className="size-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {formatTime(request.requestedStartAt)} - {formatTime(request.requestedEndAt)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Type:</span> {request.appointmentType}
                        </div>
                        {request.notes && (
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            {request.notes}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(request)}
                          className="flex-1 sm:flex-none"
                        >
                          <RiCheckLine className="mr-1 size-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(request)}
                          className="flex-1 sm:flex-none"
                        >
                          <RiCloseLine className="mr-1 size-4" />
                          Reject
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSuggestAlternative(request)}
                          className="flex-1 sm:flex-none"
                        >
                          <RiTaskLine className="mr-1 size-4" />
                          Suggest Alternative
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DrawerBody>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
