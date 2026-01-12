import { createClient } from '@supabase/supabase-js'

// Replace these strings with your actual values from Supabase
const supabaseUrl = 'https://ytilwerkyezrzwjskeut.supabase.co' 
const supabaseAnonKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0aWx3ZXJreWV6cnp3anNrZXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTQzMDgsImV4cCI6MjA4MzczMDMwOH0.PrS3n5bDo2bsCGg5thsCpRNE-5GlCE7rGIlEtmoLe20
export const supabase = createClient(supabaseUrl, supabaseAnonKey)