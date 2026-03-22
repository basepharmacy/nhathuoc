import type { Tables, TablesInsert, TablesUpdate, Enums } from '../../database.types'
import type { Tenant } from '../repo/tenantsRepo'
import type { Location } from '../repo/locationsRepo'
import type { SupplierBankAccount } from '../repo/supplierBankAccountsRepo'
import type { InventoryBatch } from '../repo/inventoryBatchesRepo'

export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>
export type ProfileWithRelations = Profile & {
	tenant?: Tenant | null
	location?: Location | null
}

export type PurchaseOrder = Tables<'purchase_orders'>
export type PurchaseOrderInsert = TablesInsert<'purchase_orders'>
export type PurchaseOrderUpdate = TablesUpdate<'purchase_orders'>
export type PurchaseOrderItem = Tables<'purchase_order_items'>
export type PurchaseOrderItemInsert = TablesInsert<'purchase_order_items'>
export type PurchaseOrderStatus = Enums<'purchase_order_status'>
export type PurchaseOrderItemWithRelation = PurchaseOrderItem & {
	product: {
		id: string
		product_name: string
	}
	product_unit: {
		id: string
		unit_name: string
	} | null
}
export type PurchaseOrderDetailWithRelations = PurchaseOrder & {
	items: PurchaseOrderItemWithRelation[]
	supplier?: { id: string; name: string } | null
	location?: { id: string; name: string; address?: string | null; phone?: string | null } | null
	user?: { id: string; name: string } | null
}

export type { Tenant, Location }
export type { SupplierBankAccount }
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

// Product types
export type Product = Tables<'products'>
export type ProductInsert = TablesInsert<'products'>
export type ProductUpdate = TablesUpdate<'products'>
export type ProductUnit = Tables<'product_units'>
export type ProductUnitInsert = TablesInsert<'product_units'>
export type ProductUnitUpdate = TablesUpdate<'product_units'>
export type ProductWithUnits = Product & { product_units?: ProductUnit[] }
export type ProductStatus = Enums<'product_status'>


// Supplier types 
export type Supplier = Tables<'suppliers'>
export type SupplierInsert = TablesInsert<'suppliers'>
export type SupplierUpdate = TablesUpdate<'suppliers'>