import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'
import type { Tenant } from '../repo/tenantsRepo'
import type { Location } from '../repo/locationsRepo'
import type { Supplier } from '../repo/suppliersRepo'
import type { SupplierBankAccount } from '../repo/supplierBankAccountsRepo'
import type { Customer } from '../repo/customersRepo'
import type { Product } from '../repo/productsRepo'
import type {
	PurchaseOrder,
	PurchaseOrderItem,
	PurchaseOrderWithRelations,
} from '../repo/purchaseOrdersRepo'
import type { InventoryBatch } from '../repo/inventoryBatchesRepo'

export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

export type { Tenant, Location }
export type { Supplier }
export type { SupplierBankAccount }
export type { Customer }
export type { Product }
export type { PurchaseOrder, PurchaseOrderItem }
export type { PurchaseOrderWithRelations }
export type { InventoryBatch }
