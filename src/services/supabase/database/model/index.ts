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

export type SaleOrder = Tables<'sale_orders'>
export type SaleOrderInsert = TablesInsert<'sale_orders'>
export type SaleOrderUpdate = TablesUpdate<'sale_orders'>
export type SaleOrderItem = Tables<'sale_order_items'>
export type SaleOrderItemInsert = TablesInsert<'sale_order_items'>
export type SaleOrderItemWithRelation = SaleOrderItem & {
	batch: {
		id: string
		batch_code: string
		expiry_date: string
		quantity: number
		average_cost: number
	}
	product: {
		id: string
		product_name: string
	}
	product_unit: {
		id: string
		unit_name: string
	}
}
export type SaleOrderWithRelations = SaleOrder & {
	items: SaleOrderItemWithRelation[]
	customer?: { id: string; name: string } | null
	location?: { id: string; name: string, address?: string | null, phone?: string | null } | null
	user?: { id: string; name: string } | null
}
export type SaleOrderWithItems = SaleOrder & {
	items?: SaleOrderItem[]
}