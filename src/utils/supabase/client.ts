import { createClient } from '@supabase/supabase-js'

// We will need to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const createClientComponentClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}
