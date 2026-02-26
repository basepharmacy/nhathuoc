import {
  createProfileRepository,
  createTenantRepository,
  createLocationRepository,
  createCategoryRepository,
} from '@/services/supabase'

import { supabaseAuth, supabaseClient } from '@/services/supabase'

export const profilesRepo = createProfileRepository(supabaseClient)
export const tenantsRepo = createTenantRepository(supabaseClient)
export const locationsRepo = createLocationRepository(supabaseClient)
export const categoriesRepo = createCategoryRepository(supabaseClient)
export const auth = supabaseAuth