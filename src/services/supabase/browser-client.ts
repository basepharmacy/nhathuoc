import { createAuthClient } from './auth'
import { createBasePharmacyClient } from './client'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Thiếu cấu hình Supabase. Hãy đặt VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabaseClient = createBasePharmacyClient(
  supabaseUrl,
  supabaseAnonKey,
  localStorage
)

export const supabaseAuth = createAuthClient(supabaseClient)
