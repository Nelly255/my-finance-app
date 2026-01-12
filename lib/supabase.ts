import { createClient } from '@supabase/supabase-js'

// Try to get the real keys from the environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// If keys are missing (like during build), use placeholders to prevent crashing.
// If keys exist (like on the live site), use the real ones.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)