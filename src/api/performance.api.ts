/**
 * Performance API - member task closing rate and leads created
 */

import { listTasks } from "@/features/tasks/tasks.api"
import { listPatients } from "@/features/patients/patients.api"
import { getUsersForClinics } from "@/data/mock/users-clinics"

export interface MemberPerformanceStats {
  userId: string
  memberName: string
  tasksClosed: number
  tasksClosedOnTime: number
  closingRatePercent: number | null
  leadsCreated: number
}

export interface GetMemberPerformanceStatsResult {
  members: MemberPerformanceStats[]
  clinicTotalLeads: number
}

/**
 * Get per-member performance: task closing rate on time, leads created.
 * Tasks assigned to each member; "on time" = done with updatedAt <= dueDate.
 * Leads = new patients (first_visit_at in range); per-user requires created_by on patients (not yet).
 */
export async function getMemberPerformanceStats(params: {
  clinicId: string
  from: string
  to: string
}): Promise<GetMemberPerformanceStatsResult> {
  const { clinicId, from, to } = params
  const fromDate = new Date(from)
  const toDate = new Date(to)
  toDate.setHours(23, 59, 59, 999)

  // Get all tasks (done and pending) with due_date or completion in range
  const tasksRes = await listTasks({
    clinicId,
    status: "all",
    page: 1,
    pageSize: 5000,
  })

  const tasks = tasksRes.tasks

  // Get new patients (leads) in range
  const patientsRes = await listPatients({
    clinicId,
    page: 1,
    pageSize: 10000,
    firstVisitFrom: from,
    firstVisitTo: to,
  })
  const clinicTotalLeads = patientsRes.patients?.length ?? 0

  // Get clinic members (users)
  const clinicUsers = getUsersForClinics([clinicId])
  const members = clinicUsers.map((user) => {
    const userId = user.id
    const memberName = `${user.first_name} ${user.last_name}`

    const assignedTasks = tasks.filter((t) => t.assignedToUserId === userId)
    const doneTasks = assignedTasks.filter((t) => t.status === "done")

    const doneInRange = doneTasks.filter((t) => {
      const completedAt = t.updatedAt ? new Date(t.updatedAt) : new Date(t.createdAt)
      return completedAt >= fromDate && completedAt <= toDate
    })

    const onTime = doneInRange.filter((t) => {
      if (!t.dueDate) return true
      const completedAt = t.updatedAt ? new Date(t.updatedAt) : new Date(t.createdAt)
      return completedAt <= new Date(t.dueDate + "T23:59:59")
    })

    const closingRatePercent =
      doneInRange.length > 0 ? Math.round((onTime.length / doneInRange.length) * 100) : null

    return {
      userId,
      memberName,
      tasksClosed: doneInRange.length,
      tasksClosedOnTime: onTime.length,
      closingRatePercent,
      leadsCreated: 0,
    }
  })

  return {
    members,
    clinicTotalLeads,
  }
}
