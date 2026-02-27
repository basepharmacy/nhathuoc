import {
  createProfileRepository,
  createTenantRepository,
  createLocationRepository,
  createCategoryRepository,
  createSupplierRepository,
  createSupplierPaymentRepository,
  createCustomerRepository,
  createProductRepository,
  createPurchaseOrderRepository,
  createInventoryBatchRepository,
} from '@/services/supabase'

import { supabaseAuth, supabaseClient } from '@/services/supabase'

export const profilesRepo = createProfileRepository(supabaseClient)
export const tenantsRepo = createTenantRepository(supabaseClient)
export const locationsRepo = createLocationRepository(supabaseClient)
export const categoriesRepo = createCategoryRepository(supabaseClient)
export const suppliersRepo = createSupplierRepository(supabaseClient)
export const supplierPaymentsRepo = createSupplierPaymentRepository(supabaseClient)
export const customersRepo = createCustomerRepository(supabaseClient)
export const productsRepo = createProductRepository(supabaseClient)
export const purchaseOrdersRepo = createPurchaseOrderRepository(supabaseClient)
export const inventoryBatchesRepo = createInventoryBatchRepository(supabaseClient)
export const auth = supabaseAuth