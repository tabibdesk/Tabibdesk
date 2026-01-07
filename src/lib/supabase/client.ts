// Supabase client setup
// To use: npm install @supabase/ssr @supabase/supabase-js

/*
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
*/

// Placeholder implementation until Supabase is set up
export function createClient() {
  throw new Error("Supabase not configured. Install @supabase/ssr and @supabase/supabase-js first.")
}
