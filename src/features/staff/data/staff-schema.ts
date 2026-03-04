import type { ProfileWithRelations } from '@/services/supabase/database/model'

export type StaffRole = 'OWNER' | 'STAFF'

export type StaffUser = ProfileWithRelations & {
  role?: StaffRole | null
}
