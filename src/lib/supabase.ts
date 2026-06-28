import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// This client is used only for realtime subscriptions (a WebSocket). All reads
// and writes go through the direct REST layer in ./rest. Auth is disabled so the
// gotrue session machinery never runs in the browser.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
)
