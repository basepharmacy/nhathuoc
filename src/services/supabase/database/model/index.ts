import type { Tables, TablesInsert, TablesUpdate, Enums } from '../../database.types'
import type { Tenant } from '../repo/tenantsRepo'
import type { Location } from '../repo/locationsRepo'
import type { Supplier } from '../repo/suppliersRepo'
import type { SupplierBankAccount } from '../repo/supplierBankAccountsRepo'
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
export type ProfileWithRelations = Profile & {
	tenant?: Tenant | null
	location?: Location | null
}

export type { Tenant, Location }
export type { Supplier }
export type { SupplierBankAccount }
export type { Product }
export type { PurchaseOrder, PurchaseOrderItem }
export type { PurchaseOrderWithRelations }
export type { InventoryBatch }

export type Customer = Tables<'customers'>
export type CustomerInsert = TablesInsert<'customers'>
export type CustomerUpdate = TablesUpdate<'customers'>

export type SaleOrderStatus = Enums<'sale_order_status'>
