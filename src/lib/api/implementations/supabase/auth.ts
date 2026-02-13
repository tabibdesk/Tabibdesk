/**
 * Supabase auth repository - real implementation.
 * Uses Supabase Auth (getUser, signInWithPassword, signOut, signUp).
 */

import { createClient } from "@/lib/supabase/client"
import type { IAuthRepository, AuthUser } from "../../interfaces/auth.interface"
import { translateError } from "../../errors"

function toAuthUser(user: { id: string; email?: string | null }): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
  }
}

export class SupabaseAuthRepository implements IAuthRepository {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const supabase = createClient()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) {
        const msg = error.message?.toLowerCase() ?? ""
        if (
          msg.includes("session") &&
          (msg.includes("missing") || msg.includes("not found") || msg.includes("expired"))
        ) {
          return null
        }
        throw error
      }
      return user ? toAuthUser({ id: user.id, email: user.email }) : null
    } catch (error) {
      throw translateError(error)
    }
  }

  async signIn(email: string, password: string): Promise<{ user: AuthUser }> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (!data.user) throw new Error("No user returned")
      return { user: toAuthUser({ id: data.user.id, email: data.user.email }) }
    } catch (error) {
      throw translateError(error)
    }
  }

  async signOut(): Promise<void> {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (error) {
      throw translateError(error)
    }
  }

  async signUp(email: string, password: string): Promise<{ user: AuthUser }> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (!data.user) throw new Error("No user returned")
      return { user: toAuthUser({ id: data.user.id, email: data.user.email }) }
    } catch (error) {
      throw translateError(error)
    }
  }
}
