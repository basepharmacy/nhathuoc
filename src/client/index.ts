import {
  createProfileRepository,
  createTenantRepository,
  createLocationRepository,
  createCategoryRepository,
  createSupplierRepository,
  createSupplierBankAccountRepository,
  createSupplierPaymentRepository,
  createCustomerRepository,
  createProductRepository,
  createPurchaseOrderRepository,
  createInventoryBatchRepository,
  createSaleOrderRepository,
  createBankAccountRepository,
  createStockAdjustmentRepository,
  createDashboardReportRepository,
  createUserAccountsRepository,
  createProductMasterRepository,
} from '@/services/supabase'

import { supabaseAuth, supabaseClient } from '@/services/supabase'

export const profilesRepo = createProfileRepository(supabaseClient)
export const tenantsRepo = createTenantRepository(supabaseClient)
export const locationsRepo = createLocationRepository(supabaseClient)
export const categoriesRepo = createCategoryRepository(supabaseClient)
export const suppliersRepo = createSupplierRepository(supabaseClient)
export const supplierBankAccountsRepo =
  createSupplierBankAccountRepository(supabaseClient)
export const supplierPaymentsRepo = createSupplierPaymentRepository(supabaseClient)
export const customersRepo = createCustomerRepository(supabaseClient)
export const productsRepo = createProductRepository(supabaseClient)
export const purchaseOrdersRepo = createPurchaseOrderRepository(supabaseClient)
export const inventoryBatchesRepo = createInventoryBatchRepository(supabaseClient)
export const saleOrdersRepo = createSaleOrderRepository(supabaseClient)
export const bankAccountsRepo = createBankAccountRepository(supabaseClient)
export const stockAdjustmentsRepo = createStockAdjustmentRepository(supabaseClient)
export const dashboardReportRepo = createDashboardReportRepository(supabaseClient)
export const userAccountsRepo = createUserAccountsRepository(supabaseClient)
export const productMastersRepo = createProductMasterRepository(supabaseClient)
export const auth = supabaseAuth