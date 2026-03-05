import type { ProfileWithRelations } from '@/services/supabase/database/model'
import type { Enums } from '@/services/supabase/database.types'

export type StaffRole = Enums<'staff_role'>

export type StaffUser = ProfileWithRelations & {
  role?: StaffRole | null
}
