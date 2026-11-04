import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabasePublishableKey)

let supabaseClient: SupabaseClient | undefined

export function getSupabaseClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.',
    )
  }

  supabaseClient ??= createClient(
    supabaseUrl,
    supabasePublishableKey,
  )

  return supabaseClient
}