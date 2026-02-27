import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

export type PurchaseOrder = Tables<'purchase_orders'>
export type PurchaseOrderInsert = TablesInsert<'purchase_orders'>
export type PurchaseOrderUpdate = TablesUpdate<'purchase_orders'>
export type PurchaseOrderItem = Tables<'purchase_order_items'>
export type PurchaseOrderItemInsert = TablesInsert<'purchase_order_items'>
export type PurchaseOrderWithRelations = PurchaseOrder & {
  supplier?: { id: string; name: string } | null
  location?: { id: string; name: string } | null
  user?: { id: string; name: string } | null
}
export type PurchaseOrderWithItems = PurchaseOrder & {
  items?: PurchaseOrderItem[]
}

export const createPurchaseOrderRepository = (
  client: BasePharmacySupabaseClient
) => {
  return {
    async getPurchaseOrdersByTenantId(
      tenantId: string
    ): Promise<PurchaseOrderWithRelations[]> {
      const { data, error } = await client
        .from('purchase_orders')
        .select(
          '*, supplier:suppliers(id, name), location:locations(id, name), user:profiles(id, name)'
        )
        .eq('tenant_id', tenantId)
        .order('issued_at', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data ?? []) as PurchaseOrderWithRelations[]
    },
    async getPurchaseOrdersBySupplierId(params: {
      tenantId: string
      supplierId: string
    }): Promise<PurchaseOrderWithRelations[]> {
      const { data, error } = await client
        .from('purchase_orders')
        .select(
          '*, supplier:suppliers(id, name), location:locations(id, name), user:profiles(id, name)'
        )
        .eq('tenant_id', params.tenantId)
        .eq('supplier_id', params.supplierId)
        .order('issued_at', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data ?? []) as PurchaseOrderWithRelations[]
    },
    async createPurchaseOrderWithItems(params: {
      order: PurchaseOrderInsert
      items: Array<Omit<PurchaseOrderItemInsert, 'purchase_order_id'>>
    }): Promise<PurchaseOrder> {
      const { data: order, error: orderError } = await client
        .from('purchase_orders')
        .insert(params.order)
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      if (params.items.length > 0) {
        const itemsPayload = params.items.map((item) => ({
          ...item,
          purchase_order_id: order.id,
          batch_code: item.batch_code ?? undefined,
          expiry_date: item.expiry_date ?? undefined,
          discount: item.discount ?? 0,
          quantity: item.quantity ?? 0,
          unit_price: item.unit_price ?? 0,
          product_unit_id: item.product_unit_id ?? null,
        }))

        const { error: itemsError } = await client
          .from('purchase_order_items')
          .insert(itemsPayload)

        if (itemsError) {
          throw itemsError
        }
      }

      return order as PurchaseOrder
    },
    async getPurchaseOrderByIdWithItems(params: {
      tenantId: string
      orderId: string
    }): Promise<PurchaseOrderWithItems | null> {
      const { data, error } = await client
        .from('purchase_orders')
        .select('*, items:purchase_order_items(*)')
        .eq('tenant_id', params.tenantId)
        .eq('id', params.orderId)
        .maybeSingle()

      if (error) {
        throw error
      }

      return (data ?? null) as PurchaseOrderWithItems | null
    },
    async updatePurchaseOrderWithItems(params: {
      orderId: string
      tenantId: string
      order: PurchaseOrderUpdate
      items: Array<Omit<PurchaseOrderItemInsert, 'purchase_order_id'>>
    }): Promise<PurchaseOrder> {
      const { data: existingOrder, error: existingOrderError } = await client
        .from('purchase_orders')
        .select('id, status')
        .eq('tenant_id', params.tenantId)
        .eq('id', params.orderId)
        .maybeSingle()

      if (existingOrderError) {
        throw existingOrderError
      }

      if (!existingOrder) {
        throw new Error('Không tìm thấy đơn nhập hàng.')
      }

      if (existingOrder.status !== '1_DRAFT') {
        throw new Error('Chỉ có thể chỉnh sửa đơn nháp.')
      }

      const { data: order, error: orderError } = await client
        .from('purchase_orders')
        .update(params.order)
        .eq('tenant_id', params.tenantId)
        .eq('id', params.orderId)
        .eq('status', '1_DRAFT')
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      const { error: deleteItemsError } = await client
        .from('purchase_order_items')
        .delete()
        .eq('tenant_id', params.tenantId)
        .eq('purchase_order_id', params.orderId)

      if (deleteItemsError) {
        throw deleteItemsError
      }

      if (params.items.length > 0) {
        const itemsPayload = params.items.map((item) => ({
          ...item,
          purchase_order_id: params.orderId,
          batch_code: item.batch_code ?? undefined,
          expiry_date: item.expiry_date ?? undefined,
          discount: item.discount ?? 0,
          quantity: item.quantity ?? 0,
          unit_price: item.unit_price ?? 0,
          product_unit_id: item.product_unit_id ?? null,
        }))

        const { error: itemsError } = await client
          .from('purchase_order_items')
          .insert(itemsPayload)

        if (itemsError) {
          throw itemsError
        }
      }

      return order as PurchaseOrder
    },
    async deletePurchaseOrder(params: {
      orderId: string
      tenantId: string
    }): Promise<void> {
      const { data: existingOrder, error: existingOrderError } = await client
        .from('purchase_orders')
        .select('id, status')
        .eq('tenant_id', params.tenantId)
        .eq('id', params.orderId)
        .maybeSingle()

      if (existingOrderError) {
        throw existingOrderError
      }

      if (!existingOrder) {
        throw new Error('Không tìm thấy đơn nhập hàng.')
      }

      if (existingOrder.status !== '1_DRAFT') {
        throw new Error('Chỉ có thể xóa đơn nháp.')
      }

      const { error: deleteItemsError } = await client
        .from('purchase_order_items')
        .delete()
        .eq('tenant_id', params.tenantId)
        .eq('purchase_order_id', params.orderId)

      if (deleteItemsError) {
        throw deleteItemsError
      }

      const { error: deleteOrderError } = await client
        .from('purchase_orders')
        .delete()
        .eq('tenant_id', params.tenantId)
        .eq('id', params.orderId)
        .eq('status', '1_DRAFT')

      if (deleteOrderError) {
        throw deleteOrderError
      }
    },
  }
}