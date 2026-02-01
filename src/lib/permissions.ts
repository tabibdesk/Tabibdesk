/**
 * Permission Management Utilities
 *
 * These functions check if the current user has access to specific features.
 * For now, all permissions return true. Implement actual logic when auth is ready.
 */

export interface UserWithRole {
  role: string
  permissions?: string[]
}

export function canAccessReports(): boolean {
  // TODO: Implement actual permission logic
  // Example: return user.role === 'admin' || user.permissions.includes('reports')
  return true
}

export function canAccessSettings(): boolean {
  // TODO: Implement actual permission logic
  // Example: return user.role === 'admin' || user.permissions.includes('settings')
  return true
}

export function canCreateNew(): boolean {
  // TODO: Implement actual permission logic
  // Example: return user.permissions.includes('create')
  return true
}

/**
 * Refund action in Accounting: visible only if accounting module is enabled AND
 * user has permission accounting.refund (if RBAC exists) or role manager/assistant.
 */
export function canRefundAccounting(user: UserWithRole | null | undefined): boolean {
  if (!user) return false
  if (user.permissions?.includes("accounting.refund")) return true
  return user.role === "manager" || user.role === "assistant"
}

