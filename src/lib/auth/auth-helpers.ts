// Auth helper functions
// To use: Install Supabase first (npm install @supabase/ssr @supabase/supabase-js)

// Placeholder implementations until Supabase is set up

export async function getCurrentUser() {
  // Return null for now (demo mode)
  return null
}

export async function requireAuth() {
  // For demo mode, return a mock user
  return {
    id: "demo-user-id",
    email: "demo@tabibdesk.com",
  }
}

export async function signOut() {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

export async function signInWithEmail(_email: string, _password: string) {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

export async function signUpWithEmail(_email: string, _password: string) {
  throw new Error("Supabase not configured. Using demo mode for now.")
}

/*
// Real implementation (uncomment when Supabase is configured):

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}
*/
