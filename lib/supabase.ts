import { createClient } from '@supabase/supabase-js'

// We provide empty strings as fallbacks so the 'createClient' function 
// doesn't throw a "required" error during the build process.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)