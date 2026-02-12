import { useEffect, useState, useRef, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { subscribeToRealtimeChanges, unsubscribeFromRealtime } from '@/lib/realtime'
import { createClient } from '@/lib/supabase/client'

export interface TaskAssignment {
  id: string
  title: string
  description?: string
  patientId?: string
  patientName?: string
  assignedTo?: string
  assignedToName?: string
  clinic_id: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  createdAt: string
  updatedAt: string
  notes?: string
}

interface UseTaskAssignmentsOptions {
  clinicId: string
  userId?: string // Filter for tasks assigned to this user
  status?: TaskAssignment['status'] | 'all'
  onTaskUpdated?: (task: TaskAssignment) => void
  onTaskAssigned?: (task: TaskAssignment) => void
  onTaskCompleted?: (task: TaskAssignment) => void
  onError?: (error: Error) => void
}

export function useTaskAssignments(options: UseTaskAssignmentsOptions) {
  const [tasks, setTasks] = useState<TaskAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const notifiedTaskIds = useRef(new Set<string>())

  // Fetch initial tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()

        let query = supabase
          .from('tasks')
          .select(
            `
            id,
            title,
            description,
            patient_id,
            patients (first_name, last_name),
            assigned_to,
            clinic_members!assigned_to (user_id),
            clinic_id,
            status,
            priority,
            due_date,
            created_at,
            updated_at,
            notes
          `
          )
          .eq('clinic_id', options.clinicId)

        if (options.userId) {
          query = query.eq('assigned_to', options.userId)
        }

        if (options.status && options.status !== 'all') {
          query = query.eq('status', options.status)
        }

        const { data, error: fetchError } = await query.order('due_date', {
          ascending: true,
        })

        if (fetchError) throw fetchError

        const formattedTasks: TaskAssignment[] = (data || []).map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          patientId: task.patient_id,
          patientName: task.patients
            ? `${task.patients.first_name} ${task.patients.last_name}`
            : undefined,
          assignedTo: task.assigned_to,
          assignedToName: task.clinic_members?.first_name
            ? `${task.clinic_members.first_name} ${task.clinic_members.last_name}`
            : undefined,
          clinic_id: task.clinic_id,
          status: task.status,
          priority: task.priority,
          dueDate: task.due_date,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          notes: task.notes,
        }))

        setTasks(formattedTasks)
        setUnreadCount(formattedTasks.filter((t) => t.status === 'pending').length)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch tasks')
        setError(error)
        options.onError?.(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [options.clinicId, options.userId, options.status, options])

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = subscribeToRealtimeChanges({
      table: 'tasks',
      filter: `clinic_id=eq.${options.clinicId}`,
      event: '*',
      onMessage: (payload) => {
        console.log('[v0] Task update received:', payload)

        setTasks((prev) => {
          if (payload.eventType === 'DELETE') {
            return prev.filter((t) => t.id !== payload.old?.id)
          }

          const updated = [...prev]
          const index = updated.findIndex(
            (t) => t.id === payload.new?.id || t.id === payload.old?.id
          )

          if (payload.new) {
            const newTask: TaskAssignment = {
              id: payload.new.id,
              title: payload.new.title,
              description: payload.new.description,
              patientId: payload.new.patient_id,
              assignedTo: payload.new.assigned_to,
              clinic_id: payload.new.clinic_id,
              status: payload.new.status,
              priority: payload.new.priority,
              dueDate: payload.new.due_date,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
              notes: payload.new.notes,
            }

            // Check if filtering applies
            if (
              options.userId &&
              newTask.assignedTo !== options.userId &&
              payload.eventType === 'INSERT'
            ) {
              return prev // Don't add if not assigned to current user
            }

            if (index >= 0) {
              updated[index] = newTask

              // Status change notifications
              if (payload.old?.status !== newTask.status) {
                if (newTask.status === 'completed') {
                  options.onTaskCompleted?.(newTask)
                } else {
                  options.onTaskUpdated?.(newTask)
                }
              } else {
                options.onTaskUpdated?.(newTask)
              }
            } else {
              updated.push(newTask)

              // New task assignment notification
              if (payload.eventType === 'INSERT') {
                options.onTaskAssigned?.(newTask)
                if (!notifiedTaskIds.current.has(newTask.id)) {
                  notifiedTaskIds.current.add(newTask.id)
                }
              }
            }
          } else if (index >= 0) {
            updated.splice(index, 1)
          }

          // Update unread count
          setUnreadCount(updated.filter((t) => t.status === 'pending').length)

          return updated
        })

        setLastUpdate(new Date())
      },
      onError: (err) => {
        setError(err)
        options.onError?.(err)
      },
    })

    channelRef.current = channel
    setIsConnected(!!channel)

    return () => {
      if (channelRef.current) {
        unsubscribeFromRealtime(channelRef.current).catch(console.error)
      }
    }
  }, [options.clinicId, options.userId, options])

  // Update task status
  const updateTaskStatus = useCallback(
    async (taskId: string, newStatus: TaskAssignment['status']) => {
      try {
        const supabase = createClient()
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', taskId)

        if (updateError) throw updateError

        // Local update for immediate feedback
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update task')
        setError(error)
        options.onError?.(error)
      }
    },
    [options]
  )

  // Update task
  const updateTask = useCallback(
    async (taskId: string, updates: Partial<TaskAssignment>) => {
      try {
        const supabase = createClient()
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', taskId)

        if (updateError) throw updateError

        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update task')
        setError(error)
        options.onError?.(error)
      }
    },
    [options]
  )

  return {
    tasks,
    isLoading,
    isConnected,
    error,
    lastUpdate,
    unreadCount,
    updateTaskStatus,
    updateTask,
    // Computed properties
    pendingCount: tasks.filter((t) => t.status === 'pending').length,
    inProgressCount: tasks.filter((t) => t.status === 'in-progress').length,
    completedCount: tasks.filter((t) => t.status === 'completed').length,
    highPriorityCount: tasks.filter(
      (t) => t.priority === 'high' && t.status !== 'completed'
    ).length,
  }
}
